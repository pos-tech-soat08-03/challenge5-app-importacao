"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const sequelize_1 = require("sequelize"); // Adicione essa importação se necessário
const MySQLConnection_1 = require("./Infrastructure/DB/Impl/MySQLConnection");
const sequelizeInstance = new sequelize_1.Sequelize({
    dialect: "mysql",
    host: (_a = process.env.DATABASE_HOST) !== null && _a !== void 0 ? _a : "ERROR",
    port: Number((_b = process.env.DATABASE_PORT) !== null && _b !== void 0 ? _b : "0"),
    database: (_c = process.env.DATABASE_NAME) !== null && _c !== void 0 ? _c : "ERROR",
    username: (_d = process.env.DATABASE_USER) !== null && _d !== void 0 ? _d : "ERROR",
    password: (_e = process.env.DATABASE_PASS) !== null && _e !== void 0 ? _e : "ERROR",
});
const videoImportGateway = {};
const mysqlConnection = new MySQLConnection_1.MySQLConnection({
    hostname: (_f = process.env.DATABASE_HOST) !== null && _f !== void 0 ? _f : "ERROR",
    portnumb: Number((_g = process.env.DATABASE_PORT) !== null && _g !== void 0 ? _g : "0"),
    database: (_h = process.env.DATABASE_NAME) !== null && _h !== void 0 ? _h : "ERROR",
    username: (_j = process.env.DATABASE_USER) !== null && _j !== void 0 ? _j : "ERROR",
    password: (_k = process.env.DATABASE_PASS) !== null && _k !== void 0 ? _k : "ERROR",
    databaseType: "mysql",
}, sequelizeInstance, videoImportGateway);
