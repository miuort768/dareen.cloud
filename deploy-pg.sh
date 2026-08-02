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

# 2. نسخ احتياطي لقاعدة البيانات (اختياري — إن كانت PostgreSQL تعمل)
BACKUP_DIR="backups/pre-deploy-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "Backup directory created: $BACKUP_DIR"
if docker-compose exec -T postgres pg_isready -U darin -d darin &>/dev/null; then
    docker-compose exec -T postgres pg_dump -U darin -d darin -Fc > "$BACKUP_DIR/darin_db.pgdump"
    echo "  PostgreSQL dumped → $BACKUP_DIR/darin_db.pgdump"
else
    echo "  PostgreSQL not running yet — no dump (first deploy)."
fi

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

# 5. تطبيق الهجرات (Prisma Migrate)
echo "Applying migrations to PostgreSQL..."
docker-compose run --rm \
    -e DATABASE_URL="postgresql://darin:${DB_PASSWORD}@postgres:5432/darin" \
    app sh -c "cd server && npx prisma migrate deploy"
echo "  Migrations applied."

# 6. بناء وتشغيل التطبيق
echo "Building and starting the app..."
docker-compose up -d --build app
echo "  App started."

echo ""
echo "=== Deployment Complete ==="
echo "Verify the app at https://dareen.cloud"
echo ""
echo "To rollback:"
echo "  1. docker-compose down"
echo "  2. Restore the latest PostgreSQL dump:"
echo "     cat $BACKUP_DIR/darin_db.pgdump | docker-compose exec -T postgres pg_restore -U darin -d darin"
echo "  3. docker-compose up -d --build app"
echo ""
echo "Note: legacy SQLite data migration (server/scripts/migrate_sqlite_to_pg.js) is obsolete."
echo "      Do NOT run it — data lives in PostgreSQL only."
