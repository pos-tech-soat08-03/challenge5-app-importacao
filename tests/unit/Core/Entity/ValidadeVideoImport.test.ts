import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffprobePath from "@ffprobe-installer/ffprobe";
import fs from "fs";

ffmpeg.setFfmpegPath(ffmpegPath.path);
ffmpeg.setFfprobePath(ffprobePath.path);

const allowedExtensions = [".mp4", ".mov", ".avi", ".mkv"];
const maxFileSizeInMB = 200; // Limitei a quantidade de 200MB por video. 
const maxDurationInSeconds = 300; // 5 minutos.
const maxBucketSizeMB = 5000;

function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

export async function validateVideoFileWithFFmpeg(filePath: string, originalName: string, fileSizeBytes: number): Promise<void> {
  if (!fs.existsSync(filePath)) {
    throw new Error("Arquivo de vídeo não encontrado no caminho especificado.");
  }

  const extension = getFileExtension(originalName);
  if (!allowedExtensions.includes(extension)) {
    throw new Error("Formato de vídeo inválido. Aceitamos apenas .mp4, .mov, .avi, .mkv.");
  }

  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  if (fileSizeMB > maxFileSizeInMB) {
    throw new Error(`O vídeo excede o limite de ${maxFileSizeInMB}MB.`);
  }

  await validateVideoDuration(filePath);

  await checkS3BucketCapacity(fileSizeMB);
}

function validateVideoDuration(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(new Error("Erro ao analisar o vídeo com ffmpeg."));
      }

      const duration = metadata.format.duration ?? 0;
      if (duration > maxDurationInSeconds) {
        return reject(new Error(`Duração do vídeo excede o limite de ${maxDurationInSeconds / 60} minutos.`));
      }

      resolve();
    });
  });
}

async function checkS3BucketCapacity(fileSizeMB: number): Promise<void> {
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const bucket = process.env.S3_BUCKET_NAME!;
  const command = new ListObjectsV2Command({ Bucket: bucket });
  const usageData = await s3.send(command);

  const totalSize = usageData.Contents?.reduce((acc, obj) => acc + (obj.Size ?? 0), 0) ?? 0;
  const totalSizeMB = totalSize / (1024 * 1024);

  if (totalSizeMB + fileSizeMB > maxBucketSizeMB) {
    throw new Error("Espaço insuficiente no bucket S3. Libere espaço antes de tentar novamente.");
  }
}