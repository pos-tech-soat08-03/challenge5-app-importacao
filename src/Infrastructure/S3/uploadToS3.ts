import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function uploadVideoToS3(localFilePath: string, originalFileName: string): Promise<string> {
  const fileStream = fs.createReadStream(localFilePath);

  const fileExtension = path.extname(originalFileName);
  const uniqueName = `${uuidv4()}${fileExtension}`;
  const bucketName = process.env.S3_BUCKET_NAME!;

  const uploadParams = {
    Bucket: bucketName,
    Key: `videos/${uniqueName}`,
    Body: fileStream,
    ContentType: getMimeType(fileExtension),
  };

  const result = await s3.upload(uploadParams).promise();

  
  fs.unlinkSync(localFilePath);

  return result.Location; 
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