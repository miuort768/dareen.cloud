const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function check() {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });
    try {
        const result = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='notifications'");
        console.log('Notifications table exists:', !!result);
        if (result) {
            const schema = await db.all("PRAGMA table_info(notifications)");
            console.log('Schema:', JSON.stringify(schema, null, 2));
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await db.close();
    }
}
check();
