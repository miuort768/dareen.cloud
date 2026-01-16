const { getDb } = require('./utils/db');
const bcrypt = require('bcrypt');

(async () => {
    try {
        const db = await getDb();
        const teacher = await db.get('SELECT * FROM teachers WHERE username = "maryam"');
        if (teacher) {
            const match = await bcrypt.compare("123", teacher.password);
            console.log(`Password check for maryam/123: ${match ? 'MATCH' : 'NO MATCH'}`);
        } else {
            console.log('Teacher maryam not found');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
