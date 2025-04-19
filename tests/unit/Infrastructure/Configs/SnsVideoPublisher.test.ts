import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { SnsVideoPublisher } from "../../../../src/Infrastructure/SQS_SNS/SnsVideoPublisher";

// Mocka o SNSClient
const mockSend = jest.fn();
jest.mock("@aws-sdk/client-sns", () => {
    return {
        SNSClient: jest.fn().mockImplementation(() => {
            return {
                send: mockSend, // Usa o mockSend diretamente
            };
        }),
        PublishCommand: jest.fn((input) => input), // Mocka o PublishCommand para retornar o input
    };
});

describe("SnsVideoPublisher", () => {
    const topicArn = "arn:aws:sns:us-east-1:123456789012:TestTopic";
    const snsVideoPublisher = new SnsVideoPublisher(topicArn);
    const message = { videoId: "12345", status: "uploaded" };

    beforeEach(() => {
        mockSend.mockClear(); // Limpa o estado do mock antes de cada teste
    });

    it("deve publicar uma mensagem no SNS", async () => {
        // Verifica que o mock 'send' não é undefined
        expect(mockSend).toBeDefined();

        // Simula sucesso no envio da mensagem
        mockSend.mockResolvedValueOnce({ MessageId: "123" });

        await snsVideoPublisher.publish(message);

        // Verifica se o método send foi chamado corretamente
        expect(mockSend).toHaveBeenCalledTimes(1);
        expect(mockSend).toHaveBeenCalledWith(
            expect.objectContaining({
                TopicArn: topicArn,
                Message: JSON.stringify(message),
            })
        );
    });

    it("deve lidar com erro ao tentar publicar no SNS", async () => {
        // Verifica que o mock 'send' não é undefined
        expect(mockSend).toBeDefined();

        // Simula erro ao tentar publicar
        mockSend.mockRejectedValueOnce(new Error("SNS Error"));

        // Verifica se o erro é lançado corretamente
        await expect(snsVideoPublisher.publish(message)).rejects.toThrow("SNS Error");

        // Verifica se o método send foi chamado
        expect(mockSend).toHaveBeenCalledTimes(1);
    });
});