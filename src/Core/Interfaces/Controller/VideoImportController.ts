import express, { Request, Response } from "express";
import busboy from "busboy";
import fs from "fs";
import path from "path";
import os from "os";
import { validateVideoFileWithFFmpeg } from "../../Utils/validateVideoFile";
import { uploadVideoToS3 } from "../../../Infrastructure/S3/uploadToS3";
import { VideoImportEntity } from "../../../Core/Entity/VideoImportEntity";
import { ProcessingStatusEnum } from "../../../Core/Entity/ValueObject/ProcessingStatusEnum";
import { v4 as uuidv4 } from "uuid";
import { SnsVideoPublisher } from "../../../Infrastructure/SQS_SNS/SnsVideoPublisher";

export function createVideoImportRoutes(snsPublisher: SnsVideoPublisher) {
    const router = express.Router();

    // Recupera o ARN do tópico SNS do .env
    const topicArn = process.env.AWS_SNS_VIDEO_IMPORT_TOPIC_ARN;
    if (!topicArn) {
        throw new Error("ARN do tópico SNS não definido. Verifique AWS_SNS_VIDEO_IMPORT_TOPIC_ARN no .env.");
    }

    router.post("/import", async (req: Request, res: Response): Promise<void> => {
        const bb = busboy({ headers: req.headers });

        let userId = "";
        let videoId = "";
        let originalFileName = "";
        let fileSize = 0;
        let tempFilePath = "";

        bb.on("file", (_fieldname, file, info) => {
            originalFileName = info.filename;
            const tmpDir = os.tmpdir();
            const tmpName = `${uuidv4()}-${originalFileName}`;
            tempFilePath = path.join(tmpDir, tmpName);

            const writeStream = fs.createWriteStream(tempFilePath);
            file.pipe(writeStream);

            file.on("data", (data) => {
                fileSize += data.length;
            });

            file.on("end", () => {
                writeStream.end();
            });
        });

        bb.on("field", (fieldname, val) => {
            if (fieldname === "userId") userId = val;
            if (fieldname === "videoId") videoId = val;
        });

        bb.on("finish", async () => {
            try {
                // Validação dos campos obrigatórios
                if (!userId || !videoId || !tempFilePath || !originalFileName) {
                    res.status(400).json({ error: "Campos obrigatórios ausentes: userId, videoId ou arquivo." });
                    return;
                }

                // Validação com FFmpeg
                try {
                    await validateVideoFileWithFFmpeg(tempFilePath, originalFileName, fileSize);
                } catch (err: any) {
                    console.error("[FFMPEG VALIDATION ERROR]", err);
                    res.status(400).json({ error: "Erro na validação do vídeo." });
                    return;
                }

                // Upload no S3
                let videoUrl = "";
                try {
                    videoUrl = await uploadVideoToS3(tempFilePath, originalFileName);
                } catch (err: any) {
                    console.error("[S3 UPLOAD ERROR]", err);
                    res.status(500).json({ error: "Erro ao fazer upload para o S3." });
                    return;
                }

                // Criação da entidade de importação
                const importEntity = new VideoImportEntity(
                    videoId,
                    userId,
                    ProcessingStatusEnum.PENDING,
                    0,
                    videoUrl,
                    new Date(),
                    new Date(),
                    null,
                    uuidv4()
                );

                // Publica no SNS
                try {
                    await snsPublisher.publish(importEntity);
                } catch (err: any) {
                    console.error("[SNS PUBLISH ERROR]", err);
                    res.status(500).json({ error: "Erro ao publicar no SNS." });
                    return;
                }

                res.status(201).json({
                    message: "Vídeo validado, enviado para o S3 e importação iniciada com sucesso.",
                    importId: importEntity.getImportId(),
                    s3Url: videoUrl
                });
            } catch (err: any) {
                console.error("[IMPORT ERROR]", err);
                res.status(500).json({ error: "Erro inesperado durante a importação." });
            } finally {
                // Limpeza do arquivo temporário
                if (tempFilePath && fs.existsSync(tempFilePath)) {
                    fs.unlink(tempFilePath, () => { });
                }
            }
        });

        req.pipe(bb);
    });

    return router;
}
