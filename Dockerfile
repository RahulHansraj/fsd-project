# ==============================================================================
# CivicCycle Production Dockerfile for Azure App Service & Azure Container Apps
# ==============================================================================

# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production Runtime Stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY server.js ./server.js

EXPOSE 8080
CMD ["node", "server.js"]
