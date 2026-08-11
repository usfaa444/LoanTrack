# Multi-stage Dockerfile for LoanTrack API

# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY packages/api/package.json ./packages/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build packages
RUN pnpm run build

# Production stage
FROM node:18-alpine AS runner

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup --gid 1001 --system nodejs
RUN adduser --uid 1001 --system --ingroup nodejs nodejs
USER nodejs

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY packages/api/package.json ./packages/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built files from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/packages/api/dist ./packages/api/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/database/prisma ./packages/database/prisma

# Generate Prisma client
RUN pnpm --filter @loantrack/database run db:generate

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "--filter", "@loantrack/api", "start"]