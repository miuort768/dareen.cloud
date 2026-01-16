import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let dbInstance: Database | null = null;

/**
 * Initializes and returns the database instance.
 * Ensures only one connection is opened.
 */
export async function getDb(): Promise<Database> {
    if (!dbInstance) {
        dbInstance = await open({
            filename: path.join(__dirname, '..', '..', 'database.sqlite'),
            driver: sqlite3.Database
        });

        // Enable foreign key support in SQLite
        await dbInstance.get('PRAGMA foreign_keys = ON');

        console.log('Connected to SQLite database (Centralized/TS)');
    }
    return dbInstance;
}
