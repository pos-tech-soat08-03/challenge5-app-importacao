FROM node:20-slim

WORKDIR /app

# Copiar apenas package.json e package-lock.json primeiro para instalar dependências
COPY package*.json ./

RUN npm install --ignore-scripts

# Agora copie o restante dos arquivos
COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "/app/dist/src/app.js"]