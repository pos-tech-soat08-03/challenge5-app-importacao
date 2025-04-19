import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
export class SnsVideoPublisher {
    sns;
    topicArn;
    constructor(topicArn) {
        this.topicArn = topicArn;
        this.sns = new SNSClient({
            region: process.env.AWS_REGION,
            endpoint: "http://localstack:4566", // <--- IMPORTANTE: aponta para o container localstack
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    async publish(message) {
        const command = new PublishCommand({
            TopicArn: this.topicArn,
            Message: JSON.stringify(message),
        });
        return this.sns.send(command);
    }
}
