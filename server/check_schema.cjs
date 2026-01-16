const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

(async () => {
    try {
        const db = await open({
            filename: path.join(__dirname, 'database.sqlite'),
            driver: sqlite3.Database
        });
        const schema = await db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='parents'");
        console.log('SCHEMA:', schema ? schema.sql : 'NOT FOUND');

        const students = await db.all("SELECT * FROM students LIMIT 1");
        console.log('STUDENT SAMPLE:', students[0]);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
