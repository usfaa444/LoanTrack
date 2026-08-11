-- Init script for LoanTrack PostgreSQL database
-- Database is auto-created by POSTGRES_DB env variable

\c loantrack;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
