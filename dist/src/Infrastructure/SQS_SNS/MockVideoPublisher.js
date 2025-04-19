export class MockVideoPublisher {
    async publish(videoImport) {
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
