#!/bin/bash
# ==========================================
# 04_switch.sh — تفعيل الخدمة الجديدة
# ==========================================
set -euo pipefail

echo ""
echo "═══════════════════════════════════════"
echo "  04_switch.sh — Switch to PostgreSQL"
echo "═══════════════════════════════════════"
echo ""

source .env 2>/dev/null || true

# ─── Ensure Redis is running ───
echo "  Ensuring Redis is running..."
docker-compose up -d redis
echo "  ✅ Redis started"
echo ""

# ─── Pre-flight ───
echo "  ── Pre-flight Checks ──"

# Prisma validate
echo "    Running prisma validate..."
docker-compose run --rm \
    -e DATABASE_URL="postgresql://darin:${DB_PASSWORD}@postgres:5432/darin" \
    app npx prisma validate --schema=./server/prisma/schema.pg.prisma || {
    echo "    ❌ Prisma schema validation failed"
    exit 1
}
echo "    ✅ Prisma schema valid"

# Re-run verify data checks
echo "    Running verify (data integrity + relations)..."
node server/scripts/verify/index.js --data --exit-code || {
    echo "    ❌ Verification failed — aborting switch"
    exit 1
}
echo "    ✅ Verification passed"

echo ""

# ─── Deploy ───
echo "  ── Deploy ──"

# Build + start app
echo "    Building and starting app container..."
docker-compose up -d --build app
echo "    App container started"

# Wait for health
echo "    Waiting for health check..."
for i in $(seq 1 30); do
    if curl -sf http://localhost:3001/health > /dev/null 2>&1; then
        echo "    ✅ Health check passed (after ${i}s)"
        break
    fi
    if [ "$i" -eq 30 ]; then
        echo "    ❌ Health check failed within 30s"
        docker-compose logs app --tail 30
        exit 1
    fi
    sleep 2
done

echo ""

# ─── Post-deploy Smoke Test ───
echo "  ── API Smoke Test ──"
API_BASE_URL="${API_BASE_URL:-http://localhost:3001}" \
    node server/scripts/verify/index.js --api --exit-code || {
    echo "    ❌ Smoke test failed"
    exit 1
}
echo "    ✅ Smoke test passed"

echo ""

# ─── Switch Nginx (if applicable) ───
echo "  ── Switch Nginx ──"
if command -v nginx &>/dev/null; then
    nginx -t && nginx -s reload
    echo "    ✅ Nginx reloaded"
else
    echo "    ⚠️  Nginx not found on this host (assumes reverse proxy elsewhere)"
fi

echo ""
echo "═══════════════════════════════════════"
echo "  ✅ PostgreSQL switch complete!"
echo "  Now run: bash deploy/05_post_deploy_monitor.sh"
echo "═══════════════════════════════════════"
echo ""
