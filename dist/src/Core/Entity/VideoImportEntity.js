export class VideoImportEntity {
    videoId;
    userId;
    importStatus;
    importStatusPercentage;
    importLog;
    createdAt;
    updatedAt;
    finishedAt;
    importId;
    getStatus() {
        throw new Error("Method not implemented.");
    }
    constructor(videoId, userId, importStatus, importStatusPercentage, importLog, createdAt, updatedAt, finishedAt, importId) {
        this.videoId = videoId;
        this.userId = userId;
        this.importStatus = importStatus;
        this.importStatusPercentage = importStatusPercentage;
        this.importLog = importLog;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.finishedAt = finishedAt;
        this.importId = importId;
    }
    getVideoId() {
        return this.videoId;
    }
    setVideoId(videoId) {
        this.videoId = videoId;
    }
    getUserId() {
        return this.userId;
    }
    setUserId(userId) {
        this.userId = userId;
    }
    getImportStatus() {
        return this.importStatus;
    }
    setImportStatus(status) {
        this.importStatus = status;
    }
    getImportStatusPercentage() {
        return this.importStatusPercentage;
    }
    setImportStatusPercentage(percentage) {
        this.importStatusPercentage = percentage;
    }
    getImportLog() {
        return this.importLog;
    }
    setImportLog(log) {
        this.importLog = log;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    setCreatedAt(date) {
        this.createdAt = date;
    }
    getUpdatedAt() {
        return this.updatedAt;
    }
    setUpdatedAt(date) {
        this.updatedAt = date;
    }
    getFinishedAt() {
        return this.finishedAt;
    }
    setFinishedAt(date) {
        this.finishedAt = date;
    }
    getImportId() {
        return this.importId;
    }
    setImportId(importId) {
        this.importId = importId;
    }
}
