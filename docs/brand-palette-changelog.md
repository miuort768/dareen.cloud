# Brand Palette Changelog

**المشروع:** منصة دارين التعليمية  
**آخر تحديث:** 2026-07-01  
**الإصدار الحالي:** v0.9 Experimental

---

## v0.9 → v1.0

| الإصدار | التغيير | السبب |
|---|---|---|
| v0.9 → v1.0 | إضافة `textOnAccent` (slate[900]) إلى palette.ts | توفير لون نص مناسب للعناصر ذات خلفية ذهبية |
| v0.9 → v1.0 | إضافة `text-on-accent` إلى semantic.ts | ربط Semantic Token جديد لاستخدامات Premium/Badges |
| v0.9 → v1.0 | إضافة `fontWeight` (normal/medium/semibold/bold) إلى design-tokens.ts | إكمال نظام Typography بأوزان الخط الأساسية |
| v0.9 → v1.0 | إضافة `textOnError`, `focusRing`, `errorHover`, `errorActive` إلى palette.ts | إصلاح مشاكل الـ Destructive Button + Focus Ring |
| v0.9 → v1.0 | إضافة `text-on-error`, `ring-focus`, `bg-error-hover`, `bg-error-active` إلى semantic.ts | ربط الـ Semantic Tokens الجديدة لاستخدامها في المكونات |
| v0.9 → v1.0 | إضافة `radius.card` (0.75rem) + `shadows.card` إلى design-tokens.ts | Token رسمي لزوايا وظلال البطاقات (بدلاً من `rounded-card` غير المعرّف) |
| v0.9 → v1.0 | إضافة `focus`, `error.hover`, `error.active`, `borderRadius.card`, `boxShadow.card` إلى tailwind.config.js | تمكين Tailwind من استخدام الـ tokens الجديدة |
| v0.9 → v1.0 | إصلاح Playground: focus rings, active states, `text-white` → `text-on-*`, Charts HEX → CSS vars | تمشياً مع Token Compliance |

---

## معايير الاعتماد (v1.0)

- [ ] لا يوجد عنصر حصل على تقييم **أقل من 4/5** دون خطة معالجة.
- [ ] جميع عناصر **Accessibility** الأساسية ناجحة (Pass).
- [ ] لا توجد ملاحظات حرجة (Critical) مفتوحة.

---

## تاريخ الإصدارات

| الإصدار | التاريخ | الحالة |
|---|---|---|
| v0.9 Experimental | 2026-07-01 | ⬜ قيد المراجعة |
| v1.0 | — | ⬜ غير معتمد بعد |
