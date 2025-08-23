FROM node:current-alpine3.22

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3001
CMD ["npm", "run", "start:prod"]
