-- توحيد عملة النظام بالكامل إلى الجنيه المصري (EGP)

-- تغيير الافتراضي في جدول الطلاب
ALTER TABLE "students" ALTER COLUMN "currency" SET DEFAULT 'EGP';

-- تحويل كل البيانات القديمة إلى الجنيه المصري
UPDATE "teachers" SET "currency" = 'EGP' WHERE "currency" IS NOT NULL AND "currency" <> 'EGP';
UPDATE "students" SET "currency" = 'EGP' WHERE "currency" <> 'EGP';
UPDATE "sessions" SET "studentCurrency" = 'EGP' WHERE "studentCurrency" IS NOT NULL AND "studentCurrency" <> 'EGP';
UPDATE "sessions" SET "teacherCurrency" = 'EGP' WHERE "teacherCurrency" IS NOT NULL AND "teacherCurrency" <> 'EGP';
UPDATE "student_invoices" SET "currency" = 'EGP' WHERE "currency" IS NOT NULL AND "currency" <> 'EGP';
UPDATE "teacher_invoices" SET "currency" = 'EGP' WHERE "currency" IS NOT NULL AND "currency" <> 'EGP';
UPDATE "manual_transactions" SET "currency" = 'EGP' WHERE "currency" IS NOT NULL AND "currency" <> 'EGP';
UPDATE "fixed_expenses" SET "currency" = 'EGP' WHERE "currency" IS NOT NULL AND "currency" <> 'EGP';

-- تصفير حقول أسعار الصرف في الجلسات (لم تعد ذات معنى بعملة موحدة)
UPDATE "sessions" SET "exchangeRateFrom" = NULL, "exchangeRateTo" = NULL, "exchangeRateValue" = NULL;

-- العملة الموحدة الوحيدة النشطة
UPDATE "currencies" SET "isActive" = 0 WHERE "code" <> 'EGP';
INSERT INTO "currencies" ("code", "name", "symbol", "isActive", "sortOrder")
VALUES ('EGP', 'جنيه مصري', 'ج.م', 1, 1)
ON CONFLICT("code") DO UPDATE SET "isActive" = 1, "symbol" = 'ج.م', "name" = 'جنيه مصري', "sortOrder" = 1;

-- لا حاجة لأسعار الصرف بعملة موحدة
DELETE FROM "exchange_rates";

-- العملة الافتراضية للتقارير
INSERT INTO "financial_settings" ("key", "value") VALUES ('reportCurrency', 'EGP')
ON CONFLICT("key") DO UPDATE SET "value" = 'EGP';
