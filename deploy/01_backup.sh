#!/bin/bash
# ==========================================
# 01_backup.sh — نسخ احتياطي شامل
# ==========================================
set -euo pipefail

BACKUP_DIR="backups/pre-pg-$(date +%Y%m%d_%H%M%S)"
TIMESTAMP=$(date +%Y-%m-%d_%H:%M:%S)

echo ""
echo "═══════════════════════════════════════"
echo "  01_backup.sh — Backup"
echo "═══════════════════════════════════════"
echo ""

# 1. إنشاء مجلد النسخ الاحتياطي
mkdir -p "$BACKUP_DIR"
echo "  Backup directory: $BACKUP_DIR"
echo ""

# 2. نسخ قواعد بيانات SQLite
echo "  ── SQLite Databases ──"
for db in server/database.sqlite server/dev.db; do
    if [ -f "$db" ]; then
        cp "$db" "$BACKUP_DIR/"
        echo "    ✅ $db → $BACKUP_DIR/"
    else
        echo "    ⚠️  $db not found (skipping)"
    fi
done

# 3. نسخ PostgreSQL (إذا كان موجوداً)
echo "  ── PostgreSQL ──"
if docker-compose exec -T postgres pg_isready -U darin -d darin &>/dev/null; then
    docker-compose exec -T postgres pg_dump -U darin -d darin -Fc > "$BACKUP_DIR/darin_db.pgdump"
    echo "    ✅ PostgreSQL dumped → $BACKUP_DIR/darin_db.pgdump"
else
    echo "    ⚠️  PostgreSQL not running (skipping)"
fi

# 4. نسخ الإعدادات
echo "  ── Configuration ──"
for f in server/.env.production docker-compose.yml; do
    if [ -f "$f" ]; then
        cp "$f" "$BACKUP_DIR/"
        echo "    ✅ $f → $BACKUP_DIR/"
    fi
done

# 5. نسخ الملفات المرفوعة
echo "  ── Uploads ──"
if [ -d "server/uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads.tar.gz" -C server uploads 2>/dev/null || \
    tar -czf "$BACKUP_DIR/uploads.tar.gz" server/uploads 2>/dev/null || \
    echo "    ⚠️  Could not archive uploads"
    echo "    ✅ Uploads archived → $BACKUP_DIR/uploads.tar.gz"
else
    echo "    ⚠️  Uploads directory not found (skipping)"
fi

# 6. رفع النسخة خارج السيرفر (اختياري)
if [ -n "${REMOTE_BACKUP_TARGET:-}" ]; then
    echo "  ── Remote Backup ──"
    rsync -az --progress "$BACKUP_DIR/" "$REMOTE_BACKUP_TARGET/" && \
        echo "    ✅ Synced to $REMOTE_BACKUP_TARGET" || \
        echo "    ❌ Remote sync failed (check REMOTE_BACKUP_TARGET)"
fi

echo ""
echo "═══════════════════════════════════════"
echo "  ✅ Backup complete: $BACKUP_DIR"
echo "═══════════════════════════════════════"
echo ""
