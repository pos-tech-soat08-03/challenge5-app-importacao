"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoProcessingGateway = void 0;
const sequelize_1 = require("sequelize");
const ProcessingStatusEnum_1 = require("../../Core/Entity/ValueObject/ProcessingStatusEnum");
const axios_1 = __importDefault(require("axios"));
class VideoProcessingModel extends sequelize_1.Model {
    importId;
    importStatus;
    importStatusPercentage;
    videoId;
    userId;
}
class VideoProcessingGateway {
    dbconnection;
    sequelize;
    statusEndpoint = "http://outro-servico/status";
    importGateway;
    constructor(dbconnection, sequelize, importGateway) {
        this.dbconnection = dbconnection;
        this.sequelize = new sequelize_1.Sequelize(this.dbconnection.database, this.dbconnection.username, this.dbconnection.password, {
            host: this.dbconnection.hostname,
            port: this.dbconnection.portnumb,
            dialect: this.dbconnection.databaseType,
        });
        this.importGateway = importGateway;
    }
    async processPendingImports() {
        const pendingImports = await this.importGateway.getVideoImportList(ProcessingStatusEnum_1.ProcessingStatusEnum.PENDING);
        if (!pendingImports)
            return;
        for (const importData of pendingImports) {
            try {
                console.log(`Processando importação ${importData.getImportId()}...`);
                importData.setImportStatus(ProcessingStatusEnum_1.ProcessingStatusEnum.IN_PROGRESS);
                importData.setImportStatusPercentage(50);
                await this.importGateway.setVideoImportStatus(importData);
                await this.ProcessingImportGateway(importData);
                await this.simulateProcessing(importData);
                importData.setImportStatus(ProcessingStatusEnum_1.ProcessingStatusEnum.COMPLETED);
                importData.setImportStatusPercentage(100);
                await this.importGateway.setVideoImportStatus(importData);
                await this.ProcessingImportGateway(importData);
                console.log(`Importação ${importData.getImportId()} concluída.`);
            }
            catch (error) {
                console.error(`Erro ao processar importação ${importData.getImportId()}:`, error);
                importData.setImportStatus(ProcessingStatusEnum_1.ProcessingStatusEnum.FAILED);
                await this.importGateway.setVideoImportStatus(importData);
                await this.ProcessingImportGateway(importData);
            }
        }
    }
    async simulateProcessing(importData) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulação de tempo de processamento
    }
    async ProcessingImportGateway(importData) {
        try {
            await axios_1.default.post(this.statusEndpoint, {
                importId: importData.getImportId(),
                status: importData.getImportStatus(),
                timestamp: new Date(),
            });
            console.log(`Status da importação ${importData.getImportId()} enviado com sucesso.`);
        }
        catch (error) {
            console.error(`Erro ao postar status da importação ${importData.getImportId()}:`, error);
        }
    }
}
exports.VideoProcessingGateway = VideoProcessingGateway;
