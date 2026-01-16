const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('--- Check teacher names in all tables ---');
    db.all("SELECT DISTINCT name FROM teachers", (err, rows) => {
        console.log('Teachers table names:', rows);
    });
    db.all("SELECT DISTINCT teacher FROM enrollments", (err, rows) => {
        console.log('Enrollments table teacher names:', rows);
    });
    db.all("SELECT DISTINCT teacherName FROM sessions", (err, rows) => {
        console.log('Sessions table teacher names:', rows);
    });
});

db.close();
