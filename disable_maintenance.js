const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function disableMaintenance() {
    const dbPath = path.join(__dirname, 'server', 'database.sqlite');
    try {
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        console.log('Checking current settings...');
        const setting = await db.get("SELECT * FROM system_settings WHERE key = 'maintenance_mode'");
        console.log('Current Maintenance Mode:', setting ? setting.value : 'Not found');

        await db.run("INSERT OR REPLACE INTO system_settings (key, value) VALUES ('maintenance_mode', 'false')");
        console.log('✅ Maintenance Mode has been disabled in the database.');

        await db.close();
    } catch (err) {
        console.error('Error:', err.message);
        // Try other possible path
        const altPath = path.join(__dirname, 'database.sqlite');
        try {
            const db = await open({
                filename: altPath,
                driver: sqlite3.Database
            });
            await db.run("INSERT OR REPLACE INTO system_settings (key, value) VALUES ('maintenance_mode', 'false')");
            console.log('✅ Maintenance Mode has been disabled in the root database.');
            await db.close();
        } catch (err2) {
            console.error('Failed both paths:', err2.message);
        }
    }
}

disableMaintenance();
