const { getDb } = require('./utils/db');

async function checkDatabase() {
    const db = await getDb();
    const students = await db.get('SELECT COUNT(*) as count FROM students');
    const teachers = await db.get('SELECT COUNT(*) as count FROM teachers');
    const sessions = await db.get('SELECT COUNT(*) as count FROM sessions');
    const manual_transactions = await db.get('SELECT COUNT(*) as count FROM manual_transactions');
    const teacher_invoices = await db.get('SELECT COUNT(*) as count FROM teacher_invoices');
    const student_invoices = await db.get('SELECT COUNT(*) as count FROM student_invoices');
    const fixed_expenses = await db.all('SELECT * FROM fixed_expenses');

    console.log('--- Database Status ---');
    console.log('Students:', students.count);
    console.log('Teachers:', teachers.count);
    console.log('Sessions:', sessions.count);
    console.log('Manual Transactions:', manual_transactions.count);
    console.log('Teacher Invoices:', teacher_invoices.count);
    console.log('Student Invoices:', student_invoices.count);
    console.log('Fixed Expenses:', JSON.stringify(fixed_expenses, null, 2));
}

checkDatabase().catch(console.error);
