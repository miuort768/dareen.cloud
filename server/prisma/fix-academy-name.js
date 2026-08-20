const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

(async () => {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const oldNames = ['دارين', 'دارين لتعليم و التدريب', 'دارين للتعليم والتدريب'];
    const newName = 'دارين السابعة للتعليم والتدريب';

    const r = await prisma.systemSetting.updateMany({
        where: { key: 'academy_name' },
        data: { value: newName }
    });
    console.log(`Updated academy_name: ${r.count} row(s) → "${newName}"`);

    await prisma.$disconnect();
    await pool.end();
})();
