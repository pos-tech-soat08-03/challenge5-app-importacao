import { PublishCommand } from "@aws-sdk/client-sns";
import { SNSClientProvider } from "./SNSClientProvider";
export class SNSPublisher {
    client = SNSClientProvider.getClient();
    async publishToTopic(topicArn, message, attributes) {
        try {
            const command = new PublishCommand({
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
