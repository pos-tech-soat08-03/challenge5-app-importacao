import { VideoProcessingGateway } from "../../../Application/Gateway/ProcessingVideoGateway";
export class MySQLConnection {
    gateways;
    dbConnection;
    sequelize;
    constructor(dbConnection, sequelizeInstance, videoImportGateway) {
        this.dbConnection = dbConnection;
        this.sequelize = sequelizeInstance;
        this.gateways = {
            processingImportGateway: new VideoProcessingGateway(this.dbConnection, this.sequelize, videoImportGateway),
        };
    }
}
