# 🚀 دليل النشر النهائي على Hostinger VPS

بما أنك ستستخدم **GitHub** والترمينال، إليك الخطوات النهائية التي قمتُ بتجهيز المشروع لأجلها:

## 1. على جهازك الشخصي (Local)
قبل الرفع، تأكد أنك قمت بإضافة كل الملفات وعمل Commit:
```bash
git add .
git commit -m "Final production ready build"
git push origin main
```

## 2. على سيرفر Hostinger (عبر الترمينال)

### أول مرة فقط (الإعداد):
إذا لم تكن قد سحبت الكود بعد، قم بالتالي:
```bash
# اذهب إلى المجلد الذي تريد وضع المشروع فيه
cd /var/www

# اسحب المشروع
git clone https://github.com/USER_NAME/REPO_NAME.git darin-app
cd darin-app

# أنشئ ملف الإعدادات (مرة واحدة فقط)
cp .env.example .env
```
*⚠️ ملاحظة: ملف `.env` في جذر المشروع هو **مصدر الأسرار الوحيد** للنشر — `docker-compose.yml` يقرأه مباشرة (DB_PASSWORD, REDIS_PASSWORD, JWT_SECRET).*

المتغيرات الإلزامية قبل أي `docker-compose up` (بدونها يفشل النشر فورًا):
```bash
DB_PASSWORD=            # كلمة مرور PostgreSQL
REDIS_PASSWORD=         # كلمة مرور Redis (إلزامية)
JWT_SECRET=             # توقيع الجلسات — اترك قيمة قوية، لا القيمة الافتراضية
FRONTEND_URL=https://dareen.cloud
REMOTE_BACKUP_TARGET=   # اختياري: وجهة نسخ احتياطي خارج السيرفر (rsync)
```
> ملاحظة: ملف `server/.env.production` لم يعد مستخدمًا في مسار النشر — لا تضع الأسرار فيه.

### تشغيل المشروع (Docker):
لقد جهزت لك ملفات Docker لتعمل بضغطة واحدة:
```bash
# تشغيل كل شيء (الواجهة والسيرفر وقاعدة البيانات)
docker-compose up -d --build
```

### للتحديث مستقبلاً (بعد أي تعديل):
استخدم السكربت الذي صنعته لك `deploy-vps.sh`:
```bash
chmod +x deploy-vps.sh
./deploy-vps.sh
```

## 🛠️ كيف يعمل هذا الإعداد؟
1. **Dockerfile**: يقوم ببناء كود React (Vite) ووضعه داخل مجلد `dist` ثم تشغيل سيرفر Node.js.
2. **docker-compose**: يربط المجلدات ببعضها ويضمن تشغيل السيرفر على المنفذ `3001` بشكل دائم.
3. **البيانات**: قاعدة البيانات SQLite محفوظة في "Volume" خارجي، مما يعني أنها **لن تضيع** حتى لو حذفت الحاويات أو أعدت بناءها.

المشروع الآن جاهز 100% للرفع. بالتوفيق! 🎉
