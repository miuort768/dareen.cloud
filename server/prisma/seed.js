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

  console.log(`Seeded ${currencies.length} currencies and ${financialSettings.length} financial settings.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
