#!/bin/bash

# دليـل نشـر مشـروع داريـن على Hostinger VPS
# هذا السكربت يقوم بتحديث الكود من GitHub وإعادة تشغيل الحاويات

# التاكد اننا في مسار المشروع الصحيح
cd "$(dirname "$0")" || exit 1

echo "🚀 بدء عملية التحديث والنشر..."
echo "📁 المسار الحالي: $(pwd)"

# 0. التأكد من وجود متغيرات البيئة المطلوبة
if [ -z "$LIVEKIT_API_KEY" ] || [ -z "$LIVEKIT_API_SECRET" ]; then
  if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs) 2>/dev/null || true
  fi
  if [ -z "$LIVEKIT_API_KEY" ] || [ -z "$LIVEKIT_API_SECRET" ]; then
    echo "⚠️  تحذير: LIVEKIT_API_KEY أو LIVEKIT_API_SECRET غير موجودة في .env"
    echo "   البث المباشر لن يعمل. أضفهم في ملف .env"
  fi
fi

if [ -z "$VITE_LIVEKIT_URL" ]; then
  VITE_LIVEKIT_URL="wss://dareen.cloud/livekit"
  echo "🔧 سيتم استخدام $VITE_LIVEKIT_URL كرابط LiveKit الافتراضي"
fi

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
for port in 8080 3005 7880 7882; do
  pid=$(ss -tlnp 2>/dev/null | grep ":$port " | sed 's/.*pid=\([0-9]*\).*/\1/')
  if [ -n "$pid" ] && [ "$pid" != "0" ]; then
    echo "   -> إنهاء عملية $pid على المنفذ $port"
    kill -9 "$pid" 2>/dev/null || true
  fi
done

# 4. إعداد Nginx: التأكد من وجود Proxy WebSocket لـ LiveKit
echo "🔧 التحقق من إعداد Nginx للبث المباشر..."
if [ -f /etc/nginx/sites-available/dareen.cloud ]; then
  if ! grep -q "location /livekit/" /etc/nginx/sites-available/dareen.cloud 2>/dev/null; then
    echo "   ⚠️ location /livekit/ غير موجود في Nginx!"
    echo "   قم بتشغيل هذا الأمر مرة واحدة لإضافته:"
    echo 'sed -i "/proxy_pass http:\/\/localhost:8080;/a\\n    location /livekit/ {\n        proxy_pass http://localhost:7880/;\n        proxy_http_version 1.1;\n        proxy_set_header Upgrade \$http_upgrade;\n        proxy_set_header Connection \"upgrade\";\n        proxy_set_header Host \$host;\n        proxy_read_timeout 86400;\n    }" /etc/nginx/sites-available/dareen.cloud && nginx -t && systemctl reload nginx'
  else
    echo "   ✅ location /livekit/ موجود مسبقاً"
    nginx -t && systemctl reload nginx 2>/dev/null
  fi
fi

# 5. بناء وتشغيل الحاويات (بدون cache لضمان أحدث نسخة)
echo "🏗️ بناء وتشغيل الحاويات..."
docker compose build --no-cache --build-arg VITE_LIVEKIT_URL="$VITE_LIVEKIT_URL"
docker compose up -d

# 5. تنظيف الصور القديمة (غير المستخدمة) لتوفير مساحة
echo "🧹 تنظيف الملفات غير المستخدمة..."
docker image prune -f

echo "✅ تم التحديث والنشر بنجاح! موقعك يعمل الآن."
