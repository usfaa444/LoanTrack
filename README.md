# LoanTrack

A personal loan tracking application with smart reminders, trust scoring, and relationship visualization.

## Project Structure

```
loantrack/
├── packages/
│   ├── api/          # Fastify API server
│   ├── database/     # Prisma schema and database client
│   └── shared/       # Shared types and utilities
├── scripts/          # Utility scripts
├── init-scripts/     # Database initialization scripts
├── docker-compose.yml # Docker services configuration
└── ...
```

## Development Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start development services:
   ```bash
   docker-compose up -d
   ```

3. Run database migrations:
   ```bash
   pnpm --filter @loantrack/database db:migrate
   ```

4. Start the API server:
   ```bash
   pnpm --filter @loantrack/api dev
   ```

## Services

- **API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values.