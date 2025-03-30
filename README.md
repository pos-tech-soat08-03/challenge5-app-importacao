# Microserviço de Importação e Processamento de Vídeos / 8SOAT FIAP / Grupo 03

Projeto do 5º Tech Challenge (Hackaton) - POS TECH 8SOAT - Grupo 03 --> Repositório de Importação e Processamento de Vídeos.

Este repositório contém a implementação do serviço de importação e processamento de vídeos para o Tech Challenge 5 da Pós Tech de Arquitetura de Software (Turma SOAT8) da FIAP.

## Objetivo

O microserviço de Importação e Processamento de Vídeos é responsável por receber arquivos de vídeo, armazená-los e realizar o processamento conforme a necessidade do sistema. Ele também se comunica com o microserviço de controle de status para fornecer atualizações em tempo real sobre o progresso do processamento.

## Funcionalidades

- Recebimento de arquivos de vídeo para processamento.
- Controle de status dos processos (Pendente, Em Processamento, Concluído, Falha).
- Integração com banco de dados MySQL para persistência dos registros.
- Atualização de status em tempo real via comunicação com outro microserviço.
- Execução em containers locais ou em ambientes Kubernetes.
- Implementação de CI/CD utilizando Github Actions.

## Tecnologias Utilizadas

- **Linguagem**: Typescript
- **Framework**: Express
- **Banco de Dados**: MySQL
- **ORM**: Sequelize
- **Mensageria**: Axios para comunicação entre serviços
- **Infraestrutura**: Docker, Kubernetes (EKS - AWS)
- **CI/CD**: Github Actions
- **Monitoramento de Qualidade**: SonarCloud

## Configuração do CI/CD

O workflow de CI/CD foi configurado para automatizar a validação e o deploy do microserviço.

### CI - Continuous Integration

- Acionado automaticamente a cada push para o repositório.
- Realiza análise de código, testes unitários e verificação de padrões.

### CD - Continuous Deployment

O deploy ocorre em duas etapas:

1. **Deploy da imagem da aplicação no Docker Hub**
2. **Deploy manual no Cluster Kubernetes (EKS - AWS)**

Para executar o deploy manualmente:

```bash
github actions run "Deploy no EKS"
```

A aplicação estará acessível via API Gateway configurado no repositório de infraestrutura.

## Como Executar Localmente

### Docker

```bash
docker compose up --build
```

### Kubernetes

```bash
kubectl apply -f manifesto_kubernetes/
```

### Verificação

Acesse: [http://localhost:3000/](http://localhost:3000/) para validar o funcionamento.

## Documentação da API

A documentação Swagger está disponível em:

[http://localhost:3000/doc/](http://localhost:3000/doc/)

## Arquitetura da Aplicação

A arquitetura segue os princípios da **Clean Architecture**, garantindo:

- Separacão de responsabilidades entre entidades, casos de uso e interfaces externas.
- Dependências organizadas de forma que regras de negócio sejam isoladas.
- Modularização para facilitar testes e manutenção.

## Estrutura dos Diretórios

```
.
├── src                    # Código Fonte
│   ├── Infrastructure     # Interação com o ambiente externo
│   ├── Application        # Controladores, gateways e presenters
│   ├── Core               # Lógica de negócio
│   ├── app.ts             # Ponto de entrada
├── tests                  # Testes unitários e de integração
├── Dockerfile             # Configuração do Docker
├── docker-compose.yml     # Configurações para execução local
├── README.md              # Este arquivo
```

## Contribuição

1. Fork este repositório.
2. Crie um branch para suas alterações: `git checkout -b feature/nova-funcionalidade`.
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`.
4. Push para o branch: `git push origin feature/nova-funcionalidade`.
5. Abra um Pull Request.

## Contato

Para dúvidas ou sugestões, entre em contato com o time do Grupo 03.


