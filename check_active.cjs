const sqlite3 = require('better-sqlite3');
const db = sqlite3('./server/database.sqlite');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name).join(', '));

try {
    const rows = db.prepare('SELECT * FROM active_sessions LIMIT 5').all();
    console.log('active_sessions rows:', JSON.stringify(rows, null, 2));
} catch(e) {
    console.log('active_sessions ERROR:', e.message);
}

// Check sessions table has topics/homework columns
try {
    const cols = db.prepare("PRAGMA table_info(sessions)").all();
    console.log('sessions columns:', cols.map(c => c.name).join(', '));
    
    // Get latest 3 sessions
    const recent = db.prepare("SELECT id, studentId, studentName, subject, status, topics, homework FROM sessions ORDER BY date DESC LIMIT 3").all();
    console.log('recent sessions:', JSON.stringify(recent, null, 2));
} catch(e) {
    console.log('sessions ERROR:', e.message);
}
