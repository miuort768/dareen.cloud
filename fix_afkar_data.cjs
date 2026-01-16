const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const afkarId = 't_6puzxnu';
const afkarName = 'افكار';

db.serialize(() => {
    console.log('--- Unifying Afkar records ---');

    // Update teachers table set name to 'افكار' (it already is, but just in case)
    db.run("UPDATE teachers SET name = ? WHERE id = ?", [afkarName, afkarId]);

    // Update sessions
    db.run(
        "UPDATE sessions SET teacherName = ?, teacherId = ? WHERE teacherName LIKE '%افكار%' OR teacherId = ?",
        [afkarName, afkarId, afkarId],
        function (err) {
            if (err) console.error(err);
            else console.log(`Updated ${this.changes} sessions`);
        }
    );

    // Update enrollments
    db.run(
        "UPDATE enrollments SET teacher = ?, teacherId = ? WHERE teacher LIKE '%افكار%' OR teacherId = ?",
        [afkarName, afkarId, afkarId],
        function (err) {
            if (err) console.error(err);
            else console.log(`Updated ${this.changes} enrollments`);
        }
    );
});

db.close();
