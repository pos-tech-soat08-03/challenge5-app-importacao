import express from "express";
import busboy from "busboy";
import fs from "fs";
import path from "path";
import os from "os";
import { validateVideoFileWithFFmpeg } from "../../Utils/validateVideoFile";
import { uploadVideoToS3 } from "../../../Infrastructure/S3/uploadToS3";
import { VideoImportEntity } from "../../../Core/Entity/VideoImportEntity";
import { ProcessingStatusEnum } from "../../../Core/Entity/ValueObject/ProcessingStatusEnum";
import { v4 as uuidv4 } from "uuid";
export function createVideoImportRoutes(snsPublisher) {
    const router = express.Router();
    // Recupera o ARN do tópico SNS do .env
    const topicArn = process.env.AWS_SNS_VIDEO_IMPORT_TOPIC_ARN;
    if (!topicArn) {
        throw new Error("ARN do tópico SNS não definido. Verifique AWS_SNS_VIDEO_IMPORT_TOPIC_ARN no .env.");
    }
    // Instancia o publisher com o ARN carregado do .env
    //const snsPublisher = new SnsVideoPublisher(topicArn);
    router.post("/import", async (req, res) => {
        try {
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
                if (fieldname === "userId")
                    userId = val;
                if (fieldname === "videoId")
                    videoId = val;
            });
            bb.on("finish", async () => {
                try {
                    if (!userId || !videoId || !tempFilePath || !originalFileName) {
                        res.status(400).json({ error: "Campos obrigatórios ausentes: userId, videoId ou arquivo." });
                        return;
                    }
                    // Validação com FFmpeg
                    await validateVideoFileWithFFmpeg(tempFilePath, originalFileName, fileSize);
                    // Upload no S3
                    const videoUrl = await uploadVideoToS3(tempFilePath, originalFileName);
                    // Criação da entidade
                    const importEntity = new VideoImportEntity(videoId, userId, ProcessingStatusEnum.PENDING, 0, videoUrl, new Date(), new Date(), null, uuidv4());
                    // Publica no SNS
                    await snsPublisher.publish(importEntity);
                    res.status(201).json({
                        message: "Vídeo validado, enviado para o S3 e importação iniciada com sucesso.",
                        importId: importEntity.getImportId(),
                        s3Url: videoUrl
                    });
                }
                catch (err) {
                    console.error("[IMPORT ERROR]", err);
                    res.status(400).json({ error: err.message || "Erro ao processar o vídeo." });
                }
                finally {
                    // Limpa o arquivo local
                    if (tempFilePath && fs.existsSync(tempFilePath)) {
                        fs.unlink(tempFilePath, () => { });
                    }
                }
            });
            req.pipe(bb);
        }
        catch (error) {
            console.error("[IMPORT BUSBOY ERROR]", error);
            res.status(500).json({ error: error.message || "Erro inesperado durante a importação." });
        }
    });
    return router;
}
