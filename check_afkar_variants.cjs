const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("SELECT * FROM sessions WHERE teacherName LIKE '%افكار%'", (err, rows) => {
        if (err) console.error(err);
        else {
            console.log('--- Sessions containing "افكار" ---');
            rows.forEach(r => console.log(`${r.id}: ${r.teacherName}`));
        }
    });

    db.all("SELECT * FROM enrollments WHERE teacher LIKE '%افكار%'", (err, rows) => {
        if (err) console.error(err);
        else {
            console.log('--- Enrollments containing "افكار" ---');
            rows.forEach(r => console.log(`${r.id}: ${r.teacher}`));
        }
    });
});

db.close();
