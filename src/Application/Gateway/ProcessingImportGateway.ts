import { Sequelize, DataTypes, Model } from "sequelize";
import { ConnectionInfo } from "../../Core/Types/ConnectionInfo";
import { VideoImportEntity } from "../../Core/Entity/VideoImportEntity";
import { VideoImportInterface } from "../../Core/Interfaces/Gateway/VideoImportInterface";
import { ProcessingStatusEnum } from "../../Core/Entity/ValueObject/ProcessingStatusEnum";
import axios from "axios";

class VideoProcessingModel extends Model {
    public importId!: string;
    public importStatus!: string;
    public importStatusPercentage!: number;
    public videoId!: string;
    public userId!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
}

export class VideoProcessingGateway {
    private readonly sequelize: Sequelize;
    private readonly statusEndpoint: string = "http://outro-servico/status";
    private readonly importGateway: VideoImportInterface;

    constructor(
        private readonly dbconnection: ConnectionInfo,
        sequelize: Sequelize,
        importGateway: VideoImportInterface
    ) {
        this.sequelize = new Sequelize(
            this.dbconnection.database,
            this.dbconnection.username,
            this.dbconnection.password,
            {
                host: this.dbconnection.hostname,
                port: this.dbconnection.portnumb,
                dialect: this.dbconnection.databaseType,
            }
        );

        this.importGateway = importGateway;

        VideoProcessingModel.init(
            {
                importId: { type: DataTypes.TEXT, primaryKey: true },
                importStatus: { type: DataTypes.TEXT },
                importStatusPercentage: { type: DataTypes.INTEGER },
                videoId: { type: DataTypes.TEXT },
                userId: { type: DataTypes.TEXT },
                createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
                updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
            },
            {
                sequelize: this.sequelize,
                modelName: "VideoProcessingModel",
                tableName: "video_processing",
                timestamps: true,
            }
        );

        this.sequelize.sync({ alter: true });
    }

    public async processPendingImports(): Promise<void> {
        const pendingImports = await this.importGateway.getVideoImportList(ProcessingStatusEnum.PENDING);
        if (!pendingImports) return;

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
                await VideoProcessingModel.update(
                    { importStatus: ProcessingStatusEnum.COMPLETED, importStatusPercentage: 100 },
                    { where: { importId: importData.getImportId() } }
                );

                console.log(`Importação ${importData.getImportId()} concluída.`);
            } catch (error) {
                console.error(`Erro ao processar importação ${importData.getImportId()}:`, error);
                importData.setImportStatus(ProcessingStatusEnum.FAILED);
                await this.importGateway.setVideoImportStatus(importData);
                await VideoProcessingModel.update(
                    { importStatus: ProcessingStatusEnum.FAILED },
                    { where: { importId: importData.getImportId() } }
                );
            }
        }
    }

    private async simulateProcessing(importData: VideoImportEntity): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
}
