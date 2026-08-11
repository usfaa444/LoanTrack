-- Init script for LoanTrack PostgreSQL database
-- This script runs when the PostgreSQL container is first created

-- Create the loantrack database if it doesn't exist
CREATE DATABASE loantrack;

-- Connect to the loantrack database
\c loantrack;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";