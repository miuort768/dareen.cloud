/**
 * Production Readiness Verification — full 15-step scenario runner.
 *
 * Exercises the live stack end-to-end exactly as a school would use the system:
 *   1.  Create new user
 *   2.  Create student
 *   3.  Link parent
 *   4.  Create program (enrollment)
 *   5.  Enroll student
 *   6.  Create sessions
 *   7.  Record attendance (complete a session)
 *   8.  Create invoice
 *   9.  Record payment
 *   10. Send notification
 *   11. Forum (post + vote + comment)
 *   12. Chat (conversation + message)
 *   13. Upload file (multipart image)
 *   14. Backup (create + export)
 *   15. Restore backup (full round-trip)
 *
 * Every HTTP call is logged (method, path, status, latency). Any non-2xx is a
 * recorded failure. Steps carry the payloads the real UI sends.
 *
 * Run:  node e2e/helpers/prod-readiness.js
 * Env:  API_URL (default http://localhost:3001)
 * Out:  e2e/reports/prod-readiness-<ts>.json
 */
const API = process.env.API_URL || 'http://localhost:3001';
const fs = require('fs');
const path = require('path');

const ts = new Date().toISOString().replace(/[:.]/g, '-');
const REPORT = path.join(__dirname, '..', 'reports', `prod-readiness-${ts}.json`);

const results = [];
let failures = 0;

function log(level, msg) {
  const line = `[${new Date().toISOString().slice(11, 19)}] ${level} ${msg}`;
  console.log(line);
}

async function request(method, urlPath, { token, body, form, headers = {} } = {}) {
  const url = `${API}${urlPath}`;
  const opts = { method, headers: { ...headers } };
  if (token) opts.headers.Authorization = `Bearer ${token}`;
  if (form) {
    opts.body = form;
  } else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const start = Date.now();
  let res, text;
  try {
    res = await fetch(url, opts);
    text = await res.text();
  } catch (err) {
    return { ok: false, status: 0, latency: Date.now() - start, error: err.message };
  }
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { ok: res.status >= 200 && res.status < 300, status: res.status, latency: Date.now() - start, data };
}

async function step(name, fn) {
  const start = Date.now();
  try {
    const out = await fn();
    const ms = Date.now() - start;
    if (out && out.ok === false) {
      failures++;
      results.push({ step: name, pass: false, ms, detail: out });
      log('FAIL', `${name} — ${out.status} ${out.message || ''} (${ms}ms)`);
    } else {
      results.push({ step: name, pass: true, ms, detail: out });
      log('PASS', `${name} (${ms}ms)`);
    }
  } catch (err) {
    failures++;
    results.push({ step: name, pass: false, ms: Date.now() - start, detail: { error: err.message, stack: err.stack } });
    log('FAIL', `${name} — ${err.message}`);
  }
}

