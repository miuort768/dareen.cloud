const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { prisma } = require('./utils/prisma');

async function getOldDb() {
  return await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database,
  });
}

async function seedTable(oldDb, model, tableName, mapRow) {
  const rows = await oldDb.all(`SELECT * FROM ${tableName}`);
  let count = 0;
  for (const row of rows) {
    const data = mapRow(row);
    const idField = model === 'enrollment' ? { id: row.id } : { id: row.id };
    const existing = await prisma[model].findUnique({ where: idField });
    if (existing) continue;
    await prisma[model].create({ data });
    count++;
  }
  console.log(`  ${tableName}: ${count} rows seeded`);
  return count;
}

async function main() {
  console.log('Seeding Phase 1 from database.sqlite → dev.db ...\n');
  const oldDb = await getOldDb();

  try {
    const totals = {};

    totals.users = await seedTable(oldDb, 'user', 'users', (r) => ({
      id: r.id, name: r.name, username: r.username, password: r.password,
      role: r.role || 'admin', permissions: r.permissions || null,
      tokenVersion: r.token_version ?? 1,
      createdAt: r.created_at ? new Date(r.created_at) : new Date(),
    }));

    totals.teachers = await seedTable(oldDb, 'teacher', 'teachers', (r) => ({
      id: r.id, name: r.name,
      phone1: r.phone1 || null, phone2: r.phone2 || null,
      subject: r.subject || null, price: r.price ?? 0,
      email: r.email || null, username: r.username || null,
      password: r.password || null, points: r.points ?? 0,
      deletedAt: null,
      createdAt: r.created_at ? new Date(r.created_at) : new Date(),
    }));

    totals.parents = await seedTable(oldDb, 'parent', 'parents', (r) => ({
      id: r.id, name: r.name, phone: r.phone,
      email: r.email || null, username: r.username || null,
      password: r.password || null, deletedAt: null,
    }));

    totals.students = await seedTable(oldDb, 'student', 'students', (r) => ({
      id: r.id, name: r.name,
      grade: r.grade || null, parentPhone: r.parentPhone || null,
      studentPhone: r.studentPhone || null, curriculum: r.curriculum || null,
      notes: r.notes || null, sessionPrice: r.sessionPrice ?? 0,
      parentId: r.parentId || null, totalPoints: r.totalPoints ?? 0,
      badges: r.badges || null, username: r.username || null,
      password: r.password || null, deletedAt: null,
    }));

    totals.enrollments = await seedTable(oldDb, 'enrollment', 'enrollments', (r) => {
      let schedule = r.schedule;
      if (schedule && typeof schedule !== 'string') schedule = JSON.stringify(schedule);
      if (!schedule) schedule = '[]';
      return {
        id: r.id, studentId: r.studentId,
        teacherId: r.teacherId || null, teacherFallback: r.teacher || null,
        subject: r.subject || null, curr: r.curr || null,
        sessionsTotal: r.sessionsTotal ?? 0, sessionsUsed: r.sessionsUsed ?? 0,
        schedule, nextSessionNotes: r.nextSessionNotes || null,
      };
    });

    totals.pointsLogs = await seedTable(oldDb, 'pointsLog', 'points_log', (r) => ({
      id: r.id, studentId: r.studentId,
      amount: r.amount, action: r.action,
      timestamp: r.timestamp ? new Date(r.timestamp) : new Date(),
    }));

    const total = Object.values(totals).reduce((a, b) => a + b, 0);
    console.log(`\nDone! ${total} total records seeded across ${Object.keys(totals).length} tables.`);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await oldDb.close();
    await prisma.$disconnect();
  }
}

main();
