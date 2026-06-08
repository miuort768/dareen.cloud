const path = require('path');
const fs = require('fs');
const { getDb } = require('../utils/db');

const BACKUP_DIR = path.join(__dirname, '../../backups');
const DB_PATH = path.join(__dirname, '../../data/database.sqlite');
const MAX_BACKUPS = 10;

async function createBackup() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const db = await getDb();
    await db.get('PRAGMA wal_checkpoint(TRUNCATE)');

    const date = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `database-${date}.sqlite`);

    fs.copyFileSync(DB_PATH, backupPath);
    console.log(`Backup created: ${backupPath}`);

    const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('database-'))
        .map(f => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs }))
        .sort((a, b) => b.time - a.time);

    while (files.length > MAX_BACKUPS) {
        const oldest = files.pop();
        fs.unlinkSync(path.join(BACKUP_DIR, oldest.name));
        console.log(`Removed old backup: ${oldest.name}`);
    }

    return backupPath;
}

async function restoreBackup(backupFile) {
    const backupPath = path.join(BACKUP_DIR, backupFile);
    if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupFile}`);
    }

    const db = await getDb();
    await db.close();

    fs.copyFileSync(backupPath, DB_PATH);
    console.log(`Restored from: ${backupPath}`);
}

if (require.main === module) {
    createBackup().catch(err => {
        console.error('Backup failed:', err);
        process.exit(1);
    });
}

module.exports = { createBackup, restoreBackup };
