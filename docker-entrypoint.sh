#!/bin/sh
set -eu

echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=/app/server/prisma/schema.prisma

echo "Starting EK Watchlist..."
exec node /app/server/dist/index.js
