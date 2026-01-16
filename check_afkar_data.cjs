const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const teacherId = 't_6puzxnu';
const teacherName = 'افكار';

db.serialize(() => {
    console.log(`--- Enrollments for ${teacherName} (${teacherId}) ---`);
    db.all("SELECT * FROM enrollments WHERE teacherId = ? OR teacher = ?", [teacherId, teacherName], (err, rows) => {
        if (err) console.error(err);
        else console.log(rows);
    });

    console.log(`\n--- Sessions for ${teacherName} (${teacherId}) ---`);
    db.all("SELECT * FROM sessions WHERE teacherId = ? OR teacherName = ?", [teacherId, teacherName], (err, rows) => {
        if (err) console.error(err);
        else console.log(rows);
    });
});

db.close();
