const { getDb } = require('./server/utils/db');
require('dotenv').config({ path: './server/.env' });

(async () => {
    try {
        const db = await getDb();
        const teachers = await db.all('SELECT id, name, username, password FROM teachers');
        console.log('Teachers in DB:');
        teachers.forEach(t => {
            console.log(`- ID: ${t.id}, Name: ${t.name}, Username: ${t.username}, Password (hashed?): ${t.password ? t.password.substring(0, 10) + '...' : 'NULL'}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
