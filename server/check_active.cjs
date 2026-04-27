const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
    if (err) return console.error('Tables error:', err.message);
    console.log('Tables:', rows.map(r => r.name).join(', '));

    db.all("PRAGMA table_info(sessions)", [], (err2, cols) => {
        if (err2) return console.error('Sessions cols error:', err2.message);
        console.log('sessions columns:', cols.map(c => c.name).join(', '));

        db.all("SELECT id, studentId, studentName, subject, status, topics, homework FROM sessions ORDER BY date DESC LIMIT 5", [], (err3, rows3) => {
            if (err3) return console.error('Recent sessions error:', err3.message);
            console.log('Recent sessions:', JSON.stringify(rows3, null, 2));

            db.all("SELECT * FROM active_sessions LIMIT 5", [], (err4, rows4) => {
                if (err4) return console.error('active_sessions error:', err4.message);
                console.log('active_sessions:', JSON.stringify(rows4, null, 2));
                db.close();
            });
        });
    });
});
