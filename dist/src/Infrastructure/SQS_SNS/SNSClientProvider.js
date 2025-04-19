import { SNSClient } from "@aws-sdk/client-sns";
export class SNSClientProvider {
    static client;
    static getClient() {
        if (!this.client) {
            this.client = new SNSClient({
                region: process.env.AWS_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                    sessionToken: process.env.AWS_SESSION_TOKEN,
                },
            });
        }
        return this.client;
    }
}
