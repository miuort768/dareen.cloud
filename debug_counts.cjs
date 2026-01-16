const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('--- Detailed stats for Afkar ---');

db.serialize(() => {
    // 1. Check all sessions for Afkar
    db.all("SELECT studentName, status, count(*) as count FROM sessions WHERE teacherName = 'افكار' GROUP BY studentName, status", (err, rows) => {
        if (err) console.error(err);
        else {
            console.log('Sessions by student and status:');
            console.log(rows);
        }
    });

    // 2. Check Enrollments for Afkar
    db.all("SELECT id, studentId, teacher, subject, sessionsTotal, sessionsUsed FROM enrollments WHERE teacher = 'افكار'", (err, rows) => {
        if (err) console.error(err);
        else {
            console.log('\nEnrollments:');
            console.log(rows);
        }
    });

    // 3. Count total completed sessions across all students for Afkar
    db.get("SELECT count(*) as total_completed FROM sessions WHERE teacherName = 'افكار' AND status = 'completed'", (err, row) => {
        if (err) console.error(err);
        else console.log('\nTotal Completed Sessions for Afkar:', row.total_completed);
    });
});

db.close();
