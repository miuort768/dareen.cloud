# Brand Foundation — منصة دارين

## فلسفة الهوية

دارين منصة تعليمية موجهة لدول الخليج، تعكس:
- **الثقة (Trust)** — اللون الأساسي يعطي إحساسًا بالاستقرار والموثوقية
- **التميز الأكاديمي (Excellence)** — لمسات ذهبية محدودة للجودة والإنجاز
- **الحداثة التقنية (Modern Technology)** — واجهة نظيفة، مسافات مريحة، ألوان هادئة
- **الوضوح (Clarity)** — سهولة القراءة، تباين عالٍ، اتساق في كل صفحة

## العائلات اللونية (Version 0.9 — قيد الاختبار)

| Token | Color Family | الحالة | ملاحظة |
|---|---|---|---|
| Primary | Indigo | ✅ معتمد | الدرجة بعد Visual Review |
| Accent | Gold | ✅ معتمد | استخدام محدود (Premium فقط) |
| Neutral | Slate | ✅ معتمد | خلفيات، نصوص، حدود |
| Success | Emerald | ✅ معتمد | ثابت في جميع الثيمات |
| Warning | Amber | ✅ معتمد | ثابت في جميع الثيمات |
| Error | Rose | ✅ معتمد | ثابت في جميع الثيمات |
| Info | Sky | ✅ معتمد | ثابت في جميع الثيمات |

## قواعد استخدام الـ Accent (Gold)

### مسموح
- شهادات التقدير
- الأوسمة والـ Badges
- Premium / الاشتراكات المميزة
- الإنجازات
- الجوائز
- عناصر التسويق

### ممنوع
- الأزرار العادية (Primary, Secondary, Outline, Ghost)
- الروابط
- القوائم
- الجداول
- النماذج (Forms, Inputs)
- الأيقونات الوظيفية

## قواعد ألوان الحالة

ألوان Success و Warning و Error و Info **ثابتة في جميع الثيمات** ولا تتغير عند تبديل Primary.

## Dependency Rules

```
Components
    ↓
Semantic Tokens (bg-surface, text-muted, border-primary)
    ↓
Palette (primary = indigo.600, surface = slate.50)
    ↓
Primitives (indigo { 50→900 }, slate { 50→900 })
```

**ممنوع استيراد Primitives أو استخدام HEX مباشر داخل أي Component.**
