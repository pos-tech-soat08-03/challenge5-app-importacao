"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLConnection = void 0;
const ProcessingVideoGateway_1 = require("../../../Application/Gateway/ProcessingVideoGateway");
class MySQLConnection {
    constructor(dbConnection, sequelizeInstance, videoImportGateway) {
        this.dbConnection = dbConnection;
        this.sequelize = sequelizeInstance;
        this.gateways = {
            processingImportGateway: new ProcessingVideoGateway_1.VideoProcessingGateway(this.dbConnection, this.sequelize, videoImportGateway),
        };
    }
}
exports.MySQLConnection = MySQLConnection;
