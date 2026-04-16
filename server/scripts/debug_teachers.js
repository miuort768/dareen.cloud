const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function checkTeachers() {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });
    try {
        console.log('--- Teachers Table Info ---');
        const schema = await db.all("PRAGMA table_info(teachers)");
        console.log('Schema:', JSON.stringify(schema, null, 2));

        console.log('\n--- Teachers with Username but NULL Password ---');
        const problematic = await db.all("SELECT id, name, username, password FROM teachers WHERE username IS NOT NULL AND (password IS NULL OR password = '')");
        console.log('Problematic Teachers:', JSON.stringify(problematic, null, 2));

        console.log('\n--- All Teachers Summary ---');
        const all = await db.all("SELECT id, name, username, (password IS NOT NULL AND password != '') as hasPassword FROM teachers");
        console.log('All Teachers:', JSON.stringify(all, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await db.close();
    }
}
checkTeachers();
