"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVideoImportRoutes = createVideoImportRoutes;
const express_1 = require("express");
const uuid_1 = require("uuid");
const VideoImportEntity_1 = require("../../../Core/Entity/VideoImportEntity");
const ProcessingStatusEnum_1 = require("../../../Core/Entity/ValueObject/ProcessingStatusEnum");
function createVideoImportRoutes(videoImportGateway) {
    const router = (0, express_1.Router)();
    router.post("/import", async (req, res) => {
        try {
            const { userId, videoId } = req.body;
            if (!userId || !videoId) {
                return res.status(400).json({ error: "Parâmetros userId e videoId são obrigatórios." });
            }
            const importEntity = new VideoImportEntity_1.VideoImportEntity(videoId, userId, ProcessingStatusEnum_1.ProcessingStatusEnum.PENDING, 0, "", new Date(), new Date(), null, (0, uuid_1.v4)());
            await videoImportGateway.create(importEntity);
            return res.status(200).json({ message: "Importação criada com sucesso", importId: importEntity.getImportId() });
        }
        catch (err) {
            console.error("[IMPORT] Erro ao criar importação:", err);
            return res.status(500).json({ error: "Erro interno ao criar importação" });
        }
    });
    return router;
}
