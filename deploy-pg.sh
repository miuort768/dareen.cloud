#!/bin/bash
# ==========================================
# نشر PostgreSQL - دارين السابعة
# ==========================================
set -euo pipefail

echo "=== PostgreSQL Deployment Script ==="
echo ""

# 1. التأكد من وجود ملف .env
if [ ! -f .env ]; then
    echo "ERROR: .env file not found! Create it with DB_PASSWORD and JWT_SECRET."
    exit 1
fi
source .env

# 2. نسخ احتياطي لقواعد البيانات SQLite
BACKUP_DIR="backups/pre-pg-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "Backing up SQLite databases to $BACKUP_DIR..."
cp server/database.sqlite "$BACKUP_DIR/" 2>/dev/null || echo "  (no legacy DB)"
cp server/dev.db "$BACKUP_DIR/" 2>/dev/null || echo "  (no dev.db)"
echo "  Done."

# 3. إيقاف الخدمات الحالية
echo "Stopping current services..."
docker-compose down
echo "  Done."

# 4. تشغيل PostgreSQL
echo "Starting PostgreSQL..."
docker-compose up -d postgres
echo "Waiting for PostgreSQL to be healthy..."
sleep 10
docker-compose exec -T postgres pg_isready -U darin -d darin || {
    echo "Waiting more..."
    sleep 15
    docker-compose exec -T postgres pg_isready -U darin -d darin
}
echo "  PostgreSQL is ready."

# 5. تطبيق السكيما (إنشاء الجداول)
echo "Pushing Prisma schema to PostgreSQL..."
docker-compose run --rm \
    -e DATABASE_URL="postgresql://darin:${DB_PASSWORD}@postgres:5432/darin" \
    app npx prisma db push --schema=./server/prisma/schema.pg.prisma --accept-data-loss
echo "  Schema pushed."

# 6. بناء وتشغيل التطبيق
echo "Building and starting the app..."
docker-compose up -d --build app
echo "  App started."

# 7. ترحيل البيانات من SQLite إلى PostgreSQL
echo ""
echo "=== Data Migration: SQLite → PostgreSQL ==="
echo ""

# تشغيل السكريبت في container مؤقت
docker-compose run --rm \
    -e DATABASE_URL="postgresql://darin:${DB_PASSWORD}@postgres:5432/darin" \
    -e SOURCE_DB="/database/dev.db" \
    app node server/scripts/migrate_sqlite_to_pg.js

echo ""
echo "=== Deployment Complete ==="
echo "Verify the app at https://dareen.cloud"
echo ""
echo "To rollback:"
echo "  1. docker-compose down"
echo "  2. Restore from $BACKUP_DIR"
echo "  3. git checkout schema.prisma (SQLite version)"
echo "  4. docker-compose up -d --build app"
