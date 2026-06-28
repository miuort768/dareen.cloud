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
  { code: 'KWD', name: 'دينار كويتي', symbol: 'د.ك', isActive: 1, sortOrder: 1 },
  { code: 'SAR', name: 'ريال سعودي', symbol: '﷼', isActive: 1, sortOrder: 2 },
  { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ', isActive: 1, sortOrder: 3 },
  { code: 'QAR', name: 'ريال قطري', symbol: '﷼', isActive: 1, sortOrder: 4 },
  { code: 'OMR', name: 'ريال عماني', symbol: '﷼', isActive: 1, sortOrder: 5 },
  { code: 'BHD', name: 'دينار بحريني', symbol: 'د.ب', isActive: 1, sortOrder: 6 },
  { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م', isActive: 1, sortOrder: 7 },
  { code: 'USD', name: 'دولار أمريكي', symbol: '$', isActive: 1, sortOrder: 8 },
];

const financialSettings = [
  { key: 'reportCurrency', value: 'KWD' },
  { key: 'decimalPlaces', value: '3' },
  { key: 'roundingMode', value: 'HALF_UP' },
  { key: 'autoUpdateRates', value: 'false' },
];

const defaultRates = [
  { fromCurrency: 'KWD', toCurrency: 'EGP', buyRate: 49.50, sellRate: 50.00 },
  { fromCurrency: 'KWD', toCurrency: 'SAR', buyRate: 12.40, sellRate: 12.50 },
  { fromCurrency: 'KWD', toCurrency: 'AED', buyRate: 12.10, sellRate: 12.20 },
  { fromCurrency: 'KWD', toCurrency: 'QAR', buyRate: 11.90, sellRate: 12.00 },
  { fromCurrency: 'KWD', toCurrency: 'OMR', buyRate: 1.28, sellRate: 1.30 },
  { fromCurrency: 'KWD', toCurrency: 'BHD', buyRate: 1.24, sellRate: 1.26 },
  { fromCurrency: 'KWD', toCurrency: 'USD', buyRate: 3.30, sellRate: 3.32 },
  { fromCurrency: 'EGP', toCurrency: 'KWD', buyRate: 0.020, sellRate: 0.021 },
  { fromCurrency: 'SAR', toCurrency: 'KWD', buyRate: 0.080, sellRate: 0.081 },
  { fromCurrency: 'AED', toCurrency: 'KWD', buyRate: 0.082, sellRate: 0.083 },
  { fromCurrency: 'QAR', toCurrency: 'KWD', buyRate: 0.084, sellRate: 0.085 },
  { fromCurrency: 'OMR', toCurrency: 'KWD', buyRate: 0.77, sellRate: 0.78 },
  { fromCurrency: 'BHD', toCurrency: 'KWD', buyRate: 0.80, sellRate: 0.81 },
  { fromCurrency: 'USD', toCurrency: 'KWD', buyRate: 0.30, sellRate: 0.31 },
];

async function main() {
  for (const c of currencies) {
    await prisma.currency.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }

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

  console.log(`Seeded ${currencies.length} currencies, ${defaultRates.length} exchange rates, and ${financialSettings.length} financial settings.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
