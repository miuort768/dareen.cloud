/**
 * توحيد عملة النظام بالكامل إلى الجنيه المصري (EGP)
 * ---------------------------------------------------
 * يُشغَّل مرة واحدة على قاعدة البيانات الحالية:
 *   node server/prisma/unify-currency-egp.js
 *
 * يقوم بـ:
 *  1) تحويل كل أعمدة العملات في كل الجداول إلى 'EGP'
 *  2) إلغاء تنشيط أي عملات أخرى في جدول currencies
 *  3) حذف أسعار الصرف القديمة (لا حاجة لها بعملة موحدة)
 *  4) تصفير حقول سعر الصرف في الجلسات
 */
const path = require('path');
const fs = require('fs');

let prisma;
(async () => {
  // نفس آلية الاتصال المستخدمة في seed.js (LibSQL أو SQLite)
  try {
    const { PrismaLibSql } = require('@prisma/adapter-libsql');
    const { PrismaClient } = require('@prisma/client');
    const defaultUrl =
      'file:' + path.resolve(__dirname, '..', 'dev.db').replace(/\\/g, '/');
    const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL || defaultUrl });
    prisma = new PrismaClient({ adapter });
  } catch {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  }

  console.log('🔄 توحيد العملة إلى الجنيه المصري (EGP)...');

  // 1) الجداول الأساسية
  const steps = [
    ['teachers (currency)', () => prisma.teacher.updateMany({ where: { currency: { not: 'EGP' } }, data: { currency: 'EGP' } })],
    ['students (currency)', () => prisma.student.updateMany({ where: { currency: { not: 'EGP' } }, data: { currency: 'EGP' } })],
    ['sessions (studentCurrency)', () => prisma.session.updateMany({ where: { studentCurrency: { not: 'EGP' } }, data: { studentCurrency: 'EGP' } })],
    ['sessions (teacherCurrency)', () => prisma.session.updateMany({ where: { teacherCurrency: { not: 'EGP' } }, data: { teacherCurrency: 'EGP' } })],
    ['student_invoices (currency)', () => prisma.studentInvoice.updateMany({ where: { currency: { not: 'EGP' } }, data: { currency: 'EGP' } })],
    ['teacher_invoices (currency)', () => prisma.teacherInvoice.updateMany({ where: { currency: { not: 'EGP' } }, data: { currency: 'EGP' } })],
    ['manual_transactions (currency)', () => prisma.manualTransaction.updateMany({ where: { currency: { not: 'EGP' } }, data: { currency: 'EGP' } })],
    ['fixed_expenses (currency)', () => prisma.fixedExpense.updateMany({ where: { currency: { not: 'EGP' } }, data: { currency: 'EGP' } })],
  ];

  for (const [label, run] of steps) {
    try {
      const r = await run();
      console.log(`  ✅ ${label}: ${r.count} صف`);
    } catch (e) {
      console.warn(`  ⚠️ ${label}: ${e.message}`);
    }
  }

  // 2) تصفير حقول سعر الصرف في الجلسات (لم تعد ذات معنى)
  try {
    const r = await prisma.session.updateMany({
      where: { exchangeRateFrom: { not: null } },
      data: { exchangeRateFrom: null, exchangeRateTo: null, exchangeRateValue: null },
    });
    console.log(`  ✅ sessions (exchangeRate*): ${r.count} صف`);
  } catch (e) {
    console.warn(`  ⚠️ sessions (exchangeRate*): ${e.message}`);
  }

  // 3) إلغاء تنشيط العملات غير EGP
  try {
    const r = await prisma.currency.updateMany({
      where: { code: { not: 'EGP' } },
      data: { isActive: 0 },
    });
    console.log(`  ✅ currencies (تعطيل غير EGP): ${r.count}`);
  } catch (e) {
    console.warn(`  ⚠️ currencies: ${e.message}`);
  }

  // 4) ضمان وجود EGP نشطة
  try {
    await prisma.currency.upsert({
      where: { code: 'EGP' },
      update: { isActive: 1, symbol: 'ج.م', name: 'جنيه مصري', sortOrder: 1 },
      create: { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م', isActive: 1, sortOrder: 1 },
    });
    console.log('  ✅ EGP نشطة كعملة موحدة');
  } catch (e) {
    console.warn(`  ⚠️ EGP upsert: ${e.message}`);
  }

  // 5) حذف أسعار الصرف القديمة
  try {
    await prisma.exchangeRate.deleteMany({});
    console.log('  ✅ exchange_rates: تم الحذف (لا حاجة لها)');
  } catch (e) {
    console.warn(`  ⚠️ exchange_rates: ${e.message}`);
  }

  // 6) ضبط العملة الافتراضية في الإعدادات المالية
  try {
    await prisma.financialSetting.upsert({
      where: { key: 'reportCurrency' },
      update: { value: 'EGP' },
      create: { key: 'reportCurrency', value: 'EGP' },
    });
    console.log('  ✅ reportCurrency = EGP');
  } catch (e) {
    console.warn(`  ⚠️ reportCurrency: ${e.message}`);
  }

  console.log('🏁 اكتمل توحيد العملة: الجنيه المصري (EGP) في كامل النظام.');
  await prisma.$disconnect();
})();
