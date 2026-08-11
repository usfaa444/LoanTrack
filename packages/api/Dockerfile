# Dockerfile for LoanTrack API
FROM node:18-alpine

RUN apk add --no-cache openssl && npm install -g pnpm

WORKDIR /app

# Copy workspace files (needed for pnpm to resolve)
COPY package.json pnpm-workspace.yaml ./
COPY packages/api ./packages/api
COPY packages/database ./packages/database
COPY packages/shared ./packages/shared
COPY tsconfig.base.json ./

# Install with no lockfile (it will generate one from package.json)
RUN pnpm install --no-frozen-lockfile

EXPOSE 3001

CMD ["pnpm", "--filter", "@loantrack/api", "dev"]