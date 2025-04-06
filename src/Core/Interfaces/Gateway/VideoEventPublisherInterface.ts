import { VideoImportEntity } from "../../Entity/VideoImportEntity";

export interface VideoEventPublisherInterface {
  publish(videoImport: VideoImportEntity): Promise<void>;
}