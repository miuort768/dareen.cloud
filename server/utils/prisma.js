const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

let prisma;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql')) {
  const { Pool } = require('pg');
  const { PrismaPg } = require('@prisma/adapter-pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  let dbUrl = process.env.DATABASE_URL || 'file:./database.sqlite';
  if (dbUrl.startsWith('file:./') || dbUrl.startsWith('file:../')) {
    const relPath = dbUrl.replace(/^file:/, '');
    const absPath = path.resolve(__dirname, '..', relPath);
    if (!fs.existsSync(absPath)) {
      dbUrl = 'file:./database.sqlite';
    } else if (/dev\.db$/.test(absPath)) {
      const altPath = path.resolve(__dirname, '..', 'database.sqlite');
      if (fs.existsSync(altPath)) dbUrl = 'file:./database.sqlite';
    }
  }

  const { PrismaLibSql } = require('@prisma/adapter-libsql');
  const adapter = new PrismaLibSql({ url: dbUrl });
  prisma = new PrismaClient({ adapter });
}

module.exports = { prisma };
