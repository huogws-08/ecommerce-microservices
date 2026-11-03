
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY prisma ./prisma

RUN npx prisma generate --schema=./prisma/schema.prisma

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
