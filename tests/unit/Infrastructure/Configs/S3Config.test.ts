
const sendMock = jest.fn();

jest.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: sendMock,
    })),
    PutObjectCommand: jest.fn().mockImplementation((input) => input),
  };
});

jest.mock("fs", () => {
  const actualFs = jest.requireActual("fs");
  return {
    ...actualFs,
    createReadStream: jest.fn(),
    unlinkSync: jest.fn(),
    statSync: jest.fn(() => ({ size: 123456 })),
  };
});

// 👇 agora sim, os imports reais
import { uploadVideoToS3 } from "../../../../src/Infrastructure/S3/uploadToS3";
import * as path from "path";
import * as fs from "fs";
import { Readable } from "stream";

describe("uploadVideoToS3", () => {
  const localFilePath = path.join(__dirname, "__mocks__", "sample-video.mp4");
  const originalFileName = "sample-video.mp4";
  const bucketName = "my-test-bucket";
  const region = "us-east-1";

  beforeEach(() => {
    process.env.S3_BUCKET_NAME = bucketName;
    process.env.AWS_REGION = region;

    // mock de stream
    const mockStream = new Readable();
    mockStream._read = () => {};
    mockStream.push("mocked content");
    mockStream.push(null);

    (fs.createReadStream as jest.Mock).mockReturnValue(mockStream);
    (fs.unlinkSync as jest.Mock).mockClear();
    sendMock.mockClear();
  });

  it("deve fazer upload de um vídeo e retornar a URL correta", async () => {
    sendMock.mockResolvedValueOnce({ $metadata: { httpStatusCode: 200 } });

    const fileUrl = await uploadVideoToS3(localFilePath, originalFileName);

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: bucketName,
        Key: expect.stringMatching(/\.mp4$/),
        ContentType: "video/mp4",
        Body: expect.any(Readable),
      })
    );

    expect(fs.unlinkSync).toHaveBeenCalledWith(localFilePath);
    expect(fileUrl).toMatch(
      new RegExp(`^https://${bucketName}\\.s3\\.${region}\\.amazonaws\\.com/videos/.*\\.mp4$`)
    );
  });

  it("deve lançar erro se o upload falhar", async () => {
    sendMock.mockRejectedValueOnce(new Error("Upload failed"));

    await expect(uploadVideoToS3(localFilePath, originalFileName)).rejects.toThrow("Upload failed");

    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });
});
