import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Cria uma instância do S3 com as variáveis vindas do ConfigMap
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN!, // Adicionado para compatibilidade com o CD
  },
});

export async function uploadVideoToS3(localFilePath: string, originalFileName: string): Promise<string> {
  const fileStream = fs.createReadStream(localFilePath);

  const fileExtension = path.extname(originalFileName);
  const uniqueName = `${uuidv4()}${fileExtension}`;
  const bucketName = "${{ github.event.inputs.aws_backend_bucket }}";

  const uploadParams = {
    Bucket: bucketName,
    Key: `jackapp-importacao/videos/${uniqueName}`, // Coloque a pasta que deseja usar dentro do bucket
    Body: fileStream,
    ContentType: getMimeType(fileExtension),
  };

  const command = new PutObjectCommand(uploadParams);
  await s3.send(command);

  fs.unlinkSync(localFilePath); // Limpa o arquivo temporário após upload

  const fileUrl = "${{steps.sqs-processing.outputs.SQS_QUEUE_URL}}";
  return fileUrl;
}

function getMimeType(extension: string): string {
  switch (extension.toLowerCase()) {
    case ".mp4":
      return "video/mp4";
    case ".mov":
      return "video/quicktime";
    case ".avi":
      return "video/x-msvideo";
    case ".mkv":
      return "video/x-matroska";
    default:
      return "application/octet-stream";
  }
}
