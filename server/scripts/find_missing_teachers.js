const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function findMissingTeachers() {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });
    try {
        console.log('--- Checking for missing teachers ---');

        // Teachers mentioned in invoices but not in teachers table
        const missingInInvoices = await db.all(`
            SELECT DISTINCT teacher FROM teacher_invoices 
            WHERE teacher NOT IN (SELECT name FROM teachers)
        `);
        console.log('Teachers in Invoices but not in Teachers table:', JSON.stringify(missingInInvoices, null, 2));

        // Teachers mentioned in sessions but not in teachers table
        const missingInSessions = await db.all(`
            SELECT DISTINCT teacherName FROM sessions 
            WHERE teacherName NOT IN (SELECT name FROM teachers)
        `);
        console.log('Teachers in Sessions but not in Teachers table:', JSON.stringify(missingInSessions, null, 2));

        // Teachers mentioned in enrollments but not in teachers table
        const missingInEnrollments = await db.all(`
            SELECT DISTINCT teacher FROM enrollments 
            WHERE teacher NOT IN (SELECT name FROM teachers)
        `);
        console.log('Teachers in Enrollments but not in Teachers table:', JSON.stringify(missingInEnrollments, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await db.close();
    }
}
findMissingTeachers();
