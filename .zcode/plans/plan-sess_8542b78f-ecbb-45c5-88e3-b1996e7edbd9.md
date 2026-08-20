
# خطة حل مشاكل المشروع — 4 سبرنتات

بعد تحليل عميق للمشروع، هذه هي المشاكل الحقيقية والخطوات لحلها:

---

## المشكلة 1: غياب التستات على الـ Shared Components (High)

**الوضع الحالي:** عندك 3 ملفات تست في `src/test/examples/` وهي templates فقط — وليست اختبارات حقيقية. الـ 32 shared component في `src/shared/components/ui/` بدون أي test. الـ Backend عنده 14 ملف test + coverage مظبوط، لكن الـ Frontend = صفر.

**الحل:**
1. إضافة `@vitest/coverage-v8` للـ frontend package.json
2. كتابة Unit Tests لأهم 10 Shared Components: `Button`, `Input`, `Modal`, `Dialog`, `Badge`, `Alert`, `Tabs`, `FormField`, `Dropdown`, `Avatar`
3. كل test يغطي: rendering, states (hover/focus/disabled), a11y (aria-*), dark mode class presence
4. إضافة `npm run test:coverage` script للـ frontend
5. إضافة Frontend tests في CI pipeline (deploy.yml) بجانب server tests

---

## المشكلة 2: CI/CD لا يشغل Frontend Tests (High)

**الوضع الحالي:** الـ `deploy.yml` في GitHub Actions يشغل فقط `vite build` للـ frontend و `npm test --prefix server` للـ backend. Frontend Vitest والـ E2E Playwright لا يتم تشغيلهما في CI. أي كسر في الـ Frontend هيتمش تكتشفه.

**الحل:**
1. إضافة Job جديد في `deploy.yml` اسمه `test-frontend` يشغل `npx vitest run --coverage`
2. جعل الـ deploy يعتمد على 3 jobs: `verify` + `test-server` + `test-frontend`
3. (اختياري) إضافة E2E job لـ Playwright يشتغل على main فقط

---

## المشكلة 3: غياب Prettier + Pre-commit Hooks (Medium)

**الوضع الحالي:** لا يوجد `.prettierrc` ولا `husky` ولا `lint-staged`. يعني أي developer ممكن يcommit كود بتنسيق مختلف. الـ ESLint استخدمته بس على مستوى recommended بدون formatting rules.

**الحل:**
1. إضافة `prettier` + `prettier-plugin-tailwindcss` (لترتيب Tailwind classes)
2. إنشاء `.prettierrc` بتنسيق موحد
3. إضافة `husky` + `lint-staged`: على كل commit يشغل ESLint + Prettier على الملفات المتغيرة فقط
4. إضافة `"format": "prettier --write \"src/**/*.{ts,tsx}\""` script

---

## المشكلة 4: الـ MSW Handlers ناقصة (Medium)

**الوضع الحالي:** `src/test/mocks/handlers.ts` فيه 4 endpoints فقط (login, verify, settings, health). المشروع فيه 30+ API endpoint (students, teachers, finance, attendance, schedule, etc.). من الصعب كتابة component tests بدون mock data حقيقي.

**الحل:**
1. توسيع `handlers.ts` ليغطي الـ endpoints الأساسية: `/students`, `/teachers`, `/sessions`, `/finance/*`, `/attendance/*`
2. إنشاء mock data factory functions (generators) تنتج بيانات واقعية
3. إنشاء ملف `src/test/mocks/data/` للـ mock data منظم

---

## ملخص التنفيذ

| المهمة | الأولوية | الملفات المتأثرة | التقدير |
|--------|---------|----------------|---------|
| Shared Component Tests | 🔴 High | `src/shared/components/ui/*.test.tsx` + `vitest.config.ts` + `package.json` | أكبر effort |
| CI Pipeline Fix | 🔴 High | `.github/workflows/deploy.yml` | صغير |
| Prettier + Husky | 🟡 Medium | `.prettierrc` + `package.json` + `.husky/pre-commit` | متوسط |
| MSW Handlers | 🟡 Medium | `src/test/mocks/handlers.ts` + `src/test/mocks/data/` | متوسط |

**ملاحظة:** المشاكل اللي ذكرتها في الرأي الأول (Dark Mode contrast + Performance) بعد التحليل اتضح إنها مظبوطة — الـ lazy loading يغطي 40+ route، الـ manual chunks في Vite مظبوطة (vendor, socket, motion, icons, charts, query, date)، والـ `focus-visible` + `aria-*` موجود في كل الـ shared components. ما عدا غياب التستات والـ CI والـ formatting، الباقي مكتوب صح.
