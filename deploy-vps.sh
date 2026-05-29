#!/bin/bash

# دليـل نشـر مشـروع داريـن على Hostinger VPS
# هذا السكربت يقوم بتحديث الكود من GitHub وإعادة تشغيل الحاويات

# التاكد اننا في مسار المشروع الصحيح
cd "$(dirname "$0")" || exit 1

echo "🚀 بدء عملية التحديث والنشر..."
echo "📁 المسار الحالي: $(pwd)"

# 1. سحب آخر التحديثات من جيت هاب (force pull)
echo "📥 سحب الكود الجديد من GitHub..."
git fetch origin main
git reset --hard origin/main

# 2. إيقاف وإزالة الحاويات القديمة (حل مشكلة Conflict)
echo "🛑 إيقاف الحاويات القديمة..."
docker compose down --remove-orphans || true
docker rm -f darin-app livekit-server 2>/dev/null || true

# 3. قتل أي عملية قديمة على المنافذ المستخدمة (حل مشكلة address already in use)
echo "🔪 تحرير المنافذ القديمة..."
for port in 8080 3005; do
  pid=$(ss -tlnp 2>/dev/null | grep ":$port " | sed 's/.*pid=\([0-9]*\).*/\1/')
  if [ -n "$pid" ] && [ "$pid" != "0" ]; then
    echo "   -> إنهاء عملية $pid على المنفذ $port"
    kill -9 "$pid" 2>/dev/null || true
  fi
done

# 4. بناء وتشغيل الحاويات (بدون cache لضمان أحدث نسخة)
echo "🏗️ بناء وتشغيل الحاويات..."
docker compose build --no-cache
docker compose up -d

# 5. تنظيف الصور القديمة (غير المستخدمة) لتوفير مساحة
echo "🧹 تنظيف الملفات غير المستخدمة..."
docker image prune -f

echo "✅ تم التحديث والنشر بنجاح! موقعك يعمل الآن."
