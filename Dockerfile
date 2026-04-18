FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/production.sqlite
ENV CORS_ORIGIN=http://localhost:3100
ENV RATE_LIMIT_WINDOW_MS=60000
ENV RATE_LIMIT_MAX=100

EXPOSE 3000

CMD ["sh", "-c", "npm run db:init && node src/server.js"]
