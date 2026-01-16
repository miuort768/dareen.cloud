const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcrypt');

async function checkAndResetAdmin() {
    console.log('Opening database...');
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    console.log('Checking for admin user...');
    const admin = await db.get('SELECT * FROM users WHERE username = "admin"');

    if (admin) {
        console.log('✅ Admin user found!');
        console.log('Current Admin Details:');
        console.log(`- ID: ${admin.id}`);
        console.log(`- Name: ${admin.name}`);
        console.log(`- Username: ${admin.username}`);
        console.log(`- Role: ${admin.role}`);

        // Reset password to 'admin'
        console.log('\nResetting password to "admin"...');
        await db.run('UPDATE users SET password = "admin" WHERE username = "admin"');
        console.log('✅ Password reset successfully to: admin');
    } else {
        console.log('❌ Admin user NOT found!');
        console.log('Creating default admin user...');
        await db.run(
            'INSERT INTO users (id, name, username, password, role, permissions) VALUES (?, ?, ?, ?, ?, ?)',
            ['admin_1', 'الشيخ خوارزمي', 'admin', 'admin', 'admin', JSON.stringify(['*'])]
        );
        console.log('✅ Created admin user with password: admin');
    }

    console.log('\nDone! You can now login with:');
    console.log('Username: admin');
    console.log('Password: admin');
}

checkAndResetAdmin().catch(console.error);
