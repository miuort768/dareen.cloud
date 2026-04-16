const { getDb } = require('./utils/db');

async function simulateDashboard() {
    const db = await getDb();
    const students = await db.all('SELECT * FROM students');
    const sessions = await db.all('SELECT * FROM sessions');
    const teacherInvoices = await db.all('SELECT * FROM teacher_invoices');
    const studentInvoices = await db.all('SELECT * FROM student_invoices');

    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);

    const filteredSessions = sessions;
    const monthSessions = filteredSessions.filter(s => s.date?.startsWith(currentMonth));
    const monthCompletedSessions = monthSessions.filter(s => s.status === 'completed');

    const getSessionRevenue = (s) => {
        if (Number(s.price) > 0) return Number(s.price);
        const stu = students.find(st => st.id === s.studentId);
        if (Number(stu?.sessionPrice) > 0) return Number(stu?.sessionPrice);
        return 0;
    };

    const monthRevenueValue = monthCompletedSessions.reduce((sum, s) => sum + getSessionRevenue(s), 0);
    const sessionsExpensesValue = monthCompletedSessions.reduce((sum, s) => sum + (Number(s.teacherPrice) || 0), 0);
    const manualExpensesValue = teacherInvoices
        .filter(inv => inv.status === 'مدفوعة' && inv.date?.startsWith(currentMonth))
        .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

    const monthExpensesValue = sessionsExpensesValue + manualExpensesValue;

    console.log('--- Calculated Stats ---');
    console.log('Current Month:', currentMonth);
    console.log('Total Sessions:', sessions.length);
    console.log('Total Completed Sessions:', sessions.filter(s => s.status === 'completed').length);
    console.log('Month Completed Sessions:', monthCompletedSessions.length);
    console.log('Month Revenue:', monthRevenueValue);
    console.log('Month Expenses:', monthExpensesValue);
    console.log('Net Profit:', monthRevenueValue - monthExpensesValue);
}

simulateDashboard().catch(console.error);
