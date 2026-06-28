const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

let prisma;

// Point to dev.db which has the Prisma schema synced via prisma db push
const resolvedDbPath = 'file:' + path.resolve(__dirname, '..', 'dev.db').replace(/\\/g, '/');

if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql')) {
  const { Pool } = require('pg');
  const { PrismaPg } = require('@prisma/adapter-pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  const { PrismaLibSql } = require('@prisma/adapter-libsql');
  const adapter = new PrismaLibSql({ url: resolvedDbPath });
  prisma = new PrismaClient({ adapter });
}

module.exports = { prisma };
