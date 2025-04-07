"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishMessage = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const sns = new aws_sdk_1.default.SNS({
    endpoint: 'http://localhost:4566',
    region: 'us-east-1',
    accessKeyId: 'test',
    secretAccessKey: 'test'
});
const TOPIC_ARN = 'arn:aws:sns:us-east-1:000000000000:my-topic';
const publishMessage = async (message) => {
    await sns.publish({
        Message: message,
        TopicArn: TOPIC_ARN
    }).promise();
    console.log("Mensagem publicada:", message);
};
exports.publishMessage = publishMessage;
for (let i = 0; i < 1000; i++) {
    const message = {
        id: i + 1,
        brunoMessage: `Assistiu xvideos ${i + 1}x essa semana`,
    };
    await (0, exports.publishMessage)(JSON.stringify(message));
}
// Exemplo de publicação
// publishMessage("Teste SNS → SQS").catch(console.error);
