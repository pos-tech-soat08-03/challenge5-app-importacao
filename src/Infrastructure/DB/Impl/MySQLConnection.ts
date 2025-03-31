import { IDbConnection } from "../../../Core/Interfaces/IDbConnection";
import { Gateways } from "../../../Core/Types/Gateways";
import { ConnectionInfo } from "../../../Core/Types/ConnectionInfo";
import { ProcessingImportGateway } from "../../../Application/Gateway/ProcessingImportGateway";
import { VideoImportInterface } from "../../../Core/Interfaces/Gateway/VideoImportInterface";

export class MySQLConnection implements IDbConnection {
  readonly gateways: Gateways;
  readonly dbConnection: ConnectionInfo;
  readonly sequelize: any;
  constructor(dbConnection: ConnectionInfo) {
    this.dbConnection = dbConnection;
    this.gateways = {
      processingStatusGateway: new ProcessingImportGateway(this.dbConnection, this.sequelize, {} as VideoImportInterface),
    };
  }
}
