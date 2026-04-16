const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function migrateForumNames() {
    // Try root DB first
    const dbPath = path.join(__dirname, 'database.sqlite');
    console.log('Testing DB at:', dbPath);
    
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    try {
        const tableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='forum_posts'");
        if (!tableCheck) {
            console.log('Table forum_posts not found in root DB. Trying server/database.sqlite...');
            await db.close();
            const serverDbPath = path.join(__dirname, 'server', 'database.sqlite');
            const serverDb = await open({ filename: serverDbPath, driver: sqlite3.Database });
            return await runMigration(serverDb);
        }
        
        return await runMigration(db);
    } catch (err) {
        console.error('Migration test failed:', err);
    }
}

async function runMigration(db) {
    try {
        console.log('Starting migration on:', db.config.filename);

        // Update posts
        const posts = await db.all('SELECT id, authorId FROM forum_posts');
        for (const post of posts) {
            const user = await db.get('SELECT username FROM users WHERE id = ?', [post.authorId]);
            if (user && user.username) {
                await db.run('UPDATE forum_posts SET authorName = ? WHERE id = ?', [user.username, post.id]);
                console.log(`Updated post ${post.id} to author ${user.username}`);
            }
        }

        // Update comments
        const comments = await db.all('SELECT id, authorId FROM forum_comments');
        for (const comment of comments) {
            const user = await db.get('SELECT username FROM users WHERE id = ?', [comment.authorId]);
            if (user && user.username) {
                await db.run('UPDATE forum_comments SET authorName = ? WHERE id = ?', [user.username, comment.id]);
                console.log(`Updated comment ${comment.id} to author ${user.username}`);
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
