import { IDbConnection } from "../../../Core/Interfaces/IDbConnection";
import { Gateways } from "../../../Core/Types/Gateways";
import { ConnectionInfo } from "../../../Core/Types/ConnectionInfo";
import { VideoImportInterface } from "../../../Core/Interfaces/Gateway/VideoImportInterface";
import { VideoProcessingGateway } from "../../../Application/Gateway/ProcessingVideoGateway";

export class MySQLConnection implements IDbConnection {
  readonly gateways: Gateways;
  readonly dbConnection: ConnectionInfo;
  readonly sequelize: any;

  

  constructor(dbConnection: ConnectionInfo, sequelizeInstance: any, videoImportGateway: VideoImportInterface) {
    this.dbConnection = dbConnection;
    this.sequelize = sequelizeInstance;
    this.gateways = {
      processingImportGateway: new VideoProcessingGateway(this.dbConnection, this.sequelize, videoImportGateway),
    };
  }
}
