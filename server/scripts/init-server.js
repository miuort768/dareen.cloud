/**
 * Initialize or reset the Dareen platform server.
 * Usage: node server/scripts/init-server.js [new_admin_password]
 */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// ── Step 1: Ensure server/.env exists ──
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  const jwtSecret = crypto.randomBytes(32).toString('hex');
  const dbPassword = crypto.randomBytes(16).toString('hex');
  const content = [
    `PORT=3001`,
    `JWT_SECRET=${jwtSecret}`,
    `JWT_EXPIRES_IN=7d`,
    `NODE_ENV=production`,
    `FRONTEND_URL=https://dareen.cloud`,
    `DB_PASSWORD=${dbPassword}`,
    `DATABASE_URL=postgresql://darin:${dbPassword}@postgres:5432/darin`,
    ``,
  ].join('\n');
  fs.writeFileSync(envPath, content, 'utf-8');
  console.log('Created: server/.env (with generated JWT_SECRET + DB_PASSWORD)');
} else {
  console.log('Exists: server/.env');
}

// ── Step 2: Ensure root .env exists (for docker-compose) ──
const rootEnvPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });
if (!fs.existsSync(rootEnvPath) || !fs.readFileSync(rootEnvPath, 'utf-8').includes('JWT_SECRET')) {
  const jwtSecret = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
  const dbPassword = process.env.DB_PASSWORD || crypto.randomBytes(16).toString('hex');
  const content = [
    `VITE_API_URL=/api`,
    `JWT_SECRET=${jwtSecret}`,
    `DB_PASSWORD=${dbPassword}`,
    `FRONTEND_URL=https://dareen.cloud`,
    ``,
  ].join('\n');
  fs.writeFileSync(rootEnvPath, content, 'utf-8');
  console.log('Created: .env (root, for docker-compose)');
} else {
  console.log('Exists: .env (root)');
}

// ── Step 3: Reset admin password ──
async function resetAdmin() {
  const newPassword = process.argv[2] || 'admin123';
  const hash = await bcrypt.hash(newPassword, 10);

  dotenv.config({ path: rootEnvPath });

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

  let admin = await prisma.user.findFirst({ where: { role: 'admin' } });

  if (admin) {
    await prisma.user.update({ where: { id: admin.id }, data: { password: hash } });
    console.log(`Admin password updated: ${admin.username} / ${newPassword}`);
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

  // Sync to accounts table if AUTH_MODE is not legacy
  if (process.env.AUTH_MODE && process.env.AUTH_MODE !== 'legacy') {
    try {
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
    } catch (e) {
      console.log('Accounts sync skipped:', e.message);
    }
  }

  await prisma.$disconnect();
  console.log('\n✅ Done. Login with: admin / ' + newPassword);
}

resetAdmin().catch(e => { console.error(e); process.exit(1); });
