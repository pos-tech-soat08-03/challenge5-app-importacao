import { Sequelize, Model } from "sequelize";
import { ProcessingStatusEnum } from "../../Core/Entity/ValueObject/ProcessingStatusEnum";
import axios from "axios";
class VideoProcessingModel extends Model {
    importId;
    importStatus;
    importStatusPercentage;
    videoId;
    userId;
}
export class VideoProcessingGateway {
    dbconnection;
    sequelize;
    statusEndpoint = "http://outro-servico/status";
    importGateway;
    constructor(dbconnection, sequelize, importGateway) {
        this.dbconnection = dbconnection;
        this.sequelize = new Sequelize(this.dbconnection.database, this.dbconnection.username, this.dbconnection.password, {
            host: this.dbconnection.hostname,
            port: this.dbconnection.portnumb,
            dialect: this.dbconnection.databaseType,
        });
        this.importGateway = importGateway;
    }
    async processPendingImports() {
        const pendingImports = await this.importGateway.getVideoImportList(ProcessingStatusEnum.PENDING);
        if (!pendingImports)
            return;
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
            }
            catch (error) {
                console.error(`Erro ao processar importação ${importData.getImportId()}:`, error);
                importData.setImportStatus(ProcessingStatusEnum.FAILED);
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
            await axios.post(this.statusEndpoint, {
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
