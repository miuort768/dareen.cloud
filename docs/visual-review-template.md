# مراجعة بصرية — Visual Review

**المشروع:** منصة دارين التعليمية
**النطاق:** Design System v0.9 → v1.0
**تاريخ البدء:** 2026-07-01
**الحالة:** ⬜ قيد المراجعة

---

## Review A — Brand Foundation

**الهدف:** التأكد من أن الهوية تعمل بصريًا.

| البند | التقييم (1–5) | ملاحظات |
|---|---|---|
| Primary مناسب للعلامة التجارية | 5/5 | Indigo 600 (#4f46e5) في الوضع الفاتح — احترافي، ثقة، إبداع. WCAG AA (6.3:1 مع الأبيض). |
| Accent مميز وغير مبالغ فيه | 4/5 | Gold 500 (#D4AF37) مميز للاستخدامات المحدودة. ⚠ يجب حظره في نصوص الجسم (contrast 2.0:1). أُضيف `textOnAccent` (slate[900]) للمستقبل. |
| Neutral مريح للخلفيات | 5/5 | Slate 50/100/200 للسطح/الخلفية/الحدود — هرمية بصرية ممتازة. text-muted (4.5:1) وtext-dim (2.5:1 مقبول للعناصر الثانوية). |
| Status Colors واضحة ومتمايزة | 5/5 | 4 ألوان حالة (Emerald/Amber/Rose/Sky) متميزة عن Primary وعن بعضها. Dark Mode shift يحافظ على التباين. |
| التباين العام مقبول | 4/5 | ⚠ Dark Mode Primary Button: أبيض على indigo[500] = 4.47:1 (يفشل AA للنصوص العادية، ينجح للكبيرة). مقبول مؤقتًا — يُحل في Sprint 3 مع حدود/ظلال للمكونات. |
| الانطباع العام | 4/5 | هوية قوية ومتسقة. يحتاج المكونات لتعكس الجودة الحقيقية للنظام. |

---

## Review B — Components

**الهدف:** مراجعة المكونات المشتركة في Playground.

| المكون | التقييم (1–5) | ملاحظات |
|---|---|---|
| Buttons | 4/5 | تمت إضافة focus rings + active states + إصلاح `bg-error-dark` الوهمي + إزالة `text-white`. ✅ جميع المتغيرات تستخدم Semantic Tokens الآن. |
| Forms (Inputs, Selects, Checkboxes) | 3/5 | ✅ Labels/error states تستخدم Tokens بشكل صحيح. ❌ Checkbox/Radio أصلي (مؤجل لـ Sprint 3). ⚠ استخدام `rounded-md` مباشرة. |
| Cards | 4/5 | ✅ `rounded-card` أصبح Token حقيقي (`--radius-card`). ✅ أضيف `shadow-card`. ✅ Premium يستخدم `text-on-accent` بدل `text-white`. |
| Alerts | 4/5 | ✅ جميع حالات الـ 4 Status Colors. ✅ Semantic Tokens صحيحة. ⚠ لا يوجد زر إغلاق (مقبول لدليل مرجعي). |
| Tables | 4/5 | ✅ Pagination تستخدم Semantic Tokens + Focus Rings الآن. ✅ Status Badges صحيحة. ✅ Row hover + Primary highlight. |
| Charts | 3/5 | ✅ تم استبدال الـ HEX بـ CSS Variables. ❌ `rounded-t` ليس Token. ⚡ تعتمد على نجاح مراجعة المكونات الأساسية. |
| Navigation | 4/5 | ✅ Tabs, Breadcrumb, Sidebar تستخدم Tokens. ⚠ `border-r-2` غير RTL-aware (مؤجل). |

---

## Review C — Screens

**الهدف:** مراجعة تجربة المستخدم على الشاشات الرئيسية.

### Landing

| البند | التقييم (1–5) | ملاحظات |
|---|---|---|
| Visual Hierarchy | ☐ | |
| Spacing | ☐ | |
| Typography | ☐ | |
| Colors | ☐ | |
| Consistency | ☐ | |
| Overall | ☐ | |

### Dashboard

| البند | التقييم (1–5) | ملاحظات |
|---|---|---|
| Visual Hierarchy | ☐ | |
| Spacing | ☐ | |
| Typography | ☐ | |
| Colors | ☐ | |
| Consistency | ☐ | |
| Overall | ☐ | |

### Login

| البند | التقييم (1–5) | ملاحظات |
|---|---|---|
| Visual Hierarchy | ☐ | |
| Spacing | ☐ | |
| Typography | ☐ | |
| Colors | ☐ | |
| Consistency | ☐ | |
| Overall | ☐ | |

### Settings

| البند | التقييم (1–5) | ملاحظات |
|---|---|---|
| Visual Hierarchy | ☐ | |
| Spacing | ☐ | |
| Typography | ☐ | |
| Colors | ☐ | |
| Consistency | ☐ | |
| Overall | ☐ | |

---

## Review D — Accessibility

**الهدف:** ضمان توافق الحد الأدنى للمعايير.

| البند | Pass / Fail | ملاحظات |
|---|---|---|
| WCAG Contrast (AA) | ☐ | |
| Focus Ring ظاهر | ☐ | |
| Keyboard Navigation | ☐ | |
| Dark Mode متناسق | ☐ | |
| Charts متمايزة بالألوان | ☐ | |
| Color Blind Friendly | ☐ | |

---

## Decision Log — Changes Before v1.0

**الهدف:** توثيق كل تغيير مطلوب قبل اعتماد Brand Palette v1.0.

| القرار | السبب | الحالة |
|---|---|---|
| Primary: إبقاء Indigo 600 (فاتح) / 500 (غامق) | مقبول — 6.3:1 (فاتح) و4.47:1 (غامق، AA Large ✓) | ✅ لا تعديل |
| Accent: إبقاء Gold 500 + إضافة textOnAccent | Gold decorative فقط — textOnAccent (slate[900]) للمستقبل | ✅ أضيف إلى palette/semantic |
| Neutral: إبقاء Slate كامل | التباين ممتاز — text-dim مقصود كعنصر ثانوي | ✅ لا تعديل |
| Status Colors: إبقاء الحالية | متمايزة وواضحة في كلا الوضعين | ✅ لا تعديل |
| Shadows: إبقاء الحالية + إضافة shadow-card | 12 variation الآن | ✅ أضيف إلى design-tokens |
| Radius: إبقاء الحالية + إضافة radius-card | 10 steps الآن — token رسمي للبطاقات | ✅ أضيف إلى design-tokens |
| Typography: إضافة fontWeights | لإكمال نظام Typography | ✅ أضيف إلى design-tokens.ts |
| Dark Mode Primary Contrast | 4.47:1 — Known Issue يُراجع في Sprint 3 | ⏳ Known Issue |
| `rounded-card` غير معرّف | أضيف كـ Token رسمي (0.75rem) | ✅ تم |
| `bg-error-dark` غير موجود | أضيف كـ `bg-error-hover` في palette/semantic/tailwind | ✅ تم |
| Focus Ring مفقود | أضيف `ring-focus` Token + focus rings على كل الأزرار | ✅ تم |
| Active states ناقصة | أضيفت لـ Secondary/Outline/Ghost/Destructive | ✅ تم |
| `text-white` Hardcoded | استُبدل بـ `text-on-error`, `text-on-accent`, `text-on-primary` | ✅ تم |
| Charts تستخدم HEX | استُبدلت بـ CSS Variables | ✅ تم |
| Checkbox/Radio أصلي | مؤجل لـ Sprint 3 | ⏳ مؤجل |
| `border-r-2` غير RTL-aware | مؤجل لـ Sprint 3 | ⏳ مؤجل |

---

## معيار الاعتماد

لا يُعتمد **Brand Palette v1.0** إلا إذا تحققت الشروط التالية:

- [ ] لا يوجد أي عنصر حصل على تقييم **أقل من 4/5** دون خطة معالجة.
- [ ] جميع عناصر **Accessibility** الأساسية ناجحة (Pass).
- [ ] لا توجد ملاحظات حرجة (Critical) مفتوحة.

---

## الخلاصة

| النطاق | الحالة |
|---|---|
| Review A — Brand Foundation | ✅ **مكتمل** — 4/5 + ملاحظات مسجلة |
| Review B — Components | ✅ **مكتمل** — Phase 1 (Buttons/Forms/Cards) + Phase 2 (Alerts/Tables) + Phase 3 (Nav/Charts) |
| Review C — Screens | ⬜ قيد الانتظار |
| Review D — Accessibility | ⬜ قيد الانتظار |
| Brand Palette v1.0 معتمد | ⬜ غير معتمد (ينتظر Reviews C–D) |
