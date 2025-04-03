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
    }

    public async processPendingImports(): Promise<void> {
        const pendingImports = await this.importGateway.getVideoImportList(ProcessingStatusEnum.PENDING);
        if (!pendingImports) return;

        for (const importData of pendingImports) {
            try {
                console.log(`Processando importação ${importData.getImportId()}...`);
                
                
                importData.setImportStatus(ProcessingStatusEnum.IN_PROGRESS);
                importData.setImportStatusPercentage(50);
                await this.importGateway.setVideoImportStatus(importData);
                await this.ProcessingImportGateway(importData);
                
                
                await this.simulateProcessing(importData);

                
                importData.setImportStatus(ProcessingStatusEnum.COMPLETED);
                importData.setImportStatusPercentage(100);
                await this.importGateway.setVideoImportStatus(importData);
                await this.ProcessingImportGateway(importData);

                console.log(`Importação ${importData.getImportId()} concluída.`);
            } catch (error) {
                console.error(`Erro ao processar importação ${importData.getImportId()}:`, error);
                importData.setImportStatus(ProcessingStatusEnum.FAILED);
                await this.importGateway.setVideoImportStatus(importData);
                await this.ProcessingImportGateway(importData);
            }
        }
    }

    private async simulateProcessing(importData: VideoImportEntity): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulação de tempo de processamento
    }

    private async ProcessingImportGateway(importData: VideoImportEntity): Promise<void> {
        try {
            await axios.post(this.statusEndpoint, {
                importId: importData.getImportId(),
                status: importData.getImportStatus(),
                timestamp: new Date(),
            });
            console.log(`Status da importação ${importData.getImportId()} enviado com sucesso.`);
        } catch (error) {
            console.error(`Erro ao postar status da importação ${importData.getImportId()}:`, error);
        }
    }
}
