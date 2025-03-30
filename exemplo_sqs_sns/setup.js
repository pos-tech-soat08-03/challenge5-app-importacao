// const AWS = require("aws-sdk");
import AWS from "aws-sdk";


const sqs = new AWS.SQS({
  endpoint: "http://localhost:4566", // LocalStack
  region: "us-east-1",
  accessKeyId: "test",
  secretAccessKey: "test"
});

const sns = new AWS.SNS({
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  accessKeyId: "test",
  secretAccessKey: "test"
});

async function setup() {
  try {
    // Criar SNS Topic
    const snsTopic = await sns.createTopic({ Name: "my-topic" }).promise();
    const snsTopicArn = snsTopic.TopicArn;
    console.log("SNS Topic criado:", snsTopicArn);

    // Criar Dead Letter Queue (DLQ)
    const dlqParams = {
      QueueName: "my-dead-letter-queue"
    };
    const dlqData = await sqs.createQueue(dlqParams).promise();
    const dlqUrl = dlqData.QueueUrl;

    // Pegar o ARN da DLQ
    const dlqArn = (await sqs.getQueueAttributes({
      QueueUrl: dlqUrl,
      AttributeNames: ["QueueArn"]
    }).promise()).Attributes.QueueArn;
    console.log("Dead Letter Queue criada:", dlqArn);

    // Criar SQS Queue
    const queueParams = {
      QueueName: "my-queue",
      Attributes: {
        RedrivePolicy: JSON.stringify({
          deadLetterTargetArn: dlqArn,
          maxReceiveCount: "5"
        })
      }
    };

    const queueData = await sqs.createQueue(queueParams).promise();
    const queueUrl = queueData.QueueUrl;

    // Pegar o ARN da fila SQS
    const queueArn = (await sqs.getQueueAttributes({
      QueueUrl: queueUrl,
      AttributeNames: ["QueueArn"]
    }).promise()).Attributes.QueueArn;
    console.log("SQS Queue criada:", queueArn);

    // Criar a assinatura do SNS para a SQS
    const subscribeParams = {
      Protocol: "sqs",
      TopicArn: snsTopicArn,
      Endpoint: queueArn
    };

    await sns.subscribe(subscribeParams).promise();
    console.log("SQS inscrito no SNS com sucesso.");

    console.log("Setup concluído!");

  } catch (error) {
    console.error("Erro ao configurar SNS e SQS:", error);
  }
}

setup();
