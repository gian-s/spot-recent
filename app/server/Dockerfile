FROM node:18-alpine

WORKDIR /app/server

COPY . /app/server

RUN npm install

EXPOSE 3001

CMD ["node", "server.js"]