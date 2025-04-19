import AWS from 'aws-sdk';

AWS.config.update({
    region: 'us-east-1',
    accessKeyId: 'test',
    secretAccessKey: 'test',
});

const sqs = new AWS.SQS({ endpoint: 'http://localhost:4566' });
const QUEUE_URL = 'http://localhost:4566/000000000000/sns-canal-de-processamento';

interface ImportMessage {
    video: {
        id_video: string;
        title: string;
        description: string;
        filename: string;
        file_size: number;
        full_path: string;
        duration: number;
        framerate: number;
    };
    user: {
        id_usuario: string;
        email: string;
    };
    config: {
        output_format: string;
        resolution: string;
        interval: number;
    };
}

async function pollMessages(): Promise<void> {
    console.log('🔄 Aguardando mensagens na fila...');

    try {
        const result = await sqs
            .receiveMessage({
                QueueUrl: QUEUE_URL,
                MaxNumberOfMessages: 1,
                WaitTimeSeconds: 10,
            })
            .promise();

        if (result.Messages && result.Messages.length > 0) {
            for (const message of result.Messages) {
                const receiptHandle = message.ReceiptHandle!;

                // 👇 Primeiro parse: JSON que vem do SNS
                const snsEnvelope = JSON.parse(message.Body!);

                // 👇 Segundo parse: a string JSON com os dados do vídeo
                const payload: ImportMessage = JSON.parse(snsEnvelope.Message);

                console.log('📥 Mensagem recebida:');
                console.dir(payload, { depth: null });

                // Remoção da mensagem após processamento
                await sqs
                    .deleteMessage({
                        QueueUrl: QUEUE_URL,
                        ReceiptHandle: receiptHandle,
                    })
                    .promise();

                console.log('✅ Mensagem processada e removida da fila.\n');
            }
        } else {
            console.log('⏳ Nenhuma nova mensagem no momento...');
        }
    } catch (error) {
        console.error('❌ Erro ao processar a mensagem:', error);
    }

    setTimeout(pollMessages, 3000);
}

pollMessages();
