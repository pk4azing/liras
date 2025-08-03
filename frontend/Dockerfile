# frontend/Dockerfile

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npx", "http-server", "dist/<your-app-name>", "-p", "80"]