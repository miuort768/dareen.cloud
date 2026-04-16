const { getDb } = require('./utils/db');

async function cleanDatabase() {
    console.log('🧹 Starting database cleanup...');
    const db = await getDb();

    // Delete test data completely
    await db.run('DELETE FROM sessions');
    await db.run('DELETE FROM enrollments');
    await db.run('DELETE FROM students');
    await db.run('DELETE FROM teachers WHERE id = "t_o9rmv4q"'); // Delete test teacher
    await db.run('DELETE FROM teacher_invoices');
    await db.run('DELETE FROM student_invoices');
    await db.run('DELETE FROM manual_transactions');
    await db.run('DELETE FROM notifications');
    await db.run('DELETE FROM tasks');

    console.log('✅ Database cleaned successfully!');
    console.log('');
    console.log('--- Final Verification ---');

    const students = await db.get('SELECT COUNT(*) as count FROM students');
    const teachers = await db.get('SELECT COUNT(*) as count FROM teachers');
    const sessions = await db.get('SELECT COUNT(*) as count FROM sessions');
    const invoices = await db.get('SELECT COUNT(*) as count FROM teacher_invoices');

    console.log(`Students: ${students.count}`);
    console.log(`Teachers: ${teachers.count}`);
    console.log(`Sessions: ${sessions.count}`);
    console.log(`Invoices: ${invoices.count}`);
    console.log('');
    console.log('🎉 Your system is now completely clean!');
    process.exit(0);
}

cleanDatabase().catch(console.error);
