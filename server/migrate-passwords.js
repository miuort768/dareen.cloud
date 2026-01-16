/**
 * Password Migration Script
 * 
 * This script migrates plaintext passwords to bcrypt hashes
 * Run this ONCE before starting the server with new auth system
 * 
 * Usage: node migrate-passwords.js
 */

require('dotenv').config();
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcrypt');
const path = require('path');

async function migratePasswords() {
    console.log('🔐 Starting password migration...\n');

    try {
        // Open database
        const db = await open({
            filename: path.join(__dirname, 'database.sqlite'),
            driver: sqlite3.Database
        });

        console.log('✅ Connected to database');

        // Get all teachers
        const teachers = await db.all('SELECT id, username, password FROM teachers');

        if (teachers.length === 0) {
            console.log('⚠️  No teachers found in database');
            await db.close();
            return;
        }

        console.log(`📋 Found ${teachers.length} teachers\n`);

        let migrated = 0;
        let skipped = 0;

        for (const teacher of teachers) {
            // Skip if already hashed (bcrypt hashes start with $2b$ or $2a$)
            if (teacher.password && teacher.password.startsWith('$2')) {
                console.log(`⏭️  Teacher "${teacher.username}" (${teacher.id}) - Already hashed, skipping`);
                skipped++;
                continue;
            }

            if (!teacher.password) {
                console.log(`⚠️  Teacher "${teacher.username}" (${teacher.id}) - No password set, skipping`);
                skipped++;
                continue;
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(teacher.password, 10);

            // Update in database
            await db.run(
                'UPDATE teachers SET password = ? WHERE id = ?',
                [hashedPassword, teacher.id]
            );

            console.log(`✅ Teacher "${teacher.username}" (${teacher.id}) - Password hashed`);
            migrated++;
        }

        await db.close();

        console.log('\n' + '='.repeat(50));
        console.log('📊 Migration Summary:');
        console.log('='.repeat(50));
        console.log(`✅ Migrated: ${migrated}`);
        console.log(`⏭️  Skipped: ${skipped}`);
        console.log(`📋 Total: ${teachers.length}`);
        console.log('='.repeat(50));
        console.log('\n🎉 Password migration completed successfully!');
        console.log('⚠️  You can now start the server with: npm run server\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migratePasswords().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
