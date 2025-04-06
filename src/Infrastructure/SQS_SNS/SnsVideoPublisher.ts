import { PublishCommand } from "@aws-sdk/client-sns";
import { SNSClientProvider } from "./SNSClientProvider";
import { VideoEventPublisherInterface } from "../../Core/Interfaces/Gateway/VideoEventPublisherInterface";
import { VideoImportEntity } from "../../Core/Entity/VideoImportEntity";

export class SnsVideoPublisher implements VideoEventPublisherInterface {
  private readonly client = SNSClientProvider.getClient();
  private topicArn: string;

  constructor(topicArn: string) {
    this.topicArn = topicArn;
  }

  async publish(videoImport: VideoImportEntity): Promise<void> {
    const message = {
      importId: videoImport.getImportId(),
      videoId: videoImport.getVideoId(),
      userId: videoImport.getUserId(),
      status: videoImport.getImportStatus(),
      createdAt: videoImport.getCreatedAt().toISOString(),
    };

    const command = new PublishCommand({
      TopicArn: this.topicArn,
      Message: JSON.stringify(message),
    });

    await this.client.send(command);
    console.log("[SNS] Evento publicado com sucesso:", message);
  }
}