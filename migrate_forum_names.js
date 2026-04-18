const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function migrateForumNames() {
    // Try server/database.sqlite since that's where the backend usually writes
    const serverDbPath = path.join(__dirname, 'server', 'database.sqlite');
    console.log('Testing DB at:', serverDbPath);
    
    try {
        const db = await open({
            filename: serverDbPath,
            driver: sqlite3.Database
        });

        await runMigration(db);
    } catch (err) {
        console.error('Migration test failed or file not found at server/database.sqlite. Trying root DB...');
        try {
            const dbPath = path.join(__dirname, 'database.sqlite');
            const db = await open({ filename: dbPath, driver: sqlite3.Database });
            await runMigration(db);
        } catch (err2) {
            console.error('Final attempt failed:', err2.message);
        }
    }
}

async function runMigration(db) {
    try {
        console.log('Starting migration to REAL NAMES on:', db.config.filename);

        // Update posts
        const posts = await db.all('SELECT id, authorId FROM forum_posts');
        for (const post of posts) {
            // Check all relevant tables for the real name
            const user = await db.get('SELECT name FROM users WHERE id = ?', [post.authorId]) ||
                         await db.get('SELECT name FROM teachers WHERE id = ?', [post.authorId]) ||
                         await db.get('SELECT name FROM students WHERE id = ?', [post.authorId]);

            if (user && user.name) {
                await db.run('UPDATE forum_posts SET authorName = ? WHERE id = ?', [user.name, post.id]);
                console.log(`Updated post ${post.id} to real name: ${user.name}`);
            }
        }

        // Update comments
        const comments = await db.all('SELECT id, authorId FROM forum_comments');
        for (const comment of comments) {
            const user = await db.get('SELECT name FROM users WHERE id = ?', [comment.authorId]) ||
                         await db.get('SELECT name FROM teachers WHERE id = ?', [comment.authorId]) ||
                         await db.get('SELECT name FROM students WHERE id = ?', [comment.authorId]);

            if (user && user.name) {
                await db.run('UPDATE forum_comments SET authorName = ? WHERE id = ?', [user.name, comment.id]);
                console.log(`Updated comment ${comment.id} to real name: ${user.name}`);
            }
        }

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await db.close();
    }
}

migrateForumNames();
