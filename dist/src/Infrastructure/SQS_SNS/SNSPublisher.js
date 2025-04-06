"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SNSPublisher = void 0;
const client_sns_1 = require("@aws-sdk/client-sns");
const SNSClientProvider_1 = require("./SNSClientProvider");
class SNSPublisher {
    constructor() {
        this.client = SNSClientProvider_1.SNSClientProvider.getClient();
    }
    async publishToTopic(topicArn, message, attributes) {
        try {
            const command = new client_sns_1.PublishCommand({
                TopicArn: topicArn,
                Message: message,
                MessageAttributes: attributes
                    ? Object.entries(attributes).reduce((acc, [key, value]) => {
                        acc[key] = {
                            DataType: "String",
                            StringValue: value,
                        };
                        return acc;
                    }, {})
                    : undefined,
            });
            await this.client.send(command);
            console.log(`[SNS] Mensagem publicada com sucesso no tópico: ${topicArn}`);
        }
        catch (error) {
            console.error(`[SNS] Falha ao publicar mensagem no tópico: ${topicArn}`, error);
            throw error;
        }
    }
}
exports.SNSPublisher = SNSPublisher;
