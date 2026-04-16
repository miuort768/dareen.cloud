const { getDb } = require('./utils/db');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './.env' });

async function testLogin(username, password) {
    console.log(`Testing login for: ${username}`);
    try {
        const db = await getDb();
        const teacher = await db.get('SELECT * FROM teachers WHERE username = ?', [username]);
        if (!teacher) {
            console.log('Teacher not found');
            return;
        }
        const isValid = await bcrypt.compare(password, teacher.password);
        console.log(`Login ${isValid ? 'SUCCESS' : 'FAILURE'}`);
    } catch (err) {
        console.error(err);
    }
}

(async () => {
    await testLogin('maryam', '123');
    await testLogin('2028', '???'); // We don't know this one's plain text, it's already hashed
    process.exit(0);
})();
