# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY client ./client
COPY server ./server
# Prisma generate needs a URL shape; no live DB required at generate time.
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build"
RUN npm run db:generate -w server \
  && npm run build -w client \
  && npm run build -w server

FROM node:22-alpine AS runtime
RUN apk add --no-cache git openssl tini \
  && addgroup -S app && adduser -S app -G app
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN npm ci --omit=dev \
  && npm install prisma@6.19.3 --no-save --omit=dev \
  && npm cache clean --force

COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/prisma ./server/prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh \
  && mkdir -p /app/server/data \
  && chown -R app:app /app

USER app
EXPOSE 8080
ENTRYPOINT ["/sbin/tini", "--", "/app/docker-entrypoint.sh"]
