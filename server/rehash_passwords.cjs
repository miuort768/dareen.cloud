const { getDb } = require('./utils/db');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './.env' });


(async () => {
    try {
        const db = await getDb();
        const teachers = await db.all('SELECT * FROM teachers');
        console.log('Teachers in DB:', JSON.stringify(teachers, null, 2));

        let count = 0;

        for (const teacher of teachers) {
            const password = teacher.password;
            console.log(`Checking teacher ${teacher.id}: password='${password}'`);
            if (password && !password.startsWith('$2b$')) {

                console.log(`Hashing password for teacher ID: ${teacher.id}`);
                const hashed = await bcrypt.hash(password, 10);
                await db.run('UPDATE teachers SET password = ? WHERE id = ?', [hashed, teacher.id]);
                count++;
            }
        }

        console.log(`Done! Re-hashed ${count} passwords.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
