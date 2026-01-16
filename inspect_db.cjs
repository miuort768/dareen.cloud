const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('--- Teachers ---');
db.all('SELECT id, name, username FROM teachers', [], (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.table(rows);
    }

    console.log('\n--- Student Enrollments ---');
    db.all('SELECT id, name, enrollments FROM students LIMIT 20', [], (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            rows.forEach(row => {
                try {
                    const enrollments = JSON.parse(row.enrollments);
                    if (enrollments && enrollments.length > 0) {
                        console.log(`Student: ${row.name}`);
                        enrollments.forEach(en => {
                            console.log(`  - Teacher: "${en.teacher}"`);
                        });
                    }
                } catch (e) {
                    console.log(`Student: ${row.name} - Error parsing enrollments`);
                }
            });
        }
        db.close();
    });
});
