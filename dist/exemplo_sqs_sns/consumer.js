import AWS from 'aws-sdk';
const sqs = new AWS.SQS({
    endpoint: 'http://localhost:4566',
    region: 'us-east-1',
    accessKeyId: 'test',
    secretAccessKey: 'test'
});
const QUEUE_URL = 'http://localhost:4566/000000000000/my-queue';
let countRead = 0;
const processMessage = async (message) => {
    const parsedMessage = JSON.parse(message);
    countRead++;
    // console.log("\n\nMensagem recebida:", parsedMessage);
    const innerMessage = JSON.parse(parsedMessage.Message);
    console.log("\n\nMensagem recebida:", innerMessage.brunoMessage);
    // Simulação de ativação do EKS
    console.log("Ativando cluster EKS...");
    // // Simulação de falha aleatória para retentativa
    // if (Math.random() < 0.3) {
    //     throw new Error("Erro no processamento!");
    // }
    console.log("Processamento concluído.\n\n");
    console.log("Contagem de mensagens processadas:", countRead);
};
const pollQueue = async () => {
    while (true) {
        try {
            const { Messages } = await sqs.receiveMessage({
                QueueUrl: QUEUE_URL,
                MaxNumberOfMessages: 1,
                WaitTimeSeconds: 5,
                VisibilityTimeout: 10
            }).promise();
            if (!Messages)
                continue;
            for (const message of Messages) {
                try {
                    await processMessage(message.Body);
                    await sqs.deleteMessage({
                        QueueUrl: QUEUE_URL,
                        ReceiptHandle: message.ReceiptHandle
                    }).promise();
                    console.log("Mensagem removida da fila.");
                }
                catch (err) {
                    console.error("Erro ao processar mensagem, será reprocessada.");
                }
            }
        }
        catch (err) {
            console.error("Erro ao buscar mensagens:", err);
        }
    }
};
pollQueue().catch(console.error);
