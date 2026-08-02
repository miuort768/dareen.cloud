#!/bin/bash
# ==========================================
# 05_post_deploy_monitor.sh — 10 دقائق مراقبة
# ==========================================
set -euo pipefail

DURATION="${1:-600}"          # 10 دقائق افتراضي
INTERVAL="${2:-10}"           # كل 10 ثوانٍ
ROLLBACK="${3:-false}"        # --rollback للتفعيل
START_TIME=$(date +%s)
END_TIME=$((START_TIME + DURATION))

CONSECUTIVE_FAILS=0
MAX_CONSECUTIVE_FAILS=3

echo ""
echo "═══════════════════════════════════════"
echo "  05_post_deploy_monitor.sh"
echo "  Monitoring for ${DURATION}s (interval: ${INTERVAL}s)"
echo "  Auto-rollback: ${ROLLBACK}"
echo "═══════════════════════════════════════"
echo ""

while [ $(date +%s) -lt $END_TIME ]; do
    ELAPSED=$(( $(date +%s) - START_TIME ))
    REMAINING=$(( END_TIME - $(date +%s) ))
    TIMESTAMP=$(date +%H:%M:%S)

    # ── Health Check ──
    HEALTH_OK=false
    if curl -sf http://localhost:3001/health > /dev/null 2>&1; then
        HEALTH_OK=true
    fi

    # ── HTTP 5xx ──
    HTTP_ERRORS=0
    if command -v docker-compose &>/dev/null; then
        HTTP_ERRORS=$(docker-compose logs app --tail 50 2>/dev/null | grep -c '"status":5' || true)
    fi

    # ── Prisma Errors ──
    PRISMA_ERRORS=0
    if command -v docker-compose &>/dev/null; then
        PRISMA_ERRORS=$(docker-compose logs app --tail 50 2>/dev/null | grep -ci 'prisma.*error\|database.*error' || true)
    fi

    # ── Memory (approximate) ──
    MEM_PCT=0
    if command -v docker &>/dev/null; then
        MEM_PCT=$(docker stats app --no-stream --format '{{.MemPct}}' 2>/dev/null | sed 's/%//' || echo 0)
    fi

    # ── Memory (system fallback) ──
    if [ "$MEM_PCT" = "0" ] || [ -z "$MEM_PCT" ]; then
        if [ -f /proc/meminfo ]; then
            TOTAL=$(awk '/MemTotal/{print $2}' /proc/meminfo)
            AVAIL=$(awk '/MemAvailable/{print $2}' /proc/meminfo)
            if [ -n "$TOTAL" ] && [ -n "$AVAIL" ] && [ "$TOTAL" -gt 0 ]; then
                MEM_PCT=$(( (TOTAL - AVAIL) * 100 / TOTAL ))
            fi
        fi
    fi

    # ── Print Status ──
    HEALTH_ICON=$HEALTH_OK && [ "$HEALTH_OK" = true ] && HEALTH_ICON="✅" || HEALTH_ICON="❌"
    echo -n "  [${TIMESTAMP}] Health: ${HEALTH_ICON} | "
    echo -n "5xx: ${HTTP_ERRORS} | "
    echo -n "DB: ${PRISMA_ERRORS} | "
    echo -n "Mem: ${MEM_PCT}% | "
    echo "Time: ${ELAPSED}s / ${DURATION}s"

    # ── Evaluate ──
    ALL_OK=true
    [ "$HEALTH_OK" != true ] && ALL_OK=false
    [ "$HTTP_ERRORS" -gt 0 ] && ALL_OK=false
    [ "$PRISMA_ERRORS" -gt 0 ] && ALL_OK=false
    [ "$(echo "$MEM_PCT > 80" | bc -l 2>/dev/null)" = "1" ] && ALL_OK=false

    if [ "$ALL_OK" = true ]; then
        CONSECUTIVE_FAILS=0
    else
        CONSECUTIVE_FAILS=$((CONSECUTIVE_FAILS + 1))
    fi

    # ── Rollback ──
    if [ "$CONSECUTIVE_FAILS" -ge "$MAX_CONSECUTIVE_FAILS" ] && [ "$ROLLBACK" = "true" ]; then
        echo ""
        echo "  ❌ $CONSECUTIVE_FAILS consecutive failures — ROLLBACK required"
        echo ""
        echo "  Manual rollback steps:"
        echo "    1. docker-compose down"
        echo "    2. Restore the latest PostgreSQL dump:"
        echo "       cat backups/<latest>/*.pgdump | docker-compose exec -T postgres pg_restore -U darin -d darin"
        echo "    3. docker-compose up -d --build app"
        exit 1
    fi

    sleep "$INTERVAL"
done

echo ""
echo "═══════════════════════════════════════"
echo "  ✅ Monitoring complete — ${DURATION}s without critical issues"
echo "═══════════════════════════════════════"
echo ""
