const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('--- All Teachers ---');
    db.all("SELECT id, name, username FROM teachers", (err, rows) => {
        if (err) console.error(err);
        else console.log(rows);
    });
});

db.close();
