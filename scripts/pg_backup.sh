#!/bin/bash

# PostgreSQL Backup Script for LoanTrack
# Usage: ./scripts/pg_backup.sh

set -e

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="loantrack_${DATE}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Database connection details (from environment or defaults)
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"loantrack"}
DB_USER=${DB_USER:-"postgres"}

echo "Starting backup of ${DB_NAME} database..."

# Perform the backup
pg_dump \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --dbname="${DB_NAME}" \
  --verbose \
  --clean \
  --no-owner \
  --no-privileges \
  --file="${BACKUP_PATH}"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup successful: ${BACKUP_PATH}"
  
  # Compress the backup
  gzip "${BACKUP_PATH}"
  echo "Backup compressed: ${BACKUP_PATH}.gz"
  
  # Remove backups older than 30 days
  find "${BACKUP_DIR}" -name "loantrack_*.sql.gz" -mtime +30 -delete
  echo "Old backups cleaned up"
else
  echo "Backup failed!"
  exit 1
fi