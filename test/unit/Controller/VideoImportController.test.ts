import request from "supertest";
import express from "express";
import fs from "fs";
import path from "path";
import { validateVideoFileWithFFmpeg } from "../../../src/Core/Utils/validateVideoFile";
import { uploadVideoToS3 } from "../../../src/Infrastructure/S3/uploadToS3";
import { createVideoImportRoutes } from "../../../src/Core/Interfaces/Controller/VideoImportController";
import { SnsVideoPublisher } from "../../../src/Infrastructure/SQS_SNS/SnsVideoPublisher";

// Mocks
jest.mock("../../../src/Core/Utils/validateVideoFile");
jest.mock("../../../src/Infrastructure/S3/uploadToS3");

jest.mock("fluent-ffmpeg", () => ({
    ffprobe: jest.fn((filePath, callback) => {
        callback(null, { format: { duration: 200 } });
    }),
    setFfmpegPath: jest.fn(),
    setFfprobePath: jest.fn(),
}));

jest.mock("@aws-sdk/client-s3", () => ({
    S3Client: jest.fn().mockImplementation(() => ({
        send: jest.fn().mockResolvedValue({
            Contents: [{ Size: 1000000000 }, { Size: 2000000000 }],
        }),
    })),
    ListObjectsV2Command: jest.fn(),
}));

const mockUpload = uploadVideoToS3 as jest.Mock;
const mockValidate = validateVideoFileWithFFmpeg as jest.Mock;
const mockUnlink = jest.spyOn(fs, "unlink").mockImplementation((_, cb) => cb?.(null));

describe("VideoImportController", () => {
    let app: express.Express;
    let snsPublisherMock: SnsVideoPublisher;

    jest.setTimeout(100000);

    beforeEach(() => {
        snsPublisherMock = {
            publish: jest.fn().mockResolvedValue(undefined),
        } as any;

        process.env.AWS_SNS_VIDEO_IMPORT_TOPIC_ARN = "arn:aws:sns:us-east-1:123456789012:VideoImportTopic";

        app = express();
        app.use("/", createVideoImportRoutes(snsPublisherMock));
    });

    it("deve importar o vídeo com sucesso", async () => {
        const testFilePath = path.join(__dirname, "__mocks__", "sample-video.mp4");
        const testUserId = "123";
        const testVideoId = "456";

        expect(fs.existsSync(testFilePath)).toBe(true);

        mockUpload.mockResolvedValue("https://s3.amazonaws.com/bucket/sample-video.mp4");
        mockValidate.mockResolvedValue(true);

        const response = await request(app)
            .post("/import")
            .field("userId", testUserId)
            .field("videoId", testVideoId)
            .attach("file", testFilePath);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("importId");
        expect(response.body).toHaveProperty("s3Url", "https://s3.amazonaws.com/bucket/sample-video.mp4");
        expect(snsPublisherMock.publish).toHaveBeenCalledTimes(1);
        expect(mockUnlink).toHaveBeenCalled();
    });

    it("deve retornar erro se campos obrigatórios faltarem", async () => {
        const testFilePath = path.join(__dirname, "__mocks__", "sample-video.mp4");

        const response = await request(app)
            .post("/import")
            .attach("file", testFilePath);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("Campos obrigatórios");
    });

    it("deve lidar com erro do FFmpeg", async () => {
        const testFilePath = path.join(__dirname, "__mocks__", "sample-video.mp4");
        expect(fs.existsSync(testFilePath)).toBe(true);

        mockValidate.mockRejectedValue(new Error("Arquivo inválido"));

        const response = await request(app)
            .post("/import")
            .field("userId", "123")
            .field("videoId", "456")
            .attach("file", testFilePath);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Erro na validação do vídeo.");
        expect(mockUnlink).toHaveBeenCalled();
    });

    it("deve retornar erro 500 se falhar o upload para o S3", async () => {
        const testFilePath = path.join(__dirname, "__mocks__", "sample-video.mp4");

        mockValidate.mockResolvedValue(true);
        mockUpload.mockRejectedValue(new Error("Erro no upload S3"));

        const response = await request(app)
            .post("/import")
            .field("userId", "123")
            .field("videoId", "456")
            .attach("file", testFilePath);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("error", "Erro ao fazer upload para o S3.");
        expect(mockUnlink).toHaveBeenCalled();
    });

    it("deve retornar erro 500 se falhar a publicação no SNS", async () => {
        const testFilePath = path.join(__dirname, "__mocks__", "sample-video.mp4");

        mockValidate.mockResolvedValue(true);
        mockUpload.mockResolvedValue("https://s3.amazonaws.com/bucket/sample-video.mp4");
        snsPublisherMock.publish = jest.fn().mockRejectedValue(new Error("Erro SNS"));

        const response = await request(app)
            .post("/import")
            .field("userId", "123")
            .field("videoId", "456")
            .attach("file", testFilePath);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("error", "Erro ao publicar no SNS.");
        expect(mockUnlink).toHaveBeenCalled();
    });

    it("deve retornar erro 500 em exceção inesperada no setup", () => {
        const originalEnv = process.env.AWS_SNS_VIDEO_IMPORT_TOPIC_ARN;
        delete process.env.AWS_SNS_VIDEO_IMPORT_TOPIC_ARN;

        expect(() => {
            createVideoImportRoutes(snsPublisherMock);
        }).toThrow("ARN do tópico SNS não definido");

        process.env.AWS_SNS_VIDEO_IMPORT_TOPIC_ARN = originalEnv;
    });
});