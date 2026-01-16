const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function migrate() {
    const dbPath = path.join(__dirname, 'database.sqlite');
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    console.log('Migrating database...');
    try {
        await db.run('ALTER TABLE parents ADD COLUMN email TEXT');
        console.log('Successfully added email column to parents table.');
    } catch (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('Column email already exists.');
        } else {
            console.error('Migration failed:', err.message);
        }
    } finally {
        await db.close();
    }
}

migrate();
