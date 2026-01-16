const sqlite3 = require('./server/node_modules/sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log(`=== Finance Page Verification ===\n`);

db.serialize(() => {
    // 1. Check schema for invoice tables
    db.all(`SELECT name, sql FROM sqlite_master WHERE type='table' AND name LIKE '%invoice%'`, [], (err, tables) => {
        if (err) console.error(err);
        else {
            console.log('--- Invoice Tables Schema ---');
            tables.forEach(t => console.log(t.name));
            console.log('');
        }

        // 2. Calculate Income from Sessions
        console.log('--- Income Calculation (from Sessions) ---');
        db.all(`SELECT status, SUM(price) as total FROM sessions GROUP BY status`, [], (err, sessionStats) => {
            if (err) console.error(err);
            console.table(sessionStats);

            const completedIncome = sessionStats.find(s => s.status === 'completed')?.total || 0;
            console.log(`Total Automated Income (Completed Sessions): ${completedIncome}\n`);

            // 3. Calculate Expenses from Teacher Invoices
            console.log('--- Expenses Calculation (from Teacher Invoices) ---');
            db.all(`SELECT status, SUM(amount) as amountSum, SUM(personalExpenses) as expenseSum FROM teacher_invoices GROUP BY status`, [], (err, invoiceStats) => {
                if (err) console.error(err);
                console.table(invoiceStats);

                const paidInvoices = invoiceStats.find(s => s.status === 'مدفوعة');
                const totalExpenses = (paidInvoices?.amountSum || 0) + (paidInvoices?.expenseSum || 0);
                console.log(`Total Automated Expenses (Paid Invoices): ${totalExpenses}\n`);

                // 4. Check Student Invoices (Potential missing income?)
                console.log('--- Student Invoices (Check if ignored) ---');
                db.all(`SELECT status, SUM(amount) as total FROM student_invoices GROUP BY status`, [], (err, studentInvoiceStats) => {
                    if (err) console.error(err);
                    if (studentInvoiceStats.length > 0) {
                        console.table(studentInvoiceStats);
                        console.log('WARNING: Student invoices exist but might be ignored by Finance page if it only relies on sessions.');
                    } else {
                        console.log('No student invoices found (or empty table).');
                    }
                    db.close();
                });
            });
        });
    });
});
