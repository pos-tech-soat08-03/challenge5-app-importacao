import { SNSPublisher } from "../../../../src/Infrastructure/SQS_SNS/SNSPublisher";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

// Mock do SNSClientProvider
jest.mock("../../../../src/Infrastructure/SQS_SNS/SNSClientProvider", () => ({
  SNSClientProvider: {
    getClient: jest.fn(),  // Mock do método getClient
  },
}));

describe("SNSPublisher", () => {
  let mockSend: jest.Mock;
  let snsPublisher: SNSPublisher;
  const topicArn = "arn:aws:sns:us-east-1:123456789012:VideoImportTopic";
  const message = "Test message";

  beforeEach(() => {
    // Mock do SNSClient
    const mockSNSClient = {
      send: jest.fn(),
    };

    // Configura o SNSClientProvider para retornar o mockSNSClient
    require("../../../../src/Infrastructure/SQS_SNS/SNSClientProvider").SNSClientProvider.getClient.mockReturnValue(mockSNSClient);

    // Agora criamos a instância do SNSPublisher com o mock do SNSClient
    snsPublisher = new SNSPublisher();
    mockSend = mockSNSClient.send as jest.Mock;
  });

  it("deve publicar uma mensagem no SNS", async () => {
    // Configuração do mock para simular sucesso
    mockSend.mockResolvedValueOnce({ MessageId: "123" });

    // Chama o método publishToTopic
    await snsPublisher.publishToTopic(topicArn, message);

    // Verifica se o método send foi chamado
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TopicArn: topicArn,
          Message: message,
        }),
      })
    );
  });

  it("deve lidar com erro ao tentar publicar no SNS", async () => {
    // Configuração do mock para simular erro
    mockSend.mockRejectedValueOnce(new Error("SNS Error"));

    // Espera que o erro seja lançado
    await expect(snsPublisher.publishToTopic(topicArn, message)).rejects.toThrow("SNS Error");

    // Verifica que o mock 'send' foi chamado
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});
