import { VideoEventPublisherInterface } from "../../Core/Interfaces/Gateway/VideoEventPublisherInterface";
import { VideoImportEntity } from "../../Core/Entity/VideoImportEntity";

export class MockVideoPublisher implements VideoEventPublisherInterface {
  async publish(videoImport: VideoImportEntity): Promise<void> {
    console.log("[MOCK SNS] Simulando envio de evento SNS:");
    console.log({
      importId: videoImport.getImportId(),
      videoId: videoImport.getVideoId(),
      userId: videoImport.getUserId(),
      status: videoImport.getImportStatus(),
      createdAt: videoImport.getCreatedAt().toISOString(),
    });
  }
}