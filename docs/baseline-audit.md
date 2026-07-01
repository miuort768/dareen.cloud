# Baseline Audit — نظام الألوان في المنصة

**التاريخ:** 2026-07-01  
**نسخة المشروع:** main (f29491e)  
**الهدف:** تسجيل الوضع الحالي قبل البدء في توحيد الهوية البصرية

---

## المؤشرات الرئيسية

| المؤشر | القيمة الحالية | الهدف |
|---|---|---|
| عدد ملفات Components (.tsx) | 260 | — |
| عدد قيم HEX الفريدة | 184 | تقليلها جذريًا |
| عدد استخدامات HEX المباشرة | ~1,800 | 0 |
| عدد استخدامات `rgb(` | 12 ملف | 0 |
| عدد استخدامات `hsl(` | 0 | 0 |
| ملفات تستخدم Tailwind color classes | 224 من 260 | 0 |
| عدد الثيمات | 35 | 6–8 |
| المكونات التي تستخدم Semantic Tokens | 0% | 100% |

---

## أكثر 20 HEX استخدامًا

| الترتيب | HEX | عدد الاستخدامات | ملاحظة |
|---|---|---|---|
| 1 | `#6C4BFF` | 396 | البنفسجي الأساسي (Primary Brand) |
| 2 | `#8B5CF6` | 196 | بنفسجي ثانوي |
| 3 | `#2563EB` | 102 | أزرق (Info / Accent) |
| 4 | `#64748B` | 74 | Slate-500 (Neutral) |
| 5 | `#10B981` | 73 | أخضر (Success) |
| 6 | `#7C3AED` | 53 | Violet-600 |
| 7 | `#F43F5E` | 48 | Rose-500 (Error رئيسي) |
| 8 | `#E11D48` | 48 | Rose-600 (Premium) |
| 9 | `#F59E0B` | 46 | Amber-500 (Warning) |
| 10 | `#0F172A` | 46 | Slate-900 (خلفية غامقة) |
| 11 | `#94A3B8` | 41 | Slate-400 (نص باهت) |
| 12 | `#22C55E` | 32 | Green-500 |
| 13 | `#1E1E2F` | 25 | خلفية غامقة |
| 14 | `#5C59F2` | 18 | بنفسجي-أزرق مخصص |
| 15 | `#FFF` | 17 | أبيض |
| 16 | `#00A884` | 16 | أخضر/تيلي مخصص |
| 17 | `#F8F8FC` | 16 | خلفية صفحات فاتحة |
| 18 | `#EF4444` | 16 | Red-500 (Error ثانوي) |
| 19 | `#F8F7FF` | 14 | خلفية بنفسجية فاتحة |
| 20 | `#F1F5F9` | 13 | Slate-100 |

---

## توزيع ألوان Tailwind Classes

| العائلة اللونية | عدد مرات الظهور | الاستخدام |
|---|---|---|
| `slate` | 4,107 | Neutral رئيسي (خلفيات، نصوص، حدود) |
| `gray` | 1,164 | Neutral ثانوي |
| `emerald` | 566 | Success / إيرادات |
| `indigo` | 552 | Primary Brand |
| `rose` | 539 | Error / Destructive |
| `amber` | 407 | Warning |
| `blue` | 179 | Info |
| `purple` | 140 | Accent |
| `red` | 117 | Error (قديم) |
| `violet` | 68 | Accent إضافي |
| `green` | 31 | Success (قديم) |
| `yellow` | 33 | Warning (قديم) |
| `sky` | 33 | Info فاتح |
| `orange` | 18 | Warning إضافي |
| `teal` | 6 | نادر |
| `cyan` | 4 | نادر |
| `lime` | 2 | نادر |
| `pink` | 2 | نادر |
| `fuchsia` | 1 | نادر |

> **ملاحظة:** وجود `gray` (1,164), `green` (31), `yellow` (33) بالإضافة إلى `slate`, `emerald`, `amber` يدل على عدم توحيد الأسماء — بعض المكونات تستخدم النظام القديم.

---

## الثيمات (Theme Presets)

| العدد | التفاصيل |
|---|---|
| الإجمالي | 35 ثيم |
| الفريد فعليًا (RGB مختلف) | ~14 |
| المكرر (نفس RGB بأسماء مختلفة) | ~21 |

**الثيمات ذات القيم الفريدة:** indigo, blue, emerald, rose, amber, purple, cyan, teal, orange, slate, pink, lime, sky, fuchsia, electric, gold, lavender, spring, aurora, coffee, midnight

**الثيمات المكررة:** sunset=orange, ocean=blue, forest=emerald, royal=purple, mint=teal, berry=pink, crimson=rose, lava=red, flame=orange, nebula=electric, ice=sky, jungle=aurora (green variant), desert=amber, fire=red

---

## ألوان الحالة (Status Colors)

| اللون | HEX | عدد الاستخدامات | الحالة |
|---|---|---|---|
| Success | `#10B981` | 96 | ✅ أساسي |
| Error رئيسي | `#F43F5E` | 72 | ✅ أساسي |
| Error ثانوي | `#EF4444` | 16 | ❌ مكرر (يجب توحيده) |
| Warning | `#F59E0B` | 63 | ✅ أساسي |
| Info | `#2563EB` | 119 | ✅ أساسي |
| Info بديل | `#3B82F6` | 12 | ❌ مكرر (يجب توحيده) |

---

## التدرجات (Gradients)

| النوع | العدد |
|---|---|
| `bg-gradient-to-*` | 358 |
| `from-{color}` | 358 |
| `to-{color}` | 329 |
| `linear-gradient()` في CSS | 6 |

---

## CSS Custom Properties (الموجودة حاليًا)

| المجموعة | المتغيرات |
|---|---|
| Primary | `--color-primary`, `--color-primary-deep`, `--color-primary-mid`, `--color-primary-light`, `--color-primary-h` |
| Status | `--color-success`, `--color-warning` |
| Accent | `--color-gold` |
| Text | `--text-main`, `--text-muted`, `--text-dim` |
| Background | `--bg-surface`, `--bg-card`, `--bg-hover` |
| Border | `--border-main`, `--border-accent` |
| Effects | `--glass-bg`, `--glass-border`, `--shadow-premium` |

---

## ملخص المشكلة

1. **184 قيمة HEX فريدة** مبعثرة في 260 ملف — بدون نظام مركزي
2. **35 ثيم** كثير منها مكرر — يشتت الهوية
3. **ألوان الحالة غير موحدة** — يوجد `#EF4444` و `#F43F5E` للخطأ، `#2563EB` و `#3B82F6` للمعلومات
4. **يوجد خلط بين أنظمة الألوان** — `slate` و `gray` معًا، `emerald` و `green` معًا
5. **CSS Variables موجودة** لكن المكونات لا تستخدمها — لا تزال تعتمد على HEX مباشر
6. **224 ملف من 260** تستخدم Tailwind color classes مباشرة (`bg-indigo-`, `text-slate-`) بدل Semantic Tokens
