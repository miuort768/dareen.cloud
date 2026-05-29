#!/bin/bash

# دليـل نشـر مشـروع داريـن على Hostinger VPS
# هذا السكربت يقوم بتحديث الكود من GitHub وإعادة تشغيل الحاويات

# التاكد اننا في مسار المشروع الصحيح
cd "$(dirname "$0")" || exit 1

echo "🚀 بدء عملية التحديث والنشر..."
echo "📁 المسار الحالي: $(pwd)"

# 1. سحب آخر التحديثات من جيت هاب
echo "📥 سحب الكود الجديد من GitHub..."
git pull origin main

# 2. إيقاف وإزالة الحاويات القديمة (حل مشكلة Conflict)
echo "🛑 إيقاف الحاويات القديمة..."
docker compose down --remove-orphans || true
docker rm -f darin-app livekit-server 2>/dev/null || true

# 3. قتل أي عملية قديمة على المنافذ المستخدمة (حل مشكلة address already in use)
echo "🔪 تحرير المنافذ القديمة..."
fuser -k 3001/tcp 2>/dev/null || true
fuser -k 3005/tcp 2>/dev/null || true

# 4. بناء وتشغيل الحاويات
echo "🏗️ بناء وتشغيل الحاويات..."
docker compose up -d --build

# 5. تنظيف الصور القديمة (غير المستخدمة) لتوفير مساحة
echo "🧹 تنظيف الملفات غير المستخدمة..."
docker image prune -f

echo "✅ تم التحديث والنشر بنجاح! موقعك يعمل الآن."
