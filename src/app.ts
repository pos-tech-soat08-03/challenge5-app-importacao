import { Sequelize } from "sequelize"; // Adicione essa importação se necessário
import { VideoImportInterface } from "./Core/Interfaces/Gateway/VideoImportInterface";
import { MySQLConnection } from "./Infrastructure/DB/Impl/MySQLConnection";


const sequelizeInstance = new Sequelize({
  dialect: "mysql",
  host: process.env.DATABASE_HOST ?? "ERROR",
  port: Number(process.env.DATABASE_PORT ?? "0"),
  database: process.env.DATABASE_NAME ?? "ERROR",
  username: process.env.DATABASE_USER ?? "ERROR",
  password: process.env.DATABASE_PASS ?? "ERROR",
});


const videoImportGateway = {} as VideoImportInterface; 


const mysqlConnection = new MySQLConnection(
  {
    hostname: process.env.DATABASE_HOST ?? "ERROR",
    portnumb: Number(process.env.DATABASE_PORT ?? "0"),
    database: process.env.DATABASE_NAME ?? "ERROR",
    username: process.env.DATABASE_USER ?? "ERROR",
    password: process.env.DATABASE_PASS ?? "ERROR",
    databaseType: "mysql",
  },
  sequelizeInstance, 
  videoImportGateway 
);
