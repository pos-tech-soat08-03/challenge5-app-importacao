"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessingImportGateway = void 0;
const sequelize_1 = require("sequelize");
const ProcessingStatusEnum_1 = require("../../Core/Entity/ValueObject/ProcessingStatusEnum");
const SNSPublisher_1 = require("../../Infrastructure/SQS_SNS/SNSPublisher");
class VideoProcessingModel extends sequelize_1.Model {
}
class ProcessingImportGateway {
    constructor(dbconnection, sequelize, importGateway) {
        var _a;
        this.dbconnection = dbconnection;
        this.sequelize = new sequelize_1.Sequelize(this.dbconnection.database, this.dbconnection.username, this.dbconnection.password, {
            host: this.dbconnection.hostname,
            port: this.dbconnection.portnumb,
            dialect: this.dbconnection.databaseType,
        });
        this.importGateway = importGateway;
        this.snsPublisher = new SNSPublisher_1.SNSPublisher();
        this.snsTopicArn = (_a = process.env.AWS_SNS_VIDEO_IMPORT_TOPIC_ARN) !== null && _a !== void 0 ? _a : "";
        VideoProcessingModel.init({
            importId: { type: sequelize_1.DataTypes.TEXT, primaryKey: true },
            importStatus: { type: sequelize_1.DataTypes.TEXT },
            importStatusPercentage: { type: sequelize_1.DataTypes.INTEGER },
            videoId: { type: sequelize_1.DataTypes.TEXT },
            userId: { type: sequelize_1.DataTypes.TEXT },
            createdAt: { type: sequelize_1.DataTypes.DATE, defaultValue: sequelize_1.DataTypes.NOW },
            updatedAt: { type: sequelize_1.DataTypes.DATE, defaultValue: sequelize_1.DataTypes.NOW },
        }, {
            sequelize: this.sequelize,
            modelName: "VideoProcessingModel",
            tableName: "video_processing",
            timestamps: true,
        });
        this.sequelize.sync({ alter: true });
    }
    async processPendingImports() {
        const pendingImports = await this.importGateway.getVideoImportList(ProcessingStatusEnum_1.ProcessingStatusEnum.PENDING);
        if (!pendingImports)
            return;
        for (const importData of pendingImports) {
            try {
                console.log(`Processando importação ${importData.getImportId()}...`);
                await VideoProcessingModel.upsert({
                    importId: importData.getImportId(),
                    importStatus: ProcessingStatusEnum_1.ProcessingStatusEnum.IN_PROGRESS,
                    importStatusPercentage: 50,
                    videoId: importData.getVideoId(),
                    userId: importData.getUserId(),
                });
                await this.simulateProcessing(importData);
                importData.setImportStatus(ProcessingStatusEnum_1.ProcessingStatusEnum.COMPLETED);
                importData.setImportStatusPercentage(100);
                await this.importGateway.setVideoImportStatus(importData);
                await VideoProcessingModel.update({
                    importStatus: ProcessingStatusEnum_1.ProcessingStatusEnum.COMPLETED,
                    importStatusPercentage: 100,
                }, {
                    where: { importId: importData.getImportId() },
                });
                console.log(`Importação ${importData.getImportId()} concluída.`);
                //✅ Enviar evento para o SNS
                await this.snsPublisher.publishToTopic(this.snsTopicArn, JSON.stringify({
                    importId: importData.getImportId(),
                    videoId: importData.getVideoId(),
                    userId: importData.getUserId(),
                    status: "COMPLETED",
                    processedAt: new Date().toISOString(),
                }));
            }
            catch (error) {
                console.error(`Erro ao processar importação ${importData.getImportId()}:`, error);
                importData.setImportStatus(ProcessingStatusEnum_1.ProcessingStatusEnum.FAILED);
                await this.importGateway.setVideoImportStatus(importData);
                await VideoProcessingModel.update({ importStatus: ProcessingStatusEnum_1.ProcessingStatusEnum.FAILED }, { where: { importId: importData.getImportId() } });
            }
        }
    }
    async simulateProcessing(importData) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
}
exports.ProcessingImportGateway = ProcessingImportGateway;
