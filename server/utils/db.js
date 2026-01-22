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

        // 1. Enable foreign key support
        await dbInstance.get('PRAGMA foreign_keys = ON');

        // 2. Enable WAL mode (Write-Ahead Logging)
        await dbInstance.get('PRAGMA journal_mode = WAL');
        // 3. Set synchronous mode to NORMAL
        await dbInstance.get('PRAGMA synchronous = NORMAL');
        // 4. Increase Cache Size
        await dbInstance.get('PRAGMA cache_size = 10000');
        // 5. Set a busy timeout
        await dbInstance.run('PRAGMA busy_timeout = 5000');

        console.log('Connected to SQLite database (Ultra-Speed Tuned)');
    }
    return dbInstance;
}

module.exports = { getDb };
