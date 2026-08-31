const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql')) {
  const { Pool } = require('pg');
  const { PrismaPg } = require('@prisma/adapter-pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ── DoS / resource-exhaustion guards ────────────────────────────────
    // statement_timeout: a flood of heavy queries (exports, wide findMany)
    // must never pin pool connections indefinitely — pool exhaustion takes
    // the whole API down, not just the abusive endpoint.
    statement_timeout: Number(process.env.DB_STATEMENT_TIMEOUT_MS || 15000),
    idle_in_transaction_session_timeout: 10000,
    connectionTimeoutMillis: 5000,
    max: Number(process.env.DB_POOL_MAX || 10),
  });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  let dbUrl = process.env.DATABASE_URL || 'file:../prisma/dev.db';

  const { PrismaLibSql } = require('@prisma/adapter-libsql');
  const adapter = new PrismaLibSql({ url: dbUrl });
  prisma = new PrismaClient({ adapter });
}

module.exports = { prisma };
