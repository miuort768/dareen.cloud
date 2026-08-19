/**
 * Fix Exchange Rates Script
 * Updates KWD→EGP from 49.50 to 160.00 to match actual business rate
 * 
 * Usage: node server/prisma/fix-exchange-rates.js
 */

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔄 Fixing exchange rates...\n');

  const kwdToEgp = await prisma.exchangeRate.updateMany({
    where: { fromCurrency: 'KWD', toCurrency: 'EGP' },
    data: { buyRate: 160.00, sellRate: 160.00 },
  });
  console.log(`✅ KWD → EGP: ${kwdToEgp.count} record(s) updated to 160.00`);

  const egpToKwd = await prisma.exchangeRate.updateMany({
    where: { fromCurrency: 'EGP', toCurrency: 'KWD' },
    data: { buyRate: 0.00625, sellRate: 0.00625 },
  });
  console.log(`✅ EGP → KWD: ${egpToKwd.count} record(s) updated to 0.00625`);

  console.log('\n📊 Current exchange rates:');
  const rates = await prisma.exchangeRate.findMany({
    orderBy: [{ fromCurrency: 'asc' }, { toCurrency: 'asc' }],
  });
  
  for (const r of rates) {
    console.log(`   ${r.fromCurrency} → ${r.toCurrency}: buy=${r.buyRate} sell=${r.sellRate}`);
  }

  await prisma.$disconnect();
  await pool.end();
  console.log('\n✨ Done! Exchange rates fixed.');
}

main().catch((e) => {
  console.error('❌ Error:', e);
  prisma.$disconnect().catch(() => {});
  pool.end().catch(() => {});
  process.exit(1);
});
