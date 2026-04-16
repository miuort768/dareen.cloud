const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('--- Teachers (with length) ---');
db.all('SELECT id, name, username FROM teachers', [], (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        rows.forEach(row => {
            console.log(`Teacher: "${row.name}" (Length: ${row.name.length}), Username: ${row.username}`);
        });
    }

    console.log('\n--- Student Enrollments (with length) ---');
    db.all('SELECT studentId, teacher, subject, schedule FROM enrollments LIMIT 20', [], (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            rows.forEach(row => {
                console.log(`Student ID: ${row.studentId}, Teacher in Enrollment: "${row.teacher}" (Length: ${row.teacher.length})`);
            });
        }
        db.close();
    });
});
