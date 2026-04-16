const { getDb } = require('./utils/db');

async function debug() {
    const db = await getDb();
    const students = await db.all('SELECT id, name FROM students LIMIT 5');
    console.log('--- Students ---');
    console.log(students);

    const enrollments = await db.all('SELECT studentId, teacher, subject, schedule FROM enrollments LIMIT 10');
    console.log('--- Enrollments ---');
    enrollments.forEach(e => {
        console.log(`Std: ${e.studentId}, Teacher: ${e.teacher}, Sub: ${e.subject}`);
        console.log(`Schedule: ${e.schedule}`);
    });
}

debug();
