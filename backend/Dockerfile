FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY prisma ./prisma
COPY src ./src
COPY scripts ./scripts

RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 8080

CMD ["npm", "run", "start:docker"]
