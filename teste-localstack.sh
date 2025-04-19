
LOCALSTACK_URL="http://localhost:4566"  # Se estiver dentro do Kubernetes, use http://host.docker.internal:4566

#teste. 
echo "Verificando a saúde do Localstack..."
curl -s "$LOCALSTACK_URL/_localstack/health" | jq .


echo "Criando uma fila SQS chamada 'minha-fila'..."
aws --endpoint-url="$LOCALSTACK_URL" sqs create-queue --queue-name sqs-canal-de-processamento


echo "Criando um tópico SNS chamado 'meu-topico'..."
aws --endpoint-url="$LOCALSTACK_URL" sns create-topic --name teste-topico-importacao


echo "Criando um bucket S3 chamado 'meu-bucket-de-testes'..."
aws --endpoint-url="$LOCALSTACK_URL" s3 mb s3://meu-bucket-de-testes


echo "Verificando o status dos serviços no Localstack..."
curl -s "$LOCALSTACK_URL/_localstack/health" | jq .

echo "Teste completo!"