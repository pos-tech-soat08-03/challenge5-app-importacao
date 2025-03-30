import { ProcessingStatusEnum } from "./ValueObject/ProcessingStatusEnum";


export class VideoImportEntity {
    constructor(
        private videoId: string,
        private userId: string,
        private importStatus: ProcessingStatusEnum,
        private importStatusPercentage: number,
        private importLog: string,
        private createdAt: Date,
        private updatedAt: Date,
        private finishedAt: Date | null,
        private importId: string
    ) {}

    

    public getVideoId(): string {
        return this.videoId;
    }

    public setVideoId(videoId: string): void {
        this.videoId = videoId;
    }

    public getUserId(): string {
        return this.userId;
    }

    public setUserId(userId: string): void {
        this.userId = userId;
    }

    public getImportStatus(): ProcessingStatusEnum {
        return this.importStatus;
    }

    public setImportStatus(status: ProcessingStatusEnum): void {
        this.importStatus = status;
    }

    public getImportStatusPercentage(): number {
        return this.importStatusPercentage;
    }

    public setImportStatusPercentage(percentage: number): void {
        this.importStatusPercentage = percentage;
    }

    public getImportLog(): string {
        return this.importLog;
    }

    public setImportLog(log: string): void {
        this.importLog = log;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public setCreatedAt(date: Date): void {
        this.createdAt = date;
    }

    public getUpdatedAt(): Date {
        return this.updatedAt;
    }

    public setUpdatedAt(date: Date): void {
        this.updatedAt = date;
    }

    public getFinishedAt(): Date | null {
        return this.finishedAt;
    }

    public setFinishedAt(date: Date | null): void {
        this.finishedAt = date;
    }

    public getImportId(): string {
        return this.importId;
    }

    public setImportId(importId: string): void {
        this.importId = importId;
    }
}