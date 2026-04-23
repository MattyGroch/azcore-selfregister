FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src/ ./src/
COPY views/ ./views/
COPY public/ ./public/

RUN mkdir -p /app/sessions

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "src/server.js"]
