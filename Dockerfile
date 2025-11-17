# PolkaMesh Backend Service - Production Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json nest-cli.json ./

# Install dependencies
RUN npm install

# Copy source code and ABIs
COPY src ./src
COPY abis ./abis

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy built code and ABIs
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/abis ./abis

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))" || exit 1

# Expose port
EXPOSE 3000

# Start service
CMD ["node", "dist/main.js"]

# Metadata
LABEL maintainer="PolkaMesh Team"
LABEL version="1.0.0"
LABEL description="PolkaMesh Backend Service - Event Listener & Job Executor"
