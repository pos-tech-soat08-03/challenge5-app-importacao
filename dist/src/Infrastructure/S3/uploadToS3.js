import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
export async function uploadVideoToS3(localFilePath, originalFileName) {
    const fileStream = fs.createReadStream(localFilePath);
    const fileExtension = path.extname(originalFileName);
    const uniqueName = `${uuidv4()}${fileExtension}`;
    const bucketName = process.env.S3_BUCKET_NAME;
    const uploadParams = {
        Bucket: bucketName,
        Key: `videos/${uniqueName}`,
        Body: fileStream,
        ContentType: getMimeType(fileExtension),
    };
    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);
    fs.unlinkSync(localFilePath);
    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/videos/${uniqueName}`;
    return fileUrl;
}
function getMimeType(extension) {
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
