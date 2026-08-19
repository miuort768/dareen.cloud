/**
 * Fix Exchange Rates Script
 * Updates KWD→EGP from 49.50 to 160.00 to match actual business rate
 * 
 * Usage: node server/prisma/fix-exchange-rates.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Fixing exchange rates...\n');

  // Fix KWD → EGP (the main bug: was 49.50, should be 160)
  const kwdToEgp = await prisma.exchangeRate.updateMany({
    where: { fromCurrency: 'KWD', toCurrency: 'EGP' },
    data: { buyRate: 160.00, sellRate: 160.00 },
  });
  console.log(`✅ KWD → EGP: ${kwdToEgp.count} record(s) updated to 160.00`);

  // Fix reverse: EGP → KWD (1/160 = 0.00625)
  const egpToKwd = await prisma.exchangeRate.updateMany({
    where: { fromCurrency: 'EGP', toCurrency: 'KWD' },
    data: { buyRate: 0.00625, sellRate: 0.00625 },
  });
  console.log(`✅ EGP → KWD: ${egpToKwd.count} record(s) updated to 0.00625`);

  // Show all current rates
  console.log('\n📊 Current exchange rates:');
  const rates = await prisma.exchangeRate.findMany({
    orderBy: [{ fromCurrency: 'asc' }, { toCurrency: 'asc' }],
  });
  
  for (const r of rates) {
    console.log(`   ${r.fromCurrency} → ${r.toCurrency}: buy=${r.buyRate} sell=${r.sellRate}`);
  }

  await prisma.$disconnect();
  console.log('\n✨ Done! Exchange rates fixed.');
}

main().catch((e) => {
  console.error('❌ Error:', e);
  prisma.$disconnect();
  process.exit(1);
});
