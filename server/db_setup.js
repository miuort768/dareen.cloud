const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

const { getDb } = require('./utils/db');

async function setupDatabase() {
    // Use the centralized DB instance
    const db = await getDb();

    console.log('Creating tables...');
    // 1. Create Tables
    await db.exec(`

        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
        PRAGMA busy_timeout = 5000;

        CREATE TABLE IF NOT EXISTS teachers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone1 TEXT,
            phone2 TEXT,
            subject TEXT,
            price INTEGER DEFAULT 0,
            email TEXT,
            username TEXT UNIQUE,
            password TEXT,
            points INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS students (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            grade TEXT,
            parentPhone TEXT,
            studentPhone TEXT,
            curriculum TEXT,
            notes TEXT,
            sessionPrice INTEGER DEFAULT 0,
            parentId TEXT,
            totalPoints INTEGER DEFAULT 0,
            badges TEXT, -- JSON string
            username TEXT UNIQUE,
            password TEXT,
            FOREIGN KEY(parentId) REFERENCES parents(id) ON DELETE SET NULL
        );
        
        CREATE TABLE IF NOT EXISTS points_log (
            id TEXT PRIMARY KEY,
            studentId TEXT NOT NULL,
            amount INTEGER NOT NULL,
            action TEXT NOT NULL,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(studentId) REFERENCES students(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS enrollments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId TEXT NOT NULL,
            teacherId TEXT, -- Will migrate teacher name to teacherId
            teacher TEXT,   -- Keep for compatibility during transition
            subject TEXT,
            curr TEXT,
            sessionsTotal INTEGER DEFAULT 0,
            sessionsUsed INTEGER DEFAULT 0,
            schedule TEXT, -- Stored as JSON string
            nextSessionNotes TEXT,
            FOREIGN KEY(studentId) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY(teacherId) REFERENCES teachers(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS parents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            username TEXT UNIQUE,
            password TEXT
        );

        CREATE TABLE IF NOT EXISTS blog_posts (
            id TEXT PRIMARY KEY,
            slug TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            excerpt TEXT,
            content TEXT,
            coverImage TEXT,
            category TEXT,
            keywords TEXT,
            author TEXT,
            date TEXT DEFAULT CURRENT_TIMESTAMP,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS live_sessions (
            id TEXT PRIMARY KEY,
            teacherId TEXT NOT NULL,
            teacherName TEXT NOT NULL,
            title TEXT,
            subject TEXT,
            status TEXT DEFAULT 'active',
            started_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            studentId TEXT NOT NULL,
            teacherId TEXT, -- Will migrate teacher name to teacherId
            studentName TEXT,
            teacherName TEXT,
            subject TEXT,
            date TEXT NOT NULL,
            day TEXT,
            time TEXT,
            price INTEGER DEFAULT 0,
            teacherPrice INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            topics TEXT,
            homework TEXT,
            needsCompensation INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(studentId) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY(teacherId) REFERENCES teachers(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS teacher_invoices (
            id TEXT PRIMARY KEY,
            teacherId TEXT,
            teacher TEXT, -- Keep for compatibility
            specialization TEXT,
            amount INTEGER NOT NULL,
            paymentMethod TEXT,
            status TEXT DEFAULT 'unpaid',
            personalExpenses INTEGER DEFAULT 0,
            date TEXT NOT NULL,
            FOREIGN KEY(teacherId) REFERENCES teachers(id) ON DELETE SET NULL
        );
        
        CREATE TABLE IF NOT EXISTS student_invoices (
            id TEXT PRIMARY KEY,
            studentId TEXT NOT NULL,
            studentName TEXT,
            amount INTEGER NOT NULL,
            description TEXT,
            date TEXT NOT NULL,
            dueDate TEXT,
            status TEXT DEFAULT 'unpaid',
            paymentMethod TEXT,
            notes TEXT,
            items TEXT,
            FOREIGN KEY(studentId) REFERENCES students(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            senderId TEXT,
            receiverId TEXT,
            senderName TEXT,
            title TEXT NOT NULL,
            message TEXT,
            type TEXT DEFAULT 'info', -- success, warning, info
            time TEXT NOT NULL,
            read INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS manual_transactions (
            id TEXT PRIMARY KEY,
            type TEXT, -- income, expense
            category TEXT,
            amount REAL,
            date TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'completed',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS fixed_expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            amount REAL DEFAULT 0,
            is_active INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'pending', -- pending, completed
            priority TEXT DEFAULT 'medium', -- low, medium, high
            dueDate TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS system_settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );

        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            permissions TEXT -- Stored as JSON string
        );

        CREATE TABLE IF NOT EXISTS completed_sessions (
            id TEXT PRIMARY KEY
        );

        CREATE TABLE IF NOT EXISTS dismissed_notifications (
            id TEXT PRIMARY KEY
        );

        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            name TEXT,
            isGroup INTEGER DEFAULT 0,
            createdBy TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS conversation_members (
            conversationId TEXT NOT NULL,
            userId TEXT NOT NULL,
            PRIMARY KEY (conversationId, userId),
            FOREIGN KEY(conversationId) REFERENCES conversations(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            conversationId TEXT NOT NULL,
            senderId TEXT NOT NULL,
            senderName TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(conversationId) REFERENCES conversations(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS chat_profiles (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            avatar TEXT,
            status TEXT DEFAULT 'offline',
            lastSeen TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS announcements (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT,
            type TEXT DEFAULT 'general',
            date TEXT NOT NULL,
            isActive INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS evaluations (
            id TEXT PRIMARY KEY,
            studentId TEXT NOT NULL,
            teacherId TEXT NOT NULL,
            teacherName TEXT,
            sessionId TEXT,
            date TEXT NOT NULL,
            rating TEXT NOT NULL,
            notes TEXT,
            points INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(studentId) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY(teacherId) REFERENCES teachers(id) ON DELETE SET NULL,
            FOREIGN KEY(sessionId) REFERENCES sessions(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT,
            username TEXT,
            action TEXT NOT NULL,
            details TEXT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS whatsapp_templates (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            content TEXT NOT NULL,
            isActive INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS push_subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT NOT NULL,
            subscription TEXT NOT NULL, -- JSON string
            deviceType TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS forum_posts (
            id TEXT PRIMARY KEY,
            authorId TEXT NOT NULL,
            authorName TEXT NOT NULL,
            authorRole TEXT NOT NULL,
            content TEXT NOT NULL,
            status TEXT DEFAULT 'pending', -- pending, approved, rejected
            upvotes TEXT DEFAULT '[]',
            downvotes TEXT DEFAULT '[]',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS forum_comments (
            id TEXT PRIMARY KEY,
            postId TEXT NOT NULL,
            authorId TEXT NOT NULL,
            authorName TEXT NOT NULL,
            authorRole TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(postId) REFERENCES forum_posts(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS active_sessions (
            id TEXT PRIMARY KEY,
            studentId TEXT NOT NULL,
            teacherId TEXT NOT NULL,
            teacherName TEXT NOT NULL,
            subject TEXT NOT NULL,
            timerSeconds INTEGER DEFAULT 0,
            startedAt TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS leads (
            id TEXT PRIMARY KEY,
            studentName TEXT NOT NULL,
            phone TEXT NOT NULL,
            subject TEXT,
            status TEXT DEFAULT 'new',
            priority TEXT DEFAULT 'medium',
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        -- Tables created above
    `);




    async function addColumnIfNotExists(tableName, columnName, columnDefinition) {
        const columns = await db.all(`PRAGMA table_info(${tableName})`);
        // Use case-insensitive search for column name
        if (!columns.some(c => c.name.toLowerCase() === columnName.toLowerCase())) {
            console.log(`Adding column ${columnName} to ${tableName}...`);
            try {
                await db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
                console.log(`Successfully added ${columnName} to ${tableName}`);
            } catch (e) {
                console.error(`Failed to add ${columnName} to ${tableName}:`, e.message);
            }
        } else {
            console.log(`Column ${columnName} already exists in ${tableName}`);
        }
    }


    // Ensure new columns exist in case tables were already created
    await addColumnIfNotExists('teachers', 'email', 'TEXT');
    await addColumnIfNotExists('teachers', 'username', 'TEXT');
    await addColumnIfNotExists('teachers', 'password', 'TEXT');
    await addColumnIfNotExists('teachers', 'created_at', 'TEXT DEFAULT CURRENT_TIMESTAMP');
    await addColumnIfNotExists('students', 'sessionPrice', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('students', 'totalPoints', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('parents', 'username', 'TEXT');
    await addColumnIfNotExists('parents', 'password', 'TEXT');
    await addColumnIfNotExists('students', 'username', 'TEXT UNIQUE');
    await addColumnIfNotExists('students', 'password', 'TEXT');
    await addColumnIfNotExists('sessions', 'created_at', 'TEXT DEFAULT CURRENT_TIMESTAMP');
    await addColumnIfNotExists('teachers', 'points', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('enrollments', 'nextSessionNotes', 'TEXT');
    await addColumnIfNotExists('sessions', 'topics', 'TEXT');
    await addColumnIfNotExists('sessions', 'homework', 'TEXT');
    await addColumnIfNotExists('sessions', 'needsCompensation', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('tasks', 'userId', 'TEXT');

    // Create unique index for parent username separately (SQLite restriction)
    try {
        await db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_parents_username ON parents(username)');
    } catch (e) {
        console.warn('Note: Could not create unique index on parents(username):', e.message);
    }


    await addColumnIfNotExists('enrollments', 'teacherId', 'TEXT REFERENCES teachers(id) ON DELETE SET NULL');

    await addColumnIfNotExists('enrollments', 'teacher', 'TEXT');
    await addColumnIfNotExists('enrollments', 'isFrozen', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('enrollments', 'frozenReason', 'TEXT');
    await addColumnIfNotExists('sessions', 'teacherId', 'TEXT REFERENCES teachers(id) ON DELETE SET NULL');
    await addColumnIfNotExists('teacher_invoices', 'teacherId', 'TEXT REFERENCES teachers(id) ON DELETE SET NULL');
    await addColumnIfNotExists('student_invoices', 'studentId', 'TEXT NOT NULL DEFAULT "unknown"');
    await addColumnIfNotExists('student_invoices', 'description', 'TEXT');
    await addColumnIfNotExists('student_invoices', 'dueDate', 'TEXT');
    await addColumnIfNotExists('student_invoices', 'paymentMethod', 'TEXT');
    await addColumnIfNotExists('student_invoices', 'notes', 'TEXT');
    await addColumnIfNotExists('student_invoices', 'items', 'TEXT');
    await addColumnIfNotExists('sessions', 'teacherPrice', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('notifications', 'conversationId', 'TEXT');
    await addColumnIfNotExists('notifications', 'link', 'TEXT');
    await addColumnIfNotExists('conversations', 'isLive', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('conversations', 'meetingUrl', 'TEXT');

    // Archive policies columns
    await addColumnIfNotExists('sessions', 'is_archived', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('student_invoices', 'is_archived', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('teacher_invoices', 'is_archived', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('manual_transactions', 'is_archived', 'INTEGER DEFAULT 0');

    // Create remaining indices
    const indices = [
        'CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(studentId)',
        'CREATE INDEX IF NOT EXISTS idx_sessions_student ON sessions(studentId)',
        'CREATE INDEX IF NOT EXISTS idx_student_invoices_student ON student_invoices(studentId)',
        'CREATE INDEX IF NOT EXISTS idx_sessions_teacher ON sessions(teacherId)',
        'CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date)',
        'CREATE INDEX IF NOT EXISTS idx_teacher_invoices_teacher ON teacher_invoices(teacherId)',
        'CREATE INDEX IF NOT EXISTS idx_parents_phone ON parents(phone)',
        'CREATE INDEX IF NOT EXISTS idx_students_name ON students(name)',
        'CREATE INDEX IF NOT EXISTS idx_student_invoices_status ON student_invoices(status)',
        'CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversationId)',
        'CREATE INDEX IF NOT EXISTS idx_conversation_members_user ON conversation_members(userId)',
        'CREATE INDEX IF NOT EXISTS idx_sessions_sync ON sessions(studentId, teacherName, subject, status)',
        'CREATE INDEX IF NOT EXISTS idx_enrollments_sync ON enrollments(studentId, teacher, subject)',
        'CREATE INDEX IF NOT EXISTS idx_evaluations_student ON evaluations(studentId)',
        'CREATE INDEX IF NOT EXISTS idx_evaluations_teacher ON evaluations(teacherId)'
    ];

    for (const idx of indices) {
        try {
            await db.exec(idx);
        } catch (e) {
            console.error(`Failed to create index [${idx}]:`, e.message);
        }
    }

    // ─── ADDING FUNCTIONAL INDEXES FOR CASE-INSENSITIVE PERFORMANCE ───
    const functionalIndices = [
        'CREATE INDEX IF NOT EXISTS idx_students_name_lower ON students(LOWER(name))',
        'CREATE INDEX IF NOT EXISTS idx_teachers_name_lower ON teachers(LOWER(name))',
        'CREATE INDEX IF NOT EXISTS idx_sessions_student_lower ON sessions(LOWER(studentName))',
        'CREATE INDEX IF NOT EXISTS idx_sessions_teacher_lower ON sessions(LOWER(teacherName))',
        'CREATE INDEX IF NOT EXISTS idx_parents_name_lower ON parents(LOWER(name))'
    ];

    for (const idx of functionalIndices) {
        try {
            await db.exec(idx);
        } catch (e) {
            console.warn(`Functional index warning [${idx}]:`, e.message);
        }
    }


    // ─── ADDING TOKEN VERSIONING FOR SESSION REVOCATION ───
    const versionColumns = [
        'ALTER TABLE users ADD COLUMN token_version INTEGER DEFAULT 1',
        'ALTER TABLE teachers ADD COLUMN token_version INTEGER DEFAULT 1',
        'ALTER TABLE parents ADD COLUMN token_version INTEGER DEFAULT 1',
        'ALTER TABLE students ADD COLUMN token_version INTEGER DEFAULT 1'
    ];

    for (const col of versionColumns) {
        try {
            await db.exec(col);
        } catch (e) {
            // Already exists is fine
        }
    }

    console.log('Tables created and verified.');


    // 2. Migrate Data from db.json
    const dbJsonPath = path.join(__dirname, '..', 'db.json');
    if (fs.existsSync(dbJsonPath)) {
        const rawData = fs.readFileSync(dbJsonPath);
        const jsonData = JSON.parse(rawData);

        // Map teacher names to IDs for easier lookup during migration
        const teacherMap = {};
        if (jsonData.teachers) {
            console.log(`Found ${jsonData.teachers.length} teachers in db.json`);
            for (const t of jsonData.teachers) {
                console.log(`Migrating teacher: ${t.name} (ID: ${t.id})`);
                teacherMap[t.name] = t.id;

                const dbUsername = t.username && t.username.trim() !== '' ? t.username.trim() : null;

                let dbPassword = null;
                if (t.password && typeof t.password === 'string' && t.password.trim() !== '') {
                    const bcrypt = require('bcrypt'); // Added bcrypt here
                    dbPassword = t.password.startsWith('$2b$') ? t.password : await bcrypt.hash(t.password, 10);
                }

                await db.run(
                    `INSERT OR REPLACE INTO teachers (id, name, phone1, phone2, subject, price, email, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [t.id, t.name, t.phone1, t.phone2, t.subject, t.price || 0, t.email || '', dbUsername, dbPassword]
                );
            }
            console.log(`Migrated ${jsonData.teachers.length} teachers.`);
        }



        // Migrate Students & Enrollments
        if (jsonData.students) {
            for (const s of jsonData.students) {
                await db.run(
                    `INSERT OR IGNORE INTO students (id, name, grade, parentPhone, studentPhone, curriculum, notes, sessionPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [s.id, s.name, s.grade, s.parentPhone, s.studentPhone || '', s.curriculum || '', s.notes || '', s.sessionPrice || s.discount || 0]
                );

                if (s.enrollments && s.enrollments.length > 0) {
                    for (const e of s.enrollments) {
                        const teacherId = teacherMap[e.teacher] || null;
                        await db.run(
                            `INSERT INTO enrollments (studentId, teacherId, teacher, subject, curr, sessionsTotal, sessionsUsed, schedule) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                            [s.id, teacherId, e.teacher, e.subject, e.curr, e.sessionsTotal, e.sessionsUsed, JSON.stringify(e.schedule)]
                        );
                    }
                }
            }
            console.log(`Migrated ${jsonData.students.length} students.`);
        }

        // Migrate Parents
        if (jsonData.parents) {
            for (const p of jsonData.parents) {
                await db.run(
                    `INSERT OR IGNORE INTO parents (id, name, phone, email) VALUES (?, ?, ?, ?)`,
                    [p.id, p.name, p.phone, p.email || '']
                );
            }
            console.log(`Migrated ${jsonData.parents.length} parents.`);
        }

        // Migrate Sessions
        if (jsonData.sessions) {
            for (const s of jsonData.sessions) {
                const teacherId = teacherMap[s.teacherName] || null;
                await db.run(
                    `INSERT OR IGNORE INTO sessions (id, studentId, teacherId, studentName, teacherName, subject, date, day, time, price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [s.id, s.studentId, teacherId, s.studentName, s.teacherName, s.subject, s.date, s.day, s.time, s.price, s.status]
                );
            }
            console.log(`Migrated ${jsonData.sessions.length} sessions.`);
        }

        // Migrate Teacher Invoices
        if (jsonData.invoices) {
            for (const inv of jsonData.invoices) {
                const teacherId = teacherMap[inv.teacher] || null;
                await db.run(
                    `INSERT OR IGNORE INTO teacher_invoices (id, teacherId, teacher, specialization, amount, paymentMethod, status, personalExpenses, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [inv.id, teacherId, inv.teacher, inv.specialization, inv.amount, inv.paymentMethod, inv.status, inv.personalExpenses, inv.date]
                );
            }
            console.log(`Migrated ${jsonData.invoices.length} teacher invoices.`);
        }

        // Migrate Student Invoices
        if (jsonData.studentInvoices) {
            for (const inv of jsonData.studentInvoices) {
                await db.run(
                    `INSERT OR IGNORE INTO student_invoices (id, studentId, studentName, amount, description, date, dueDate, status, paymentMethod, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [inv.id, inv.studentId, inv.studentName, inv.amount, inv.description, inv.date, inv.dueDate, inv.status, inv.paymentMethod, inv.notes]
                );
            }
            console.log(`Migrated ${jsonData.studentInvoices.length} student invoices.`);
        }
    } else {
        console.log('No db.json found to migrate.');
    }

    // Seed default fixed expenses if empty
    const fixedExpensesCount = await db.get('SELECT count(*) as count FROM fixed_expenses');
    if (fixedExpensesCount.count === 0) {
        console.log('Seeding default fixed expenses...');
        const defaults = [
            { name: 'إيجار المركز', amount: 0 },
            { name: 'كهرباء وإنترنت', amount: 0 },
            { name: 'نثريات وتسويق', amount: 0 },
            { name: 'حصص ملغية', amount: 0 },
            { name: 'أخرى', amount: 0 }
        ];

        for (const exp of defaults) {
            await db.run('INSERT INTO fixed_expenses (name, amount) VALUES (?, ?)', [exp.name, exp.amount]);
        }
        console.log('Seeded fixed expenses.');
    }

    // Seed default settings if empty
    const settingsCount = await db.get('SELECT count(*) as count FROM system_settings');
    if (settingsCount.count === 0) {
        console.log('Seeding default system settings...');
        const defaultSettings = [
            { key: 'academy_name', value: 'منصة دارين' },
            { key: 'admin_phone', value: '201152001250' },
            { key: 'theme_color', value: 'indigo' },
            { key: 'notifications_enabled', value: 'true' },
            { key: 'maintenance_mode', value: 'false' },
            { key: 'whatsapp_auto_notify', value: 'false' },
            { key: 'default_session_price', value: '0' },
            { key: 'semester_name', value: 'الفصل الدراسي' },
            { key: 'balance_warning_threshold', value: '2' },
            { key: 'chatbot_enabled', value: 'false' },
            { key: 'chatbot_welcome_msg', value: 'أهلاً بك في منصة دارين، كيف يمكنني مساعدتك اليوم؟' },
            { key: 'chatbot_name', value: 'مساعد دارين' }
        ];
        for (const s of defaultSettings) {
            await db.run('INSERT INTO system_settings (key, value) VALUES (?, ?)', [s.key, s.value]);
        }
    } else {
        // Ensure keys exist even if table is not empty
        await db.run("INSERT OR IGNORE INTO system_settings (key, value) VALUES ('maintenance_mode', 'false')");
        await db.run("INSERT OR IGNORE INTO system_settings (key, value) VALUES ('chatbot_enabled', 'false')");
        await db.run("INSERT OR IGNORE INTO system_settings (key, value) VALUES ('chatbot_name', 'مساعد دارين')");
        await db.run("INSERT OR IGNORE INTO system_settings (key, value) VALUES ('chatbot_welcome_msg', 'أهلاً بك في منصة دارين، كيف يمكنني مساعدتك اليوم؟')");
    }

    // Seed default admin if empty
    const usersCount = await db.get('SELECT count(*) as count FROM users');
    if (usersCount.count === 0) {
        console.log('Seeding default admin user...');
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('admin', 10);
        await db.run(
            'INSERT INTO users (id, name, username, password, role, permissions) VALUES (?, ?, ?, ?, ?, ?)',
            ['admin_1', 'الشيخ خوارزمي', 'admin', hashedPassword, 'admin', JSON.stringify(['*'])]
        );
    }

    // Migration: Add new columns if they don't exist
    try { await db.run('ALTER TABLE students ADD COLUMN parentId TEXT'); } catch(e) {}
    try { await db.run('ALTER TABLE students ADD COLUMN totalPoints INTEGER DEFAULT 0'); } catch(e) {}
    try { await db.run('ALTER TABLE students ADD COLUMN badges TEXT'); } catch(e) {}
    // Migration: Add username/password columns (WITHOUT UNIQUE - SQLite can't ALTER TABLE ADD COLUMN UNIQUE)
    try { await db.run('ALTER TABLE students ADD COLUMN username TEXT'); } catch(e) {}
    try { await db.run('ALTER TABLE students ADD COLUMN password TEXT'); } catch(e) {}
    try { await db.run('ALTER TABLE teachers ADD COLUMN username TEXT'); } catch(e) {}
    try { await db.run('ALTER TABLE teachers ADD COLUMN password TEXT'); } catch(e) {}
    try { await db.run('ALTER TABLE parents ADD COLUMN username TEXT'); } catch(e) {}
    try { await db.run('ALTER TABLE parents ADD COLUMN password TEXT'); } catch(e) {}

    // Now add UNIQUE indexes separately (safe to run multiple times thanks to IF NOT EXISTS)
    try { await db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_students_username ON students(username) WHERE username IS NOT NULL'); } catch(e) {}
    try { await db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_teachers_username ON teachers(username) WHERE username IS NOT NULL'); } catch(e) {}
    try { await db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_parents_username ON parents(username) WHERE username IS NOT NULL'); } catch(e) {}

    try { await db.exec("ALTER TABLE enrollments ADD COLUMN isFrozen INTEGER DEFAULT 0"); } catch (e) { }
    try { await db.exec("ALTER TABLE enrollments ADD COLUMN frozenReason TEXT"); } catch (e) { }
    try { await db.run('ALTER TABLE enrollments ADD COLUMN teacherId TEXT'); } catch(e) {}
    try { await db.run('ALTER TABLE sessions ADD COLUMN teacherId TEXT'); } catch(e) {}
    try { await db.run('ALTER TABLE teacher_invoices ADD COLUMN teacherId TEXT'); } catch(e) {}
    try { await db.run('ALTER TABLE sessions ADD COLUMN teacherPrice INTEGER DEFAULT 0'); } catch(e) {}

    // Auto-populate ALL user credentials (Students, Teachers, Parents) in one safe block
    console.log('Verifying all user credentials...');
    try {
        const bcrypt = require('bcrypt');
        const defaultHashed = await bcrypt.hash('123456', 10);

        // Helper: generate a unique username, checking for collisions
        const makeUnique = async (table, base, id) => {
            let candidate = base;
            const exists = await db.get(`SELECT id FROM ${table} WHERE username = ? AND id != ?`, [candidate, id]);
            if (exists) candidate = candidate + '_' + Math.floor(Math.random() * 9000 + 1000);
            return candidate;
        };

        // 1. Parents
        const parents = await db.all("SELECT id, name, username, password, phone FROM parents");
        for (const p of parents) {
            if (!p.username || p.username.trim() === '') {
                let base = (p.phone && p.phone.trim() !== '') ? p.phone.trim() : 'parent_' + p.id.slice(-4);
                const uname = await makeUnique('parents', base, p.id);
                await db.run("UPDATE parents SET username = ? WHERE id = ?", [uname, p.id]);
            }
            if (!p.password || !p.password.startsWith('$2b$')) {
                await db.run("UPDATE parents SET password = ? WHERE id = ?", [defaultHashed, p.id]);
            }
        }

        // 2. Students
        const students = await db.all("SELECT id, username, password, studentPhone, parentPhone FROM students");
        for (const s of students) {
            if (!s.username || s.username.trim() === '') {
                let base = (s.studentPhone && s.studentPhone.trim() !== '') 
                    ? s.studentPhone.trim() 
                    : (s.parentPhone && s.parentPhone.trim() !== '' ? s.parentPhone.trim() + '_' + s.id.slice(-3) : s.id);
                const uname = await makeUnique('students', base, s.id);
                await db.run("UPDATE students SET username = ? WHERE id = ?", [uname, s.id]);
            }
            if (!s.password || !s.password.startsWith('$2b$')) {
                await db.run("UPDATE students SET password = ? WHERE id = ?", [defaultHashed, s.id]);
            }
        }

        // 3. Teachers
        const teachers = await db.all("SELECT id, name, username, password, phone1 FROM teachers");
        for (const t of teachers) {
            if (!t.username || t.username.trim() === '') {
                let base = (t.phone1 && t.phone1.trim() !== '') ? t.phone1.trim() : 'teacher_' + t.id.slice(-4);
                const uname = await makeUnique('teachers', base, t.id);
                await db.run("UPDATE teachers SET username = ? WHERE id = ?", [uname, t.id]);
            }
            if (!t.password || !t.password.startsWith('$2b$')) {
                await db.run("UPDATE teachers SET password = ? WHERE id = ?", [defaultHashed, t.id]);
            }
        }

        console.log('All user credentials verified and hashed.');
    } catch (e) {
        console.warn('Could not auto-populate user credentials:', e.message);
    }

    console.log('Database setup complete.');
}

module.exports = { setupDatabase };
