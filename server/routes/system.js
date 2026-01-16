const express = require('express');
const router = express.Router();
const { getStudentEnrollments, withTransaction } = require('../utils/dbHelper');


// Using req.db from middleware


// 1. Backup data
router.get('/backup', async (req, res) => {
    try {
        const [students, teachers, parents, sessions, teacherInvoices, studentInvoices] = await Promise.all([
            req.db.all('SELECT * FROM students'),
            req.db.all('SELECT * FROM teachers'),
            req.db.all('SELECT * FROM parents'),
            req.db.all('SELECT * FROM sessions'),
            req.db.all('SELECT * FROM teacher_invoices'),
            req.db.all('SELECT * FROM student_invoices')
        ]);

        const studentsWithEnrollments = await Promise.all(students.map(async (s) => {
            const enrollments = await getStudentEnrollments(req.db, s.id);
            return { ...s, enrollments };
        }));

        const backup = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            data: {
                students: studentsWithEnrollments,
                teachers,
                parents,
                sessions,
                invoices: teacherInvoices,
                studentInvoices
            }
        };

        res.json(backup);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Restore data
router.post('/restore', async (req, res) => {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'No data provided' });

    try {
        await withTransaction(req.db, async (tx) => {
            await tx.run('DELETE FROM enrollments');
            await tx.run('DELETE FROM students');
            await tx.run('DELETE FROM teachers');
            await tx.run('DELETE FROM parents');
            await tx.run('DELETE FROM sessions');
            await tx.run('DELETE FROM teacher_invoices');
            await tx.run('DELETE FROM student_invoices');
            await tx.run('DELETE FROM notifications');

            if (data.students) {
                for (const s of data.students) {
                    await tx.run(`INSERT INTO students (id, name, grade, parentPhone, studentPhone, curriculum, notes, sessionPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [s.id, s.name, s.grade, s.parentPhone, s.studentPhone || '', s.curriculum || '', s.notes || '', s.sessionPrice || 0]);
                    if (s.enrollments) {
                        for (const e of s.enrollments) {
                            await tx.run(`INSERT INTO enrollments (studentId, teacher, subject, curr, sessionsTotal, sessionsUsed, schedule) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                [s.id, e.teacher, e.subject, e.curr || '', e.sessionsTotal || 0, e.sessionsUsed || 0, JSON.stringify(e.schedule || [])]);
                        }
                    }
                }
            }

            if (data.teachers) {
                for (const t of data.teachers) {
                    await tx.run(`INSERT INTO teachers (id, name, phone1, phone2, subject, price) VALUES (?, ?, ?, ?, ?, ?)`,
                        [t.id, t.name, t.phone1, t.phone2 || '', t.subject, t.price || 0]);
                }
            }

            if (data.parents) {
                for (const p of data.parents) {
                    await tx.run(`INSERT INTO parents (id, name, phone, email) VALUES (?, ?, ?, ?)`, [p.id, p.name, p.phone, p.email || '']);
                }
            }

            if (data.sessions) {
                for (const s of data.sessions) {
                    await tx.run(`INSERT INTO sessions (id, studentId, studentName, teacherName, subject, date, day, time, price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [s.id, s.studentId, s.studentName, s.teacherName, s.subject, s.date, s.day || '', s.time, s.price || 0, s.status]);
                }
            }

            if (data.invoices) {
                for (const i of data.invoices) {
                    await tx.run(`INSERT INTO teacher_invoices (id, teacher, specialization, amount, paymentMethod, status, personalExpenses, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [i.id, i.teacher, i.specialization, i.amount, i.paymentMethod, i.status, i.personalExpenses || 0, i.date]);
                }
            }

            if (data.studentInvoices) {
                for (const i of data.studentInvoices) {
                    await tx.run(`INSERT INTO student_invoices (id, studentId, studentName, amount, description, date, dueDate, status, paymentMethod, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [i.id, i.studentId, i.studentName, i.amount, i.description, i.date, i.dueDate, i.status, i.paymentMethod || '', i.notes || '']);
                }
            }
        });

        res.json({ message: 'Restore successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 3. System Reset
router.post('/system-reset', async (req, res) => {
    try {
        await withTransaction(req.db, async (tx) => {
            // Delete all operational data
            await tx.run('DELETE FROM enrollments');
            await tx.run('DELETE FROM students');
            await tx.run('DELETE FROM teachers');
            await tx.run('DELETE FROM parents');
            await tx.run('DELETE FROM sessions');
            await tx.run('DELETE FROM teacher_invoices');
            await tx.run('DELETE FROM student_invoices');
            await tx.run('DELETE FROM notifications');
            await tx.run('DELETE FROM tasks');
            await tx.run('DELETE FROM manual_transactions');
            await tx.run('DELETE FROM fixed_expenses');
            await tx.run('DELETE FROM completed_sessions');
            await tx.run('DELETE FROM dismissed_notifications');

            // Delete non-admin users if any exist (safety measure)
            // But per requirements, we keep "admins" and "supervisors"
            await tx.run("DELETE FROM users WHERE role NOT IN ('admin', 'supervisor')");

            // Reset system settings to defaults
            await tx.run("DELETE FROM system_settings");

            // Re-seed default settings
            const defaultSettings = [
                { key: 'academy_name', value: 'معهد دارين' },
                { key: 'admin_phone', value: '01152001250' },
                { key: 'theme_color', value: 'indigo' },
                { key: 'notifications_enabled', value: 'true' }
            ];
            for (const s of defaultSettings) {
                await tx.run('INSERT INTO system_settings (key, value) VALUES (?, ?)', [s.key, s.value]);
            }

            // Re-seed default fixed expenses
            const defaultExpenses = [
                { name: 'إيجار المركز', amount: 0 },
                { name: 'كهرباء وإنترنت', amount: 0 },
                { name: 'نثريات وتسويق', amount: 0 },
                { name: 'حصص ملغية', amount: 0 },
                { name: 'أخرى', amount: 0 }
            ];
            for (const exp of defaultExpenses) {
                await tx.run('INSERT INTO fixed_expenses (name, amount) VALUES (?, ?)', [exp.name, exp.amount]);
            }
        });
        res.json({ message: 'System reset successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 4. Settings Routes
router.get('/settings', async (req, res) => {
    try {
        const settings = await req.db.all('SELECT * FROM system_settings');
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });
        res.json(settingsMap);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/settings', async (req, res) => {
    const { key, value } = req.body;
    try {
        await req.db.run('INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)', [key, String(value)]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. User Management Routes
router.get('/users', async (req, res) => {
    try {
        const users = await req.db.all('SELECT id, name, username, role, permissions FROM users');
        const parsedUsers = users.map(u => ({
            ...u,
            permissions: u.permissions ? JSON.parse(u.permissions) : []
        }));
        res.json(parsedUsers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/users', async (req, res) => {
    const { id, name, username, password, role, permissions } = req.body;
    try {
        await req.db.run(
            'INSERT INTO users (id, name, username, password, role, permissions) VALUES (?, ?, ?, ?, ?, ?)',
            [id || require('uuid').v4(), name, username, password, role || 'admin', JSON.stringify(permissions || [])]
        );
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, username, password, role, permissions } = req.body;
    try {
        if (password) {
            await req.db.run(
                'UPDATE users SET name = ?, username = ?, password = ?, role = ?, permissions = ? WHERE id = ?',
                [name, username, password, role, JSON.stringify(permissions), id]
            );
        } else {
            await req.db.run(
                'UPDATE users SET name = ?, username = ?, role = ?, permissions = ? WHERE id = ?',
                [name, username, role, JSON.stringify(permissions), id]
            );
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await req.db.run('DELETE FROM users WHERE id = ?', id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Completed Sessions Routes
router.get('/completed-sessions', async (req, res) => {
    try {
        const sessions = await req.db.all('SELECT id FROM completed_sessions');
        res.json(sessions.map(s => s.id));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/completed-sessions', async (req, res) => {
    const { id } = req.body;
    try {
        await req.db.run('INSERT OR IGNORE INTO completed_sessions (id) VALUES (?)', id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/completed-sessions/reset', async (req, res) => {
    try {
        await req.db.run('DELETE FROM completed_sessions');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Dismissed Notifications Routes
router.get('/dismissed-notifications', async (req, res) => {
    try {
        const dismissed = await req.db.all('SELECT id FROM dismissed_notifications');
        res.json(dismissed.map(d => d.id));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/dismissed-notifications', async (req, res) => {
    const { id } = req.body;
    try {
        await req.db.run('INSERT OR IGNORE INTO dismissed_notifications (id) VALUES (?)', id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/dismissed-notifications/reset', async (req, res) => {
    try {
        await req.db.run('DELETE FROM dismissed_notifications');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = { systemRouter: router };

