#!/bin/bash
# ==========================================
# 02_migrate.sh — تشغيل PostgreSQL فقط
# ==========================================
set -euo pipefail

echo ""
echo "═══════════════════════════════════════"
echo "  02_migrate.sh — Migration"
echo "═══════════════════════════════════════"
echo ""

# 1. تشغيل PostgreSQL + Redis
echo "  Starting PostgreSQL..."
docker-compose up -d postgres
echo ""

# 2. انتظار PostgreSQL
echo "  Waiting for PostgreSQL to be healthy..."
for i in $(seq 1 30); do
    if docker-compose exec -T postgres pg_isready -U darin -d darin &>/dev/null; then
        echo "  ✅ PostgreSQL is ready (after ${i}s)"
        break
    fi
    if [ "$i" -eq 30 ]; then
        echo "  ❌ PostgreSQL failed to start within 30s"
        docker-compose logs postgres --tail 20
        exit 1
    fi
    sleep 1
done
echo ""

echo "  Starting Redis..."
docker-compose up -d redis
echo ""

# 3. دفع السكيما (إنشاء الجداول)
echo "  Pushing Prisma schema..."
docker-compose run --rm \
    -e DATABASE_URL="postgresql://darin:${DB_PASSWORD}@postgres:5432/darin" \
    app npx prisma db push --schema=./server/prisma/schema.pg.prisma --accept-data-loss
echo "  ✅ Schema pushed"
echo ""

# 4. ترحيل البيانات
echo "  Migrating data from SQLite to PostgreSQL..."
docker-compose run --rm \
    -e DATABASE_URL="postgresql://darin:${DB_PASSWORD}@postgres:5432/darin" \
    -e SOURCE_DB="/database/dev.db" \
    app node server/scripts/migrate_sqlite_to_pg.js
echo "  ✅ Data migration complete"
echo ""

echo "═══════════════════════════════════════"
echo "  ✅ Migration phase complete."
echo "  Now run: bash deploy/03_run_verify.sh"
echo "═══════════════════════════════════════"
echo ""
