const express = require('express');
const router = express.Router();
const { getStudentEnrollments, withTransaction } = require('../utils/dbHelper');


// Using req.db from middleware


// 1. Backup data
router.get('/backup', async (req, res) => {
    try {
        const [
            students, teachers, parents, sessions, teacherInvoices,
            studentInvoices, manualTransactions, fixedExpenses,
            tasks, completedSessions, dismissedNotifications, systemSettings, users,
            announcements, conversations, messages, notifications, chatProfiles, conversationMembers
        ] = await Promise.all([
            req.db.all('SELECT * FROM students'),
            req.db.all('SELECT * FROM teachers'),
            req.db.all('SELECT * FROM parents'),
            req.db.all('SELECT * FROM sessions'),
            req.db.all('SELECT * FROM teacher_invoices'),
            req.db.all('SELECT * FROM student_invoices'),
            req.db.all('SELECT * FROM manual_transactions'),
            req.db.all('SELECT * FROM fixed_expenses'),
            req.db.all('SELECT * FROM tasks'),
            req.db.all('SELECT * FROM completed_sessions'),
            req.db.all('SELECT * FROM dismissed_notifications'),
            req.db.all('SELECT * FROM system_settings'),
            req.db.all('SELECT id, name, username, password, role, permissions FROM users'),
            req.db.all('SELECT * FROM announcements'),
            req.db.all('SELECT * FROM conversations'),
            req.db.all('SELECT * FROM messages'),
            req.db.all('SELECT * FROM notifications'),
            req.db.all('SELECT * FROM chat_profiles'),
            req.db.all('SELECT * FROM conversation_members')
        ]);

        const studentsWithEnrollments = await Promise.all(students.map(async (s) => {
            const enrollments = await getStudentEnrollments(req.db, s.id);
            return { ...s, enrollments };
        }));

        const backup = {
            version: '1.2', // Incremented version
            timestamp: new Date().toISOString(),
            data: {
                students: studentsWithEnrollments,
                teachers,
                parents,
                sessions,
                invoices: teacherInvoices,
                studentInvoices: studentInvoices.map(inv => ({
                    ...inv,
                    items: inv.items ? JSON.parse(inv.items) : []
                })),
                manualTransactions,
                fixedExpenses,
                tasks,
                completedSessions,
                dismissedNotifications,
                // Include active notifications too to preserve user state
                notifications,
                systemSettings,
                users,
                announcements,
                conversations,
                messages,
                chatProfiles,
                conversationMembers
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
            // Delete existing data in reverse order of dependencies
            await tx.run('DELETE FROM messages');
            await tx.run('DELETE FROM conversation_members');
            await tx.run('DELETE FROM conversations');
            await tx.run('DELETE FROM chat_profiles');
            await tx.run('DELETE FROM announcements');
            await tx.run('DELETE FROM enrollments'); // Depends on students/teachers
            await tx.run('DELETE FROM student_invoices');
            await tx.run('DELETE FROM sessions');

            await tx.run('DELETE FROM students');
            await tx.run('DELETE FROM teachers');
            await tx.run('DELETE FROM parents');

            await tx.run('DELETE FROM teacher_invoices');
            await tx.run('DELETE FROM notifications');
            await tx.run('DELETE FROM tasks');
            await tx.run('DELETE FROM manual_transactions');
            await tx.run('DELETE FROM fixed_expenses');
            await tx.run('DELETE FROM completed_sessions');
            await tx.run('DELETE FROM dismissed_notifications');
            await tx.run('DELETE FROM system_settings');

            // We keep the primary 'admin' to avoid locking out, but clear others
            // Only if we are restoring users, otherwise keep existing
            if (data.users && data.users.length > 0) {
                await tx.run("DELETE FROM users WHERE username != 'admin'");
            }

            // --- RESTORE PROCESS ---

            // 1. Users first (as other tables might refer to them)
            if (data.users) {
                for (const u of data.users) {
                    if (u.username === 'admin') continue;
                    await tx.run(`INSERT OR REPLACE INTO users (id, name, username, password, role, permissions) VALUES (?, ?, ?, ?, ?, ?)`,
                        [u.id, u.name, u.username, u.password, u.role, typeof u.permissions === 'string' ? u.permissions : JSON.stringify(u.permissions)]);
                }
            }

            // 2. Teachers & Parents (independent entities)
            if (data.teachers) {
                for (const t of data.teachers) {
                    await tx.run(`INSERT INTO teachers (id, name, phone1, phone2, subject, price, email, username, password, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [t.id, t.name, t.phone1 || '', t.phone2 || '', t.subject || '', t.price || 0, t.email || '', t.username || null, t.password || null, t.created_at || new Date().toISOString()]);
                }
            }

            if (data.parents) {
                for (const p of data.parents) {
                    await tx.run(`INSERT INTO parents (id, name, phone, email) VALUES (?, ?, ?, ?)`,
                        [p.id, p.name, p.phone || '', p.email || '']);
                }
            }

            // 3. Students & Enrollments
            if (data.students) {
                for (const s of data.students) {
                    await tx.run(`INSERT INTO students (id, name, grade, parentPhone, studentPhone, curriculum, notes, sessionPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [s.id, s.name, s.grade || '', s.parentPhone || '', s.studentPhone || '', s.curriculum || '', s.notes || '', s.sessionPrice !== undefined ? s.sessionPrice : 0]);

                    if (s.enrollments) {
                        for (const e of s.enrollments) {
                            await tx.run(`INSERT INTO enrollments (studentId, teacher, teacherId, subject, curr, sessionsTotal, sessionsUsed, schedule) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                                [s.id, e.teacher || '', e.teacherId || null, e.subject || '', e.curr || '', e.sessionsTotal || 0, e.sessionsUsed || 0, typeof e.schedule === 'string' ? e.schedule : JSON.stringify(e.schedule || [])]);
                        }
                    }
                }
            }

            // 4. Sessions (Added all columns like teacherPrice)
            if (data.sessions) {
                for (const s of data.sessions) {
                    await tx.run(`INSERT INTO sessions (id, studentId, studentName, teacherId, teacherName, subject, date, day, time, price, teacherPrice, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [s.id, s.studentId, s.studentName, s.teacherId || null, s.teacherName, s.subject, s.date, s.day || '', s.time, s.price || 0, s.teacherPrice || 0, s.status, s.created_at || new Date().toISOString()]);
                }
            }

            // 5. Financials
            if (data.invoices) {
                for (const i of data.invoices) {
                    await tx.run(`INSERT INTO teacher_invoices (id, teacherId, teacher, specialization, amount, paymentMethod, status, personalExpenses, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [i.id, i.teacherId || null, i.teacher, i.specialization || '', i.amount, i.paymentMethod, i.status, i.personalExpenses || 0, i.date]);
                }
            }

            if (data.studentInvoices) {
                for (const i of data.studentInvoices) {
                    const items = i.items ? (typeof i.items === 'string' ? i.items : JSON.stringify(i.items)) : null;
                    await tx.run(`INSERT INTO student_invoices (id, studentId, studentName, amount, description, date, dueDate, status, paymentMethod, notes, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [i.id, i.studentId, i.studentName, i.amount, i.description, i.date, i.dueDate, i.status, i.paymentMethod || '', i.notes || '', items]);
                }
            }

            if (data.manualTransactions) {
                for (const t of data.manualTransactions) {
                    await tx.run(`INSERT INTO manual_transactions (id, type, category, amount, date, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [t.id, t.type, t.category, t.amount, t.date, t.description, t.status, t.created_at || new Date().toISOString()]);
                }
            }

            if (data.fixedExpenses) {
                for (const e of data.fixedExpenses) {
                    await tx.run(`INSERT INTO fixed_expenses (id, name, amount, is_active) VALUES (?, ?, ?, ?)`,
                        [e.id, e.name, e.amount, e.is_active]);
                }
            }

            // 6. Tasks & Notifications & Settings
            if (data.tasks) {
                for (const t of data.tasks) {
                    await tx.run(`INSERT INTO tasks (id, title, description, status, priority, dueDate) VALUES (?, ?, ?, ?, ?, ?)`,
                        [t.id, t.title, t.description, t.status, t.priority, t.dueDate]);
                }
            }

            if (data.completedSessions) {
                for (const s of data.completedSessions) {
                    await tx.run(`INSERT INTO completed_sessions (id) VALUES (?)`, [s.id]);
                }
            }

            if (data.dismissedNotifications) {
                for (const n of data.dismissedNotifications) {
                    await tx.run(`INSERT OR IGNORE INTO dismissed_notifications (id) VALUES (?)`, [n.id]);
                }
            }

            if (data.notifications) {
                for (const n of data.notifications) {
                    await tx.run(`INSERT OR IGNORE INTO notifications (id, senderId, receiverId, senderName, title, message, type, time, read, conversationId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [n.id, n.senderId || 'system', n.receiverId, n.senderName || 'System', n.title, n.message, n.type, n.time, n.read, n.conversationId || null]);
                }
            }

            if (data.chatProfiles) {
                for (const cp of data.chatProfiles) {
                    await tx.run(`INSERT INTO chat_profiles (id, name, username, password, avatar, status, lastSeen, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [cp.id, cp.name, cp.username, cp.password, cp.avatar || null, cp.status || 'offline', cp.lastSeen || null, cp.createdAt || new Date().toISOString()]);
                }
            }

            if (data.systemSettings) {
                for (const s of data.systemSettings) {
                    await tx.run(`INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)`, [s.key, s.value]);
                }
            }

            // 7. New Tables: Announcements & Chat
            if (data.announcements) {
                for (const a of data.announcements) {
                    // Check column naming carefully: isActive vs active, created_at vs date
                    await tx.run(`INSERT INTO announcements (id, title, content, type, date, isActive, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [a.id, a.title, a.content, a.type || a.targetAudience || 'general', a.date, a.isActive !== undefined ? a.isActive : (a.active !== undefined ? a.active : 1), a.created_at || a.date || new Date().toISOString()]);
                }
            }

            if (data.conversations) {
                for (const c of data.conversations) {
                    // Schema columns: id, name, isGroup, createdBy, createdAt
                    await tx.run(`INSERT INTO conversations (id, name, isGroup, createdBy, createdAt) VALUES (?, ?, ?, ?, ?)`,
                        [c.id, c.name || null, c.isGroup !== undefined ? c.isGroup : (c.type === 'group' ? 1 : 0), c.createdBy || 'system', c.createdAt || c.updatedAt || new Date().toISOString()]);
                }
            }

            if (data.conversationMembers) {
                for (const cm of data.conversationMembers) {
                    await tx.run(`INSERT INTO conversation_members (conversationId, userId) VALUES (?, ?)`,
                        [cm.conversationId, cm.userId]);
                }
            }

            if (data.messages) {
                for (const m of data.messages) {
                    // Schema columns: id, conversationId, senderId, senderName, content, timestamp
                    await tx.run(`INSERT INTO messages (id, conversationId, senderId, senderName, content, timestamp) VALUES (?, ?, ?, ?, ?, ?)`,
                        [m.id, m.conversationId, m.senderId, m.senderName, m.content, m.timestamp]);
                }
            }
        });

        res.json({ message: 'Restore successful, system completely updated.' });
    } catch (err) {
        console.error("CRITICAL RESTORE ERROR:", err);
        res.status(500).json({ error: 'Restore failed: ' + err.message });
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
                { key: 'academy_name', value: 'دارين لتعليم و التدريب' },
                { key: 'admin_phone', value: '201152001250' },
                { key: 'theme_color', value: 'indigo' },
                { key: 'notifications_enabled', value: 'true' },
                { key: 'maintenance_mode', value: 'false' }
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
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);
        await req.db.run(
            'INSERT INTO users (id, name, username, password, role, permissions) VALUES (?, ?, ?, ?, ?, ?)',
            [id || require('uuid').v4(), name, username, hashedPassword, role || 'admin', JSON.stringify(permissions || [])]
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
        if (password && password.trim() !== '') {
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash(password, 10);
            await req.db.run(
                'UPDATE users SET name = ?, username = ?, password = ?, role = ?, permissions = ? WHERE id = ?',
                [name, username, hashedPassword, role, JSON.stringify(permissions), id]
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

