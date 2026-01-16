# نشر معهد دارين - دليل الاستضافة

## 📦 الملفات الجاهزة
✅ تم بناء التطبيق بنجاح في مجلد `dist/`

## 🚀 خيارات النشر

### الخيار الأول: Vercel + Railway (الأسهل - مجاني)

#### 1. نشر الـ Frontend على Vercel
```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# نشر التطبيق
vercel --prod
```

**أو من الواجهة:**
1. اذهب إلى [vercel.com](https://vercel.com)
2. اربط حساب GitHub
3. استورد المشروع
4. Vercel سيكتشف Vite تلقائياً

#### 2. نشر الـ Backend على Railway
```bash
# تثبيت Railway CLI
npm i -g @railway/cli

# تسجيل الدخول
railway login

# إنشاء مشروع جديد
railway init

# نشر السيرفر
railway up
```

**بعد النشر:**
- ستحصل على رابط مثل: `https://your-app.railway.app`
- أضف `/api` في نهايته واستخدمه في `.env`:
  ```
  VITE_API_URL=https://your-app.railway.app/api
  ```

---

### الخيار الثاني: Netlify (للـ Frontend فقط)

```bash
# تثبيت Netlify CLI
npm i -g netlify-cli

# تسجيل الدخول
netlify login

# نشر التطبيق
netlify deploy --prod --dir=dist
```

---

## ⚙️ إعداد Environment Variables

### على Vercel:
1. اذهب إلى Project Settings
2. Environment Variables
3. أضف: `VITE_API_URL = https://your-backend.railway.app/api`

### على Netlify:
1. Site Settings → Environment Variables
2. أضف: `VITE_API_URL = https://your-backend.railway.app/api`

---

## 🗄️ قاعدة البيانات

### الحل السريع (Development):
Backend الحالي يستخدم `db.json` - يعمل مباشرة على Railway

### للإنتاج الحقيقي (Production):
استخدم قاعدة PostgreSQL من Railway:
1. في Railway Dashboard: New → Database → PostgreSQL
2. احصل على Connection String
3. عدّل `server/index.js` لاستخدام PostgreSQL بدلاً من `db.json`

---

## 📋 Checklist النشر

- [x] ✅ بناء التطبيق (`npm run build`)
- [ ] 🔧 نشر Backend على Railway
- [ ] 🌐 نشر Frontend على Vercel/Netlify
- [ ] 🔗 إضافة VITE_API_URL في Environment Variables
- [ ] ✅ اختبار التطبيق المنشور

---

## 🆘 استكشاف الأخطاء

### المشكلة: "Failed to fetch"
**الحل:** تأكد من أن:
- Backend يعمل ويمكن الوصول إليه
- CORS مفعّل في `server/index.js` (موجود بالفعل)
- VITE_API_URL صحيح في Environment Variables

### المشكلة: "Login not working"
**الحل:** تأكد من:
- قاعدة البيانات تحتوي على مستخدمين
- API endpoint `/auth/login` يعمل
- استخدام HTTPS (مطلوب للـ cookies)

---

## 📞 الدعم
للأسئلة أو المشاكل، راجع وثائق:
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Netlify Docs](https://docs.netlify.com)
