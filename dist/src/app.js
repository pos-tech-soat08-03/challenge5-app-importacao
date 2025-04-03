"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize"); // Adicione essa importação se necessário
const MySQLConnection_1 = require("./Infrastructure/DB/Impl/MySQLConnection");
const sequelizeInstance = new sequelize_1.Sequelize({
    dialect: "mysql",
    host: process.env.DATABASE_HOST ?? "ERROR",
    port: Number(process.env.DATABASE_PORT ?? "0"),
    database: process.env.DATABASE_NAME ?? "ERROR",
    username: process.env.DATABASE_USER ?? "ERROR",
    password: process.env.DATABASE_PASS ?? "ERROR",
});
const videoImportGateway = {};
const mysqlConnection = new MySQLConnection_1.MySQLConnection({
    hostname: process.env.DATABASE_HOST ?? "ERROR",
    portnumb: Number(process.env.DATABASE_PORT ?? "0"),
    database: process.env.DATABASE_NAME ?? "ERROR",
    username: process.env.DATABASE_USER ?? "ERROR",
    password: process.env.DATABASE_PASS ?? "ERROR",
    databaseType: "mysql",
}, sequelizeInstance, videoImportGateway);
