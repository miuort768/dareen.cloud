const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log('Tables in database:', tables.map(t => t.name).join(', '));

    tables.forEach(table => {
        db.get(`SELECT COUNT(*) as count FROM ${table.name}`, [], (err, row) => {
            if (err) {
                console.error(`Error counting ${table.name}:`, err);
            } else {
                console.log(`Table ${table.name}: ${row.count} rows`);
            }
        });
    });

    // Close after some time to allow all counts to finish
    setTimeout(() => db.close(), 1000);
});
