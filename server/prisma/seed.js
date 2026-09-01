const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

let prisma;
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql')) {
  const { Pool } = require('pg');
  const { PrismaPg } = require('@prisma/adapter-pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  const { PrismaLibSql } = require('@prisma/adapter-libsql');
  const defaultUrl = 'file:' + path.resolve(__dirname, '..', 'dev.db').replace(/\\/g, '/');
  const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL || defaultUrl });
  prisma = new PrismaClient({ adapter });
}

const currencies = [
  { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م', isActive: 1, sortOrder: 1 },
];

const financialSettings = [
  { key: 'reportCurrency', value: 'EGP' },
  { key: 'decimalPlaces', value: '2' },
  { key: 'roundingMode', value: 'HALF_UP' },
  { key: 'autoUpdateRates', value: 'false' },
];

// عملة النظام الموحدة هي الجنيه المصري — لا حاجة لأسعار صرف
const defaultRates = [];

async function main() {
  for (const c of currencies) {
    await prisma.currency.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }

  // العملة الموحدة للنظام هي الجنيه المصري — إلغاء تنشيط أي عملات قديمة
  await prisma.currency.updateMany({
    where: { code: { not: 'EGP' } },
    data: { isActive: 0 },
  });

  for (const s of financialSettings) {
    await prisma.financialSetting.upsert({
      where: { key: s.key },
      update: s,
      create: s,
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (const r of defaultRates) {
    await prisma.exchangeRate.upsert({
      where: { fromCurrency_toCurrency_effectiveDate: { fromCurrency: r.fromCurrency, toCurrency: r.toCurrency, effectiveDate: today } },
      update: { buyRate: r.buyRate, sellRate: r.sellRate },
      create: { ...r, effectiveDate: today, notes: 'سعر افتراضي أولي' },
    });
  }

  // RBAC seed
  const permissionsData = [
    { key: '*', label: 'الوصول الكامل', group: 'system' },
    { key: 'dashboard.read', label: 'عرض لوحة التحكم', group: 'dashboard' },
    { key: 'dashboard.revenue', label: 'عرض الإيرادات', group: 'dashboard' },
    { key: 'dashboard.analytics', label: 'عرض التحليلات', group: 'dashboard' },
    { key: 'students.read', label: 'عرض الطلاب', group: 'students' },
    { key: 'students.create', label: 'إضافة طالب', group: 'students' },
    { key: 'students.edit', label: 'تعديل طالب', group: 'students' },
    { key: 'students.delete', label: 'حذف طالب', group: 'students' },
    { key: 'teachers.read', label: 'عرض المعلمين', group: 'teachers' },
    { key: 'teachers.create', label: 'إضافة معلم', group: 'teachers' },
    { key: 'teachers.edit', label: 'تعديل معلم', group: 'teachers' },
    { key: 'teachers.delete', label: 'حذف معلم', group: 'teachers' },
    { key: 'finance.read', label: 'عرض المالية', group: 'finance' },
    { key: 'finance.transactions.create', label: 'إضافة معاملة مالية', group: 'finance' },
    { key: 'finance.transactions.delete', label: 'حذف معاملة مالية', group: 'finance' },
    { key: 'finance.invoices.read', label: 'عرض الفواتير', group: 'finance' },
    { key: 'finance.invoices.edit', label: 'تعديل الفواتير', group: 'finance' },
    { key: 'finance.reports', label: 'التقارير المالية', group: 'finance' },
    { key: 'sessions.read', label: 'عرض الجلسات', group: 'sessions' },
    { key: 'sessions.create', label: 'إضافة جلسة', group: 'sessions' },
    { key: 'sessions.edit', label: 'تعديل جلسة', group: 'sessions' },
    { key: 'leads.read', label: 'عرض العملاء المحتملين', group: 'leads' },
    { key: 'leads.create', label: 'إضافة عميل محتمل', group: 'leads' },
    { key: 'leads.edit', label: 'تعديل عميل محتمل', group: 'leads' },
    { key: 'system.settings', label: 'إعدادات النظام', group: 'system' },
    { key: 'system.users', label: 'إدارة المستخدمين', group: 'system' },
    { key: 'system.backup', label: 'النسخ الاحتياطي', group: 'system' },
    { key: 'system.audit', label: 'سجل التدقيق', group: 'system' },
  ];

  const createdPermissions = [];
  for (const p of permissionsData) {
    const perm = await prisma.permission.upsert({
      where: { key: p.key },
      update: { label: p.label, group: p.group },
      create: p,
    });
    createdPermissions.push(perm);
  }

  let adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: 'admin',
        label: 'مدير النظام',
        description: 'صلاحيات كاملة للنظام',
        isSystem: 1,
      },
    });
  }

  for (const perm of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: { granted: 1 },
      create: { roleId: adminRole.id, permissionId: perm.id, granted: 1 },
    });
  }

  console.log(`Seeded ${currencies.length} currencies, ${defaultRates.length} exchange rates, ${financialSettings.length} financial settings, ${createdPermissions.length} permissions, and admin role.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
