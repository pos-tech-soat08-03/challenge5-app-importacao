import { Sequelize, DataTypes, Model } from "sequelize";
import { ProcessingStatusEnum } from "../../Core/Entity/ValueObject/ProcessingStatusEnum";
import { SNSPublisher } from "../../Infrastructure/SQS_SNS/SNSPublisher";
class VideoProcessingModel extends Model {
    importId;
    importStatus;
    importStatusPercentage;
    videoId;
    userId;
    createdAt;
    updatedAt;
}
export class ProcessingImportGateway {
    dbconnection;
    sequelize;
    importGateway;
    snsPublisher;
    snsTopicArn;
    constructor(dbconnection, sequelize, importGateway) {
        this.dbconnection = dbconnection;
        this.sequelize = new Sequelize(this.dbconnection.database, this.dbconnection.username, this.dbconnection.password, {
            host: this.dbconnection.hostname,
            port: this.dbconnection.portnumb,
            dialect: this.dbconnection.databaseType,
        });
        this.importGateway = importGateway;
        this.snsPublisher = new SNSPublisher();
        this.snsTopicArn = process.env.AWS_SNS_VIDEO_IMPORT_TOPIC_ARN ?? "";
        VideoProcessingModel.init({
            importId: { type: DataTypes.TEXT, primaryKey: true },
            importStatus: { type: DataTypes.TEXT },
            importStatusPercentage: { type: DataTypes.INTEGER },
            videoId: { type: DataTypes.TEXT },
            userId: { type: DataTypes.TEXT },
            createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        }, {
            sequelize: this.sequelize,
            modelName: "VideoProcessingModel",
            tableName: "video_processing",
            timestamps: true,
        });
        this.sequelize.sync({ alter: true });
    }
    async processPendingImports() {
        const pendingImports = await this.importGateway.getVideoImportList(ProcessingStatusEnum.PENDING);
        if (!pendingImports)
            return;
        for (const importData of pendingImports) {
            try {
                console.log(`Processando importação ${importData.getImportId()}...`);
                await VideoProcessingModel.upsert({
                    importId: importData.getImportId(),
                    importStatus: ProcessingStatusEnum.IN_PROGRESS,
                    importStatusPercentage: 50,
                    videoId: importData.getVideoId(),
                    userId: importData.getUserId(),
                });
                await this.simulateProcessing(importData);
                importData.setImportStatus(ProcessingStatusEnum.COMPLETED);
                importData.setImportStatusPercentage(100);
                await this.importGateway.setVideoImportStatus(importData);
                await VideoProcessingModel.update({
                    importStatus: ProcessingStatusEnum.COMPLETED,
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
                importData.setImportStatus(ProcessingStatusEnum.FAILED);
                await this.importGateway.setVideoImportStatus(importData);
                await VideoProcessingModel.update({ importStatus: ProcessingStatusEnum.FAILED }, { where: { importId: importData.getImportId() } });
            }
        }
    }
    async simulateProcessing(importData) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
}
