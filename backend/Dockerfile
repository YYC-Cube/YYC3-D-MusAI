# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including devDependencies for TypeScript compilation)
RUN npm ci

# Copy source code
COPY . .

# Compile TypeScript to JavaScript
RUN npx tsc

# Production stage with smaller image
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled JavaScript from builder stage
COPY --from=builder /app/dist ./dist

# Copy migration assets (sequelize-cli runs plain JS from source tree)
COPY --from=builder /app/src/migrations ./src/migrations
COPY --from=builder /app/src/config/database.js ./src/config/database.js
COPY --from=builder /app/.sequelizerc ./.sequelizerc

# Create non-root user for security; pre-create writable upload dir (named volume inherits ownership)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && mkdir -p /app/uploads && chown -R appuser:appgroup /app/uploads
USER appuser

# Environment variables (runtime values should be injected via docker-compose or orchestrator)
ENV NODE_ENV=production
ENV PORT=25101

# Expose API port
EXPOSE 25101

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:25101/api/health || exit 1

# Apply database migrations, then start the server
CMD ["sh", "-c", "npx sequelize-cli db:migrate && node dist/index.js"]
