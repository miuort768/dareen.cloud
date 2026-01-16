const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let dbInstance = null;

/**
 * Initializes and returns the database instance.
 * Ensures only one connection is opened.
 */
async function getDb() {
    if (!dbInstance) {
        const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database.sqlite');
        dbInstance = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // Enable foreign key support in SQLite
        await dbInstance.get('PRAGMA foreign_keys = ON');

        console.log('Connected to SQLite database (Centralized)');
    }
    return dbInstance;
}

module.exports = { getDb };
