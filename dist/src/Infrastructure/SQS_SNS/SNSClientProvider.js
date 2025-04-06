"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SNSClientProvider = void 0;
const client_sns_1 = require("@aws-sdk/client-sns");
class SNSClientProvider {
    static getClient() {
        if (!this.client) {
            this.client = new client_sns_1.SNSClient({
                region: process.env.AWS_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                },
            });
        }
        return this.client;
    }
}
exports.SNSClientProvider = SNSClientProvider;
