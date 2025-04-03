import AWS from 'aws-sdk';

const sns = new AWS.SNS({
    endpoint: 'http://localhost:4566',
    region: 'us-east-1',
    accessKeyId: 'test',
    secretAccessKey: 'test'
});

const TOPIC_ARN = 'arn:aws:sns:us-east-1:000000000000:my-topic';

export const publishMessage = async (message: string) => {
    await sns.publish({
        Message: message,
        TopicArn: TOPIC_ARN
    }).promise();
    console.log("Mensagem publicada:", message);
};

for (let i = 0; i < 1000; i++) {
    const message = {
        id: i + 1,
        brunoMessage: `Assistiu xvideos ${i + 1}x essa semana`,
    };
    await publishMessage(JSON.stringify(message));
}



// Exemplo de publicação
// publishMessage("Teste SNS → SQS").catch(console.error);