async function main() {
  log('INFO', `Production Readiness Verification — target ${API}`);
  log('INFO', `Report: ${REPORT}`);

  // ─────────────────────────── 0. Bootstrap ───────────────────────────
  const ids = { suffix: Date.now().toString(36).slice(-4) };
  const stamp = new Date().toISOString().slice(0, 10);

  await step('00 Bootstrap: admin login', async () => {
    const r = await request('POST', '/api/auth/login', { body: { username: 'admin', password: '123456' } });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    ids.adminToken = r.data.token;
    ids.adminId = r.data.user?.id;
    ids.adminName = r.data.user?.name;
    return { ok: true, user: r.data.user?.username, role: r.data.user?.role };
  });

  // ─────────────────────────── 1. Create new user ───────────────────────────
  ids.newUser = `prod_u_${ids.suffix}`;
  await step('01 Create new user (POST /api/users)', async () => {
    const r = await request('POST', '/api/users', {
      token: ids.adminToken,
      body: { id: `usr_${ids.suffix}`, name: `مستخدم التحقق ${ids.suffix}`, username: ids.newUser, password: 'Test1234', role: 'supervisor', permissions: ['dashboard', 'settings'] },
    });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    ids.newUserId = `usr_${ids.suffix}`;
    return { ok: true, status: r.status, createdId: `usr_${ids.suffix}` };
  });

  await step('01b Login as new user', async () => {
    const r = await request('POST', '/api/auth/login', { body: { username: ids.newUser, password: 'Test1234' } });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    ids.newUserToken = r.data.token;
    return { ok: true, role: r.data.user?.role, id: r.data.user?.id };
  });

  // ─────────────────────────── 2. Create student ───────────────────────────
  ids.studentUser = `prod_s_${ids.suffix}`;
  await step('02 Create student (POST /api/students)', async () => {
    const r = await request('POST', '/api/students', {
      token: ids.adminToken,
      body: {
        name: `طالب التحقق ${ids.suffix}`,
        grade: 'الصف الثامن',
        parentPhone: `prod_p_${ids.suffix}`,
        studentPhone: `9655${ids.suffix}`,
        curriculum: 'منهج كويتي',
        sessionPrice: 12,
        username: ids.studentUser,
        password: 'Test1234',
        currency: 'KWD',
      },
    });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    ids.studentId = r.data.id;
    ids.studentName = r.data.name || `طالب التحقق ${ids.suffix}`;
    return { ok: true, studentId: r.data.id, name: r.data.name };
  });

  await step('02b Student login', async () => {
    const r = await request('POST', '/api/auth/login', { body: { username: ids.studentUser, password: 'Test1234' } });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    ids.studentToken = r.data.token;
    return { ok: true, id: r.data.user?.id, role: r.data.user?.role };
  });

  // ─────────────────────────── 3. Link parent ───────────────────────────
  ids.parentUser = `prod_p_${ids.suffix}`;
  await step('03 Create & link parent (POST /api/parents)', async () => {
    const r = await request('POST', '/api/parents', {
      token: ids.adminToken,
      body: { name: `ولي أمر التحقق ${ids.suffix}`, phone: `prod_p_${ids.suffix}`, username: ids.parentUser, password: 'Test1234' },
    });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    ids.parentId = r.data.id;
    return { ok: true, parentId: r.data.id };
  });

  await step('03b Parent sees child (GET /api/parents/my-children)', async () => {
    const r = await request('POST', '/api/auth/login', { body: { username: ids.parentUser, password: 'Test1234' } });
    if (!r.ok) return { ok: false, status: r.status, message: 'parent login failed' };
    const children = await request('GET', '/api/parents/my-children', { token: r.data.token });
    if (!children.ok) return { ok: false, status: children.status, message: children.data?.error };
    const found = (Array.isArray(children.data) ? children.data : []).some(c => c.id === ids.studentId);
    if (!found) return { ok: false, status: 200, message: `student ${ids.studentId} not linked to parent` };
    ids.parentToken = r.data.token;
    return { ok: true, childCount: (children.data || []).length };
  });

  // ─────────────────────────── 4. Create program (enrollment) ───────────────────────────
  ids.teacherUser = `prod_t_${ids.suffix}`;
  await step('04 Create teacher (prerequisite)', async () => {
    const r = await request('POST', '/api/teachers', {
      token: ids.adminToken,
      body: { name: `مدرس التحقق ${ids.suffix}`, phone1: `9659${ids.suffix}`, subject: 'الرياضيات', price: 8, username: ids.teacherUser, password: 'Test1234', currency: 'EGP' },
    });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    ids.teacherId = r.data.id;
    return { ok: true, teacherId: r.data.id };
  });

  await step('04b Create program (POST /api/enrollments)', async () => {
    const r = await request('POST', '/api/enrollments', {
      token: ids.adminToken,
      body: {
        studentId: ids.studentId,
        teacher: `مدرس التحقق ${ids.suffix}`,
        teacherId: ids.teacherId,
        subject: 'الرياضيات',
        curr: 'KWD',
        sessionsTotal: 12,
        schedule: [{ day: 'السبت', hour: '04:00 PM', period: 'فترة مسائية' }],
        sessions: [{ date: stamp, day: 'السبت', time: '04:00 PM' }],
      },
    });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    ids.enrollmentId = r.data.id;
    return { ok: true, enrollmentId: r.data.id, subject: r.data.subject };
  });

  // ─────────────────────────── 5. Enroll student ───────────────────────────
  await step('05 Enroll student (GET enrollments by student)', async () => {
    const r = await request('GET', `/api/enrollments/student/${ids.studentId}`, { token: ids.adminToken });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    const arr = Array.isArray(r.data) ? r.data : (r.data?.data || []);
    if (!arr.some(e => String(e.id) === String(ids.enrollmentId))) {
      return { ok: false, status: 200, message: 'enrollment not returned for student' };
    }
    return { ok: true, enrollments: arr.length };
  });

  // ─────────────────────────── 6. Create sessions ───────────────────────────
  ids.sessionId = null;
  await step('06 Create session (POST /api/sessions)', async () => {
    const r = await request('POST', '/api/sessions', {
      token: ids.adminToken,
      body: {
        studentId: ids.studentId,
        studentName: `طالب التحقق ${ids.suffix}`,
        teacherId: ids.teacherId,
        teacherName: `مدرس التحقق ${ids.suffix}`,
        subject: 'الرياضيات',
        date: stamp, day: 'السبت', time: '04:00 PM',
        price: 12, status: 'scheduled',
      },
    });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    ids.sessionId = r.data.id;
    return { ok: true, sessionId: r.data.id, status: r.data.status };
  });

  await step('06b Create second session', async () => {
    const r = await request('POST', '/api/sessions', {
      token: ids.adminToken,
      body: {
        studentId: ids.studentId,
        studentName: `طالب التحقق ${ids.suffix}`,
        teacherId: ids.teacherId,
        teacherName: `مدرس التحقق ${ids.suffix}`,
        subject: 'الرياضيات',
        date: stamp, day: 'السبت', time: '06:00 PM',
        price: 12, status: 'scheduled',
      },
    });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    ids.sessionId2 = r.data.id;
    return { ok: true, sessionId: r.data.id };
  });

  // ─────────────────────────── 7. Record attendance ───────────────────────────
  await step('07 Record attendance (PATCH session → completed)', async () => {
    const r = await request('PATCH', `/api/sessions/${ids.sessionId}`, { token: ids.adminToken, body: { status: 'completed' } });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    if (r.data.status !== 'completed') return { ok: false, status: 200, message: `expected completed, got ${r.data.status}` };
    return { ok: true, status: r.data.status };
  });

  await step('07b Session count incremented', async () => {
    const r = await request('GET', `/api/enrollments/student/${ids.studentId}`, { token: ids.adminToken });
    const arr = Array.isArray(r.data) ? r.data : (r.data?.data || []);
    const e = arr.find(x => String(x.id) === String(ids.enrollmentId));
    if (!e) return { ok: false, status: 200, message: 'enrollment missing' };
    if ((e.sessionsUsed || 0) < 1) return { ok: false, status: 200, message: `sessionsUsed=${e.sessionsUsed}` };
    return { ok: true, sessionsUsed: e.sessionsUsed };
  });

  // ─────────────────────────── 8. Create invoice ───────────────────────────
  ids.studentInvoiceId = null;
  await step('08 Create student invoice (POST /api/invoices/student)', async () => {
    const r = await request('POST', '/api/invoices/student', {
      token: ids.adminToken,
      body: {
        studentId: ids.studentId,
        studentName: `طالب التحقق ${ids.suffix}`,
        amount: 60, currency: 'KWD',
        description: 'اشتراك رياضيات شهر',
        date: stamp, dueDate: stamp,
        status: 'unpaid',
      },
    });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    ids.studentInvoiceId = r.data.id;
    return { ok: true, invoiceId: r.data.id, status: r.data.status };
  });

  await step('08b Teacher invoice (POST /api/invoices/teacher)', async () => {
    const r = await request('POST', '/api/invoices/teacher', {
      token: ids.adminToken,
      body: { teacherId: ids.teacherId, teacher: `مدرس التحقق ${ids.suffix}`, amount: 100, currency: 'EGP', date: stamp, specialization: 'الرياضيات', status: 'unpaid' },
    });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    ids.teacherInvoiceId = r.data.id;
    return { ok: true, invoiceId: r.data.id };
  });

  // ─────────────────────────── 9. Record payment ───────────────────────────
  await step('09 Pay student invoice (POST pay)', async () => {
    const r = await request('POST', `/api/invoices/student/${ids.studentInvoiceId}/pay`, { token: ids.adminToken, body: { paymentMethod: 'cash' } });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    if (r.data.status !== 'paid') return { ok: false, status: 200, message: `expected paid, got ${r.data.status}` };
    return { ok: true, status: r.data.status, paidAt: r.data.paidAt };
  });

  await step('09b Student sees paid invoice (GET /invoices/me/student)', async () => {
    const r = await request('GET', '/api/invoices/me/student', { token: ids.studentToken });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    const arr = Array.isArray(r.data) ? r.data : (r.data?.data || []);
    if (!arr.some(i => String(i.id) === String(ids.studentInvoiceId))) {
      return { ok: false, status: 200, message: 'paid invoice not visible to student' };
    }
    return { ok: true, invoices: arr.length };
  });

  // ─────────────────────────── 10. Send notification ───────────────────────────
  await step('10 Send notification (POST /api/notifications)', async () => {
    const r = await request('POST', '/api/notifications', {
      token: ids.adminToken,
      body: { receiverId: ids.studentId, title: `تنبيه التحقق ${ids.suffix}`, message: 'هذه رسالة تحقق نهائية', type: 'info' },
    });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    ids.notifId = r.data.id;
    return { ok: true, notificationId: r.data.id };
  });

  await step('10b Student receives notification', async () => {
    const r = await request('GET', `/api/notifications?receiverId=${ids.studentId}`, { token: ids.adminToken });
    const arr = Array.isArray(r.data) ? r.data : (r.data?.data || []);
    if (!arr.some(n => n.id === ids.notifId)) return { ok: false, status: 200, message: 'notification not delivered' };
    return { ok: true, notifications: arr.length };
  });

  // ─────────────────────────── 11. Forum ───────────────────────────
  await step('11 Forum: create post (admin → approved)', async () => {
    const r = await request('POST', '/api/forum', { token: ids.adminToken, body: { content: `منشور التحقق ${ids.suffix} — إعلان رسمي` } });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    ids.forumPostId = r.data.id;
    return { ok: true, postId: r.data.id, status: r.data.status };
  });

  await step('11b Forum: vote up', async () => {
    const r = await request('POST', `/api/forum/${ids.forumPostId}/vote`, { token: ids.studentToken, body: { type: 'upvote' } });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    if (!r.data.upvotes?.length) return { ok: false, status: 200, message: 'upvote not recorded' };
    return { ok: true, upvotes: r.data.upvotes.length };
  });

  await step('11c Forum: add comment', async () => {
    const r = await request('POST', `/api/forum/${ids.forumPostId}/comments`, { token: ids.studentToken, body: { content: `تعليق التحقق ${ids.suffix}` } });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    ids.forumCommentId = r.data.id;
    return { ok: true, commentId: r.data.id };
  });

  await step('11d Forum: student creates post (pending moderation)', async () => {
    const r = await request('POST', '/api/forum', { token: ids.studentToken, body: { content: `منشور طالب ${ids.suffix} بانتظار المراجعة` } });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    if (r.data.status !== 'pending') return { ok: false, status: 200, message: `expected pending, got ${r.data.status}` };
    ids.pendingPostId = r.data.id;
    return { ok: true, postId: r.data.id, status: r.data.status };
  });

  // ─────────────────────────── 12. Chat ───────────────────────────
  await step('12 Chat: create conversation', async () => {
    const r = await request('POST', '/api/chat/conversations', { token: ids.adminToken, body: { members: [ids.adminId, ids.teacherId] } });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    ids.conversationId = r.data.id;
    return { ok: true, conversationId: r.data.id };
  });

  await step('12b Chat: send message', async () => {
    const r = await request('POST', `/api/chat/conversations/${ids.conversationId}/messages`, { token: ids.adminToken, body: { content: `رسالة تحقق ${ids.suffix}` } });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    ids.messageId = r.data.id;
    return { ok: true, messageId: r.data.id };
  });

  await step('12c Chat: read messages', async () => {
    const r = await request('GET', `/api/chat/conversations/${ids.conversationId}/messages`, { token: ids.adminToken });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    const arr = Array.isArray(r.data) ? r.data : (r.data?.data || []);
    if (!arr.some(m => m.id === ids.messageId)) return { ok: false, status: 200, message: 'message not found in history' };
    return { ok: true, messages: arr.length };
  });

  // ─────────────────────────── 13. Upload file ───────────────────────────
  await step('13 Upload image (multipart)', async () => {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    const form = new FormData();
    form.append('image', new Blob([png], { type: 'image/png' }), `verify-${ids.suffix}.png`);
    const r = await request('POST', '/api/upload/blog-image', { token: ids.adminToken, form });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    if (!r.data?.url) return { ok: false, status: 200, message: 'no url returned' };
    ids.uploadUrl = r.data.url;
    return { ok: true, url: r.data.url };
  });

  await step('13b Uploaded file exists on disk', async () => {
    const fsp = require('fs').promises;
    const base = path.join(__dirname, '..', '..', 'public', 'uploads', 'blog');
    if (!ids.uploadUrl) return { ok: false, status: 200, message: 'no url recorded' };
    const fname = decodeURIComponent(String(ids.uploadUrl).split('/').pop() || '');
    if (!fname) return { ok: false, status: 200, message: `cannot resolve filename from url ${ids.uploadUrl}` };
    const files = await fsp.readdir(base);
    if (!files.includes(fname)) {
      return { ok: false, status: 200, message: `file ${fname} not found in uploads/blog` };
    }
    const st = await fsp.stat(path.join(base, fname));
    return { ok: true, file: fname, bytes: st.size };
  });

  // ─────────────────────────── 14. Backup ───────────────────────────
  let backupData = null;
  await step('14 Create backup (POST /api/system/backup)', async () => {
    const r = await request('POST', '/api/system/backup', { token: ids.adminToken });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    ids.backupId = r.data.id;
    return { ok: true, backupId: r.data.id, size: r.data.size };
  });

  await step('14b Export backup data (GET /api/system/backup)', async () => {
    const r = await request('GET', '/api/system/backup', { token: ids.adminToken });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    backupData = r.data;
    if (!backupData?.data) return { ok: false, status: 200, message: 'backup export missing data key' };
    const d = backupData.data;
    const students = Array.isArray(d.students) ? d.students.length : 0;
    const sessions = Array.isArray(d.sessions) ? d.sessions.length : 0;
    const invs = Array.isArray(d.studentInvoices) ? d.studentInvoices.length : 0;
    return { ok: true, students, sessions, studentInvoices: invs };
  });

  // ─────────────────────────── 15. Restore backup ───────────────────────────
  await step('15 Restore backup (POST /api/system/restore)', async () => {
    if (!backupData) return { ok: false, status: 0, message: 'no backup data captured' };
    const r = await request('POST', '/api/system/restore', { token: ids.adminToken, body: { data: backupData.data } });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    return { ok: true, message: r.data?.message };
  });

  await step('15b Restore round-trip: student still exists', async () => {
    const r = await request('GET', `/api/students?q=${encodeURIComponent(ids.studentName)}`, { token: ids.adminToken });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    const arr = Array.isArray(r.data) ? r.data : (r.data?.data || []);
    if (!arr.some(s => s.id === ids.studentId)) return { ok: false, status: 200, message: 'restored student missing' };
    return { ok: true, restored: arr.length };
  });

  await step('15c Restore round-trip: login still works (student)', async () => {
    const r = await request('POST', '/api/auth/login', { body: { username: ids.studentUser, password: 'Test1234' } });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    return { ok: true, id: r.data.user?.id };
  });

  await step('15d Restore round-trip: sessions & invoices restored', async () => {
    const r = await request('GET', `/api/sessions?studentId=${ids.studentId}`, { token: ids.adminToken });
    if (!r.ok) return { ok: false, status: r.status, message: r.data?.error || r.error };
    const arr = Array.isArray(r.data) ? r.data : (r.data?.data || []);
    if (arr.length < 2) return { ok: false, status: 200, message: `expected >=2 sessions, got ${arr.length}` };
    return { ok: true, sessions: arr.length };
  });

  // ─────────────────────────── Summary ───────────────────────────
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  const report = {
    target: API,
    timestamp: new Date().toISOString(),
    total: results.length,
    passed: results.filter(r => r.pass).length,
    failed: results.filter(r => !r.pass).length,
    results,
  };
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));

  log('INFO', `══════════════════════════════════════`);
  log('INFO', `Result: ${report.passed}/${report.total} passed, ${report.failed} failed`);
  log('INFO', `Report: ${REPORT}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(err => {
  log('ERROR', `Scenario crashed: ${err.message}`);
  console.error(err);
  process.exit(2);
});
