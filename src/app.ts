import "dotenv/config";
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });
console.log("🔍 SNS TOPIC ARN:", process.env.AWS_SNS_VIDEO_IMPORT_TOPIC_ARN); // Adicione isso logo após o import
import express from "express";
import { createVideoImportRoutes } from "./Core/Interfaces/Controller/VideoImportController";
import { Sequelize } from "sequelize";
import { SnsVideoPublisher } from "./Infrastructure/SQS_SNS/SnsVideoPublisher";
// import { VideoImportInterface } from "./Core/Interfaces/Gateway/VideoImportInterface";
// import { MySQLConnection } from "./Infrastructure/DB/Impl/MySQLConnection"; // Deixe comentado até ser usado

const app = express();

// Conexão com o banco de dados (MySQL)
const sequelizeInstance = new Sequelize({
  dialect: "mysql",
  host: process.env.DATABASE_HOST ?? "ERROR",
  port: Number(process.env.DATABASE_PORT ?? "0"),
  database: process.env.DATABASE_NAME ?? "ERROR",
  username: process.env.DATABASE_USER ?? "ERROR",
  password: process.env.DATABASE_PASS ?? "ERROR",
});

// Instância do publicador SNS com o ARN do tópico definido no .env
//const snsPublisher = new SnsVideoPublisher(process.env.AWS_SNS_VIDEO_IMPORT_TOPIC_ARN ?? "aws_sns_topic.sns-canal-de-processamento.arn");
const snsPublisher = new SnsVideoPublisher(process.env.AWS_SNS_VIDEO_IMPORT_TOPIC_ARN!);

// Rota principal de importação de vídeo
app.use("/videos", createVideoImportRoutes(snsPublisher));

// Inicializa o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
});

/*
 * ⚠️ Quando for usar o MySQLConnection, descomente e implemente corretamente:
 *
 * const videoImportGateway = {} as VideoImportInterface;
 * const mysqlConnection = new MySQLConnection(
 *   {
 *     hostname: process.env.DATABASE_HOST ?? "ERROR",
 *     portnumb: Number(process.env.DATABASE_PORT ?? "0"),
 *     database: process.env.DATABASE_NAME ?? "ERROR",
 *     username: process.env.DATABASE_USER ?? "ERROR",
 *     password: process.env.DATABASE_PASS ?? "ERROR",
 *     databaseType: "mysql",
 *   },
 *   sequelizeInstance,
 *   videoImportGateway
 * );
 */
