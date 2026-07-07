const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcrypt');
const crypto = require('crypto');
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

async function main() {
  const newPassword = process.argv[2] || 'admin123';
  const hash = await bcrypt.hash(newPassword, 10);

  // Check if admin exists
  let admin = await prisma.user.findFirst({ where: { role: 'admin' } });

  if (admin) {
    await prisma.user.update({ where: { id: admin.id }, data: { password: hash } });
    console.log(`Admin password updated for: ${admin.username} -> ${newPassword}`);
  } else {
    admin = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: 'مدير النظام',
        username: 'admin',
        password: hash,
        role: 'admin',
        permissions: JSON.stringify(['*']),
      }
    });
    console.log(`Admin user created: admin / ${newPassword}`);
  }

  // Also sync to accounts table if AUTH_MODE is not legacy
  if (process.env.AUTH_MODE && process.env.AUTH_MODE !== 'legacy') {
    const { PrismaClient: PgClient } = require('@prisma/client');
    const pg = new PgClient();
    const account = await pg.account.findFirst({ where: { entityId: admin.id, accountType: 'ADMIN' } });
    if (account) {
      await pg.account.update({ where: { id: account.id }, data: { passwordHash: hash } });
    } else {
      await pg.account.create({
        data: {
          username: 'admin',
          normalizedLogin: 'admin',
          passwordHash: hash,
          accountType: 'ADMIN',
          entityId: admin.id,
          tokenVersion: 1,
          isActive: true,
          isLocked: false,
        }
      });
    }
    await pg.$disconnect();
    console.log('Accounts table synced.');
  }

  await prisma.$disconnect();
  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
