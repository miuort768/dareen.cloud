#!/bin/bash
# ==========================================
# 03_run_verify.sh — تشغيل التحقق
# ==========================================
set -euo pipefail

echo ""
echo "═══════════════════════════════════════"
echo "  03_run_verify.sh — Verification"
echo "═══════════════════════════════════════"
echo ""

source .env 2>/dev/null || true

# تشغيل التحقق من البيانات والعلاقات
echo "  Running Data Integrity + Relations checks..."
node server/scripts/verify/index.js --data --exit-code || EXIT_CODE=$?
echo ""

echo "═══════════════════════════════════════"
echo "  Verification script exit code: ${EXIT_CODE:-0}"
echo ""
echo "  0 = ALLOW SWITCH"
echo "  1 = BLOCK"
echo "  2 = ALLOW WITH WARNING"
echo "═══════════════════════════════════════"
echo ""

exit ${EXIT_CODE:-0}
