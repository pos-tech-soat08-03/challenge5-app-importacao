import { SNS } from "aws-sdk";
import { VideoEventPublisherInterface } from "../../Core/Interfaces/Gateway/VideoEventPublisherInterface";
import { VideoImportEntity } from "../../Core/Entity/VideoImportEntity";

export class SnsVideoPublisher implements VideoEventPublisherInterface {
  private sns: SNS;
  private topicArn: string;

  constructor(topicArn: string) {
    this.sns = new SNS({
      region: process.env.AWS_REGION ?? "us-east-1",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    this.topicArn = topicArn;
  }

  async publish(videoImport: VideoImportEntity): Promise<void> {
    const message = {
      importId: videoImport.getImportId(),
      videoId: videoImport.getVideoId(),
      userId: videoImport.getUserId(),
      status: videoImport.getStatus(),
      createdAt: videoImport.getCreatedAt().toISOString(),
    };

    const params = {
      Message: JSON.stringify(message),
      TopicArn: this.topicArn,
    };

    await this.sns.publish(params).promise();
    console.log("[SNS] Evento publicado com sucesso:", message);
  }
}