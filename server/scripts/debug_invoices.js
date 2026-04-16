const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
        process.exit(1);
    }
});

db.serialize(() => {
    // Check Teacher Invoices
    db.all("SELECT * FROM teacher_invoices", [], (err, rows) => {
        if (err) console.error(err);
        console.log("--- Teacher Invoices ---");
        let sumPaid = 0;
        rows.forEach(r => {
            console.log(`[${r.status}] ${r.teacher}: ${r.amount} (Personal: ${r.personalExpenses})`);
            if (r.status === 'مدفوعة') sumPaid += (Number(r.amount) - (Number(r.personalExpenses) || 0));
        });
        console.log(`Total Paid Net: ${sumPaid}`);
    });

    // Check Manual Transactions
    db.all("SELECT * FROM manual_transactions WHERE type='expense'", [], (err, rows) => {
        if (err) console.error(err);
        console.log("\n--- Manual Expenses ---");
        let sumManual = 0;
        rows.forEach(r => {
            console.log(`[${r.date}] ${r.category} - ${r.description}: ${r.amount}`);
            sumManual += r.amount;
        });
        console.log(`Total Manual Expenses: ${sumManual}`);
    });

    // Check Fixed Expenses
    db.all("SELECT * FROM fixed_expenses", [], (err, rows) => {
        if (err) console.error(err);
        console.log("\n--- Fixed Expenses ---");
        let sumFixed = 0;
        rows.forEach(r => {
            console.log(`${r.name}: ${r.amount} (Active: ${r.is_active})`);
            if (r.is_active) sumFixed += r.amount;
        });
        console.log(`Total Fixed Expenses: ${sumFixed}`);
    });
});

setTimeout(() => db.close(), 1000);
