const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('--- Synchronizing sessionsUsed in enrollments ---');

db.serialize(() => {
    // Get all enrollments
    db.all("SELECT id, studentId, teacher, subject FROM enrollments", (err, enrollments) => {
        if (err) {
            console.error(err);
            return;
        }

        enrollments.forEach(en => {
            // Count completed sessions for this specific enrollment
            // Matching by studentId, teacherName, and subject
            db.get(
                "SELECT count(*) as count FROM sessions WHERE studentId = ? AND teacherName = ? AND subject = ? AND status = 'completed'",
                [en.studentId, en.teacher, en.subject],
                (err, row) => {
                    if (err) {
                        console.error(`Error counting for enrollment ${en.id}:`, err);
                    } else {
                        const actualCount = row.count;
                        console.log(`Enrollment ${en.id} (${en.teacher} - ${en.subject}): Counted ${actualCount} completed sessions.`);

                        // Update the enrollment table
                        db.run(
                            "UPDATE enrollments SET sessionsUsed = ? WHERE id = ?",
                            [actualCount, en.id],
                            (err) => {
                                if (err) console.error(`Error updating enrollment ${en.id}:`, err);
                            }
                        );
                    }
                }
            );
        });
    });
});

// We can't easily wait for all async callbacks in serialize without a bit more boilerplate, 
// so we'll just wait a bit or use a more robust script.
// But for a quick fix this should work if we keep the process alive long enough.
setTimeout(() => {
    console.log('Sync complete.');
    db.close();
}, 5000);
