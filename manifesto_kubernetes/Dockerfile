
FROM node:20-slim


WORKDIR /app


COPY package*.json ./


RUN npm install --ignore-scripts


COPY . .


RUN npm run build


EXPOSE 3000


CMD ["node", "/app/dist/app.js"]