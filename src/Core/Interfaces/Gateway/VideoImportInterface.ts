import { VideoImportEntity } from "../../Entity/VideoImportEntity";


export interface VideoImportInterface {
    
    getVideoImportStatus(importId: string): Promise<VideoImportEntity | undefined>;
    setVideoImportStatus(videoImportStatus: VideoImportEntity): Promise<void>;   
    getVideoImportList(status: string): Promise<Array<VideoImportEntity> | undefined>;
    getVideoImportListByUser(userId: string): Promise<Array<VideoImportEntity> | undefined>;
}