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

# 2. نسخ PostgreSQL
echo "  ── PostgreSQL ──"
if docker-compose exec -T postgres pg_isready -U darin -d darin &>/dev/null; then
    docker-compose exec -T postgres pg_dump -U darin -d darin -Fc > "$BACKUP_DIR/darin_db.pgdump"
    echo "    ✅ PostgreSQL dumped → $BACKUP_DIR/darin_db.pgdump"
else
    echo "    ⚠️  PostgreSQL not running (skipping)"
fi

# 3. نسخ الإعدادات (مصدر الأسرار الحقيقي هو .env في جذر المشروع)
echo "  ── Configuration ──"
for f in .env docker-compose.yml; do
    if [ -f "$f" ]; then
        cp "$f" "$BACKUP_DIR/"
        echo "    ✅ $f → $BACKUP_DIR/"
    fi
done

# 4. نسخ الملفات المرفوعة
echo "  ── Uploads ──"
if [ -d "server/uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads.tar.gz" -C server uploads 2>/dev/null || \
    tar -czf "$BACKUP_DIR/uploads.tar.gz" server/uploads 2>/dev/null || \
    echo "    ⚠️  Could not archive uploads"
    echo "    ✅ Uploads archived → $BACKUP_DIR/uploads.tar.gz"
else
    echo "    ⚠️  Uploads directory not found (skipping)"
fi

# 5. رفع النسخة خارج السيرفر (اختياري)
if [ -n "${REMOTE_BACKUP_TARGET:-}" ]; then
    echo "  ── Remote Backup ──"
    rsync -az --progress "$BACKUP_DIR/" "$REMOTE_BACKUP_TARGET/" && \
        echo "    ✅ Synced to $REMOTE_BACKUP_TARGET" || \
        echo "    ❌ Remote sync failed (check REMOTE_BACKUP_TARGET)"
else
    echo "  ⚠️  REMOTE_BACKUP_TARGET غير مضبوطة — لا توجد نسخة خارج السيرفر."
    echo "      عرّفها في .env (مثال: REMOTE_BACKUP_TARGET=user@host:/path) لنسخ احتياطي خارجي."
fi

# 6. الاستبقاء — الاحتفاظ بآخر KEEP نسخة فقط (الافتراضي: 7)
KEEP="${BACKUP_RETENTION:-7}"
if [ -d backups ]; then
    TOTAL=$(find backups -maxdepth 1 -type d \( -name 'pre-pg-*' -o -name 'pre-deploy-*' \) | wc -l || true)
    if [ "$TOTAL" -gt "$KEEP" ]; then
        TRIM=$((TOTAL - KEEP))
        echo ""
        echo "  ── Retention (keeping latest ${KEEP}, removing ${TRIM} old) ──"
        find backups -maxdepth 1 -type d \( -name 'pre-pg-*' -o -name 'pre-deploy-*' \) | sort | head -n "$TRIM" | while read -r old; do
            echo "    Removing: ${old}"
            rm -rf "${old}"
        done || true
    fi
fi

echo ""
echo "═══════════════════════════════════════"
echo "  ✅ Backup complete: $BACKUP_DIR"
echo "═══════════════════════════════════════"
echo ""
