#!/bin/bash

# دليـل نشـر مشـروع داريـن على Hostinger VPS
# هذا السكربت يقوم بتحديث الكود من GitHub وإعادة تشغيل الحاويات

echo "🚀 بدء عملية التحديث والنشر..."

# 1. سحب آخر التحديثات من جيت هاب
echo "📥 سحب الكود الجديد من GitHub..."
git pull origin main

# 2. بناء وتشغيل الحاويات باستخدام Docker Compose (V2)
echo "🏗️ إيقاف وبناء وتشغيل الحاويات..."
docker compose down
# حل مشكلة تعارض الأسماء (Conflict)
docker rm -f darin-app || true
docker compose up -d --build

# 3. تنظيف الصور القديمة (غير المستخدمة) لتوفير مساحة
echo "🧹 تنظيف الملفات غير المستخدمة..."
docker image prune -f

echo "✅ تم التحديث والنشر بنجاح! موقعك يعمل الآن."
