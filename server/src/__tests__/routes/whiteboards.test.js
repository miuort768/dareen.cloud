import { describe, it, expect, beforeAll, afterAll } from 'vitest';
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { prisma } = require('../../../utils/prisma');
const { whiteboardRouter } = require('../../../routes/education/whiteboards');
const express = require('express');

describe('Whiteboard API integration', () => {
  let app;
  let teacherToken;
  let otherTeacherToken;
  let studentToken;
  let teacher1Id;
  let teacher2Id;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret_key_123';

    // Create test teachers
    const t1 = await prisma.teacher.create({
      data: {
        name: 'معلمة الرياضيات أ',
        username: 'teacher_math_test1',
        phone1: '01011112222',
      },
    });
    teacher1Id = t1.id;

    const t2 = await prisma.teacher.create({
      data: {
        name: 'معلمة العلوم ب',
        username: 'teacher_science_test2',
        phone1: '01011113333',
      },
    });
    teacher2Id = t2.id;

    teacherToken = jwt.sign({ id: teacher1Id, role: 'teacher', name: t1.name }, process.env.JWT_SECRET);
    otherTeacherToken = jwt.sign({ id: teacher2Id, role: 'teacher', name: t2.name }, process.env.JWT_SECRET);
    studentToken = jwt.sign({ id: 'student_123', role: 'student', name: 'طالب تجريبي' }, process.env.JWT_SECRET);

    app = express();
    app.use(express.json({ limit: '15mb' }));
    app.use('/whiteboards', whiteboardRouter);
  });

  afterAll(async () => {
    try {
      await prisma.teacherWhiteboard.deleteMany({
        where: { teacherId: { in: [teacher1Id, teacher2Id] } },
      });
      await prisma.teacher.deleteMany({
        where: { id: { in: [teacher1Id, teacher2Id] } },
      });
    } catch (e) {
      // ignore teardown errors
    }
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/whiteboards');
    expect(res.status).toBe(401);
  });

  it('rejects student role with 403', async () => {
    const res = await request(app)
      .get('/whiteboards')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  it('allows teacher to create a whiteboard and retrieves it', async () => {
    const postRes = await request(app)
      .post('/whiteboards')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'درس الجبر والهندسة',
        pagesData: [{ id: 'p1', background: 'grid', elements: [] }],
      });

    expect(postRes.status).toBe(201);
    expect(postRes.body.id).toBeDefined();
    expect(postRes.body.title).toBe('درس الجبر والهندسة');

    const createdId = postRes.body.id;

    // Get list
    const listRes = await request(app)
      .get('/whiteboards')
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.some((b) => b.id === createdId)).toBe(true);

    // Get detail
    const detailRes = await request(app)
      .get(`/whiteboards/${createdId}`)
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.title).toBe('درس الجبر والهندسة');

    // Isolation: other teacher cannot view or edit
    const otherRes = await request(app)
      .get(`/whiteboards/${createdId}`)
      .set('Authorization', `Bearer ${otherTeacherToken}`);
    expect(otherRes.status).toBe(403);

    // Update whiteboard
    const putRes = await request(app)
      .put(`/whiteboards/${createdId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'درس الجبر المتقدم',
      });
    expect(putRes.status).toBe(200);
    expect(putRes.body.title).toBe('درس الجبر المتقدم');

    // Duplicate whiteboard
    const dupRes = await request(app)
      .post(`/whiteboards/${createdId}/duplicate`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(dupRes.status).toBe(201);
    expect(dupRes.body.title).toBe('درس الجبر المتقدم (نسخة)');

    // Delete both
    const del1 = await request(app)
      .delete(`/whiteboards/${createdId}`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(del1.status).toBe(200);

    const del2 = await request(app)
      .delete(`/whiteboards/${dupRes.body.id}`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(del2.status).toBe(200);
  });
});
