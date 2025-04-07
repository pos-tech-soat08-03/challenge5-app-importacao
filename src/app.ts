import "dotenv/config";
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });
console.log("🔍 SNS TOPIC ARN:", process.env.AWS_SNS_VIDEO_IMPORT_TOPIC_ARN);
import express, { Request, Response, RequestHandler } from "express";
import { createVideoImportRoutes } from "./Core/Interfaces/Controller/VideoImportController";
import { Sequelize } from "sequelize";
import { SnsVideoPublisher } from "./Infrastructure/SQS_SNS/SnsVideoPublisher";
import { VideoImportEntity } from "./Core/Entity/VideoImportEntity";
import { ProcessingStatusEnum } from "./Core/Entity/ValueObject/ProcessingStatusEnum";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "../swagger-output.json";
import { v4 as uuidv4 } from 'uuid';
import { MockVideoPublisher } from "./Infrastructure/SQS_SNS/MockVideoPublisher";

const publisher =
  process.env.USE_SNS === "true"
    ? new SnsVideoPublisher(process.env.SNS_TOPIC_ARN!)
    : new MockVideoPublisher();

// Interface para o corpo da requisição
interface ImportRequestBody {
  video: {
    id_video: string;
    title: string;
    description: string;
    filename: string;
    file_size: number;
    full_path: string;
    duration: number;
    framerate: number;
  };
  user: {
    id_usuario: string;
    email: string;
  };
  config: {
    output_format: string;
    resolution: string;
    interval: number;
  };
}

const app = express();

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rota GET
app.get("/", (req: Request, res: Response) => {
  res.send('Bem-vindo à API. A documentação está disponível em <a href="/api-docs">/api-docs</a>.');
});

const sequelizeInstance = new Sequelize({
  dialect: "mysql",
  host: process.env.DATABASE_HOST ?? "ERROR",
  port: Number(process.env.DATABASE_PORT ?? "0"),
  database: process.env.DATABASE_NAME ?? "ERROR",
  username: process.env.DATABASE_USER ?? "ERROR",
  password: process.env.DATABASE_PASS ?? "ERROR",
});

const snsPublisher = new SnsVideoPublisher(process.env.AWS_SNS_VIDEO_IMPORT_TOPIC_ARN!);
//const snsPublisher = publisher; // Testando Mock. 

app.use("/videos", createVideoImportRoutes(snsPublisher));

// Rota GET /import
app.get("/import", (req: Request, res: Response) => {
  res.send('Este endpoint aceita apenas requisições POST para importar vídeos. Veja a documentação em <a href="/api-docs">/api-docs</a>.');
});

// Rota POST /import com RequestHandler ajustado
const importHandler: RequestHandler<{}, any, ImportRequestBody> = async (req, res) => {
  console.log("📥 Corpo recebido:", req.body);
  try {
    const { video, user, config } = req.body;

    if (!video || !user || !config) {
      res.status(400).json({ error: "Os campos 'video', 'user' e 'config' são obrigatórios" });
      return;
    }
    if (!video.id_video || !video.full_path || !user.id_usuario || !config.output_format) {
      res.status(400).json({ error: "Campos obrigatórios faltando (id_video, full_path, id_usuario, output_format)" });
      return;
    }

    const now = new Date();
    const videoImport = new VideoImportEntity(
      video.id_video,
      user.id_usuario,
      ProcessingStatusEnum.PENDING,
      0,
      "Importação iniciada",
      now,
      now,
      null,
      uuidv4()
    );

    console.log("📤 Enviando mensagem para SNS:", JSON.stringify({
      importId: videoImport.getImportId(),
      videoId: videoImport.getVideoId(),
      userId: videoImport.getUserId(),
      status: videoImport.getImportStatus(),
      createdAt: videoImport.getCreatedAt().toISOString()
    }, null, 2));

    await snsPublisher.publish(videoImport);

    res.status(200).json({ message: "Importação iniciada com sucesso" });
  } catch (error) {
    console.error("Erro ao iniciar importação:", error);
    res.status(500).json({ error: "Erro interno ao processar a importação" });
  }
};

app.post("/import", importHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
});