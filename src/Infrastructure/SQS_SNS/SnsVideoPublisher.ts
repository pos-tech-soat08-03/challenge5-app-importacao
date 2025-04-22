import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

export class SnsVideoPublisher {
  private sns: SNSClient;
  private topicArn: string;

  constructor(topicArn: string) {
    this.topicArn = topicArn;
    this.sns = new SNSClient({
      region: process.env.AWS_REGION,
      endpoint: "http://aeb503ec92dcb4cae9d4a2f7b0af1a64-1497002298.us-east-1.elb.amazonaws.com/", 
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async publish(message: any) {
    const command = new PublishCommand({
      TopicArn: this.topicArn,
      Message: JSON.stringify(message),
    });

    return this.sns.send(command);
  }
}
