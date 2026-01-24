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

        // Performance Optimizations for High Concurrency

        // 1. Enable foreign key support
        await dbInstance.get('PRAGMA foreign_keys = ON');

        // 2. Enable WAL mode (Write-Ahead Logging) - Critical for concurrent access
        await dbInstance.get('PRAGMA journal_mode = WAL');

        // 3. Set synchronous mode to NORMAL (faster, still safe)
        await dbInstance.get('PRAGMA synchronous = NORMAL');

        // 4. Increase Cache Size to 50,000 pages (~200MB) for better performance
        await dbInstance.get('PRAGMA cache_size = -200000'); // Negative = KB

        // 5. Set busy timeout to 10 seconds (handles high concurrent writes)
        await dbInstance.run('PRAGMA busy_timeout = 10000');

        // 6. Use memory-mapped I/O for ultra-fast reads (256MB)
        await dbInstance.get('PRAGMA mmap_size = 268435456');

        // 7. Temp store in memory for faster temporary operations
        await dbInstance.get('PRAGMA temp_store = MEMORY');

        // 8. Optimize page size for better I/O
        await dbInstance.get('PRAGMA page_size = 4096');

        // 9. Auto vacuum for database health
        await dbInstance.get('PRAGMA auto_vacuum = INCREMENTAL');

        console.log('✅ Connected to SQLite database (Ultra-High Performance Mode)');
    }
    return dbInstance;
}

module.exports = { getDb };
