const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Querying database at:', dbPath);

db.serialize(() => {
    console.log('\n--- Teachers ---');
    db.all("SELECT id, name, username FROM teachers WHERE name LIKE '%أفكار%'", (err, rows) => {
        if (err) console.error(err);
        else console.log(rows);
    });

    db.all("SELECT * FROM teachers WHERE username = 'أفكار'", (err, rows) => {
        if (err) console.error(err);
        else if (rows.length > 0) console.log('Found by username:', rows);
    });
});

db.close();
