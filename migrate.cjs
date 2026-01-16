const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { execSync } = require('child_process');
const path = require('path');

async function migrate() {
    const db = await open({
        filename: './server/database.sqlite',
        driver: sqlite3.Database
    });

    console.log('Dropping tables with schema changes...');
    await db.run('DROP TABLE IF EXISTS parents');
    await db.run('DROP TABLE IF EXISTS student_invoices');
    // teacher_invoices schema is fine, but let's refresh it too if wanted. 
    // Actually it's fine.

    await db.close();
    console.log('Running db_setup.js...');
    execSync('node server/db_setup.js', { stdio: 'inherit' });
    console.log('Migration complete.');
}

migrate().catch(console.error);
