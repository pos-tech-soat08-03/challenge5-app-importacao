import { IDbConnection } from "../../../Core/Interfaces/IDbConnection";
import { Gateways } from "../../../Core/Types/Gateways";
import { ConnectionInfo } from "../../../Core/Types/ConnectionInfo";
import { ProcessingStatusGateway } from "../../../Application/Gateway/ProcessingStatusGateway";

export class MySQLConnection implements IDbConnection {
  readonly gateways: Gateways;
  readonly dbConnection: ConnectionInfo;
  readonly sequelize: any; // Add the sequelize property with appropriate type
  constructor(dbConnection: ConnectionInfo) {
    this.dbConnection = dbConnection;
    this.gateways = {
      processingStatusGateway: new ProcessingStatusGateway(this.dbConnection, this.sequelize),
    };
  }
}
