const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const tables = ['trialSession', 'lead', 'contactMessage', 'jobApplication', 'session', 'pointsLog', 'enrollment', 'teacherAvailability', 'announcement', 'student', 'parent', 'teacher'];
  for (const t of tables) {
    const model = prisma[t];
    if (!model) continue;
    const r = await model.deleteMany({ where: { id: { startsWith: 'demo_' } } });
    console.log('  ' + t + ': ' + r.count + ' deleted');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
