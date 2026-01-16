const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('--- Sessions Table Contents ---');
db.all('SELECT studentName, teacherName, subject, status, price FROM sessions', [], (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        rows.forEach(row => {
            console.log(`Teacher: "${row.teacherName}", Student: "${row.studentName}", Status: ${row.status}, Price: ${row.price}`);
        });
    }
    db.close();
});
