const request = require('supertest');
const app = require('../src/server');

describe('Role-Based Access Control (RBAC) Tests', () => {
  let adminToken;
  let managerToken;
  let alexToken;
  let sarahToken;
  let alexReportId;

  beforeAll(async () => {
    // Login as Admin
    const adminRes = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'Password123!'
    });
    adminToken = adminRes.body.data.token;

    // Login as Manager
    const managerRes = await request(app).post('/api/auth/login').send({
      email: 'manager@example.com',
      password: 'Password123!'
    });
    managerToken = managerRes.body.data.token;

    // Login as Alex (Team Member)
    const alexRes = await request(app).post('/api/auth/login').send({
      email: 'alex@example.com',
      password: 'Password123!'
    });
    alexToken = alexRes.body.data.token;

    // Login as Sarah (Team Member)
    const sarahRes = await request(app).post('/api/auth/login').send({
      email: 'sarah@example.com',
      password: 'Password123!'
    });
    sarahToken = sarahRes.body.data.token;

    // Fetch Alex's report
    const alexReportsRes = await request(app)
      .get('/api/reports')
      .set('Authorization', `Bearer ${alexToken}`);
    alexReportId = alexReportsRes.body.data[0].id;
  });

  test('1. Unauthenticated requests are rejected (401)', async () => {
    const res = await request(app).get('/api/reports');
    expect(res.statusCode).toBe(401);
  });

  test('2. Team member CANNOT access Admin-only user management endpoint (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${alexToken}`);
    expect(res.statusCode).toBe(403);
  });

  test('3. Team member CANNOT access Manager-only analytics dashboard (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${alexToken}`);
    expect(res.statusCode).toBe(403);
  });

  test('4. Team member CANNOT review or approve another report (403 Forbidden)', async () => {
    const res = await request(app)
      .post(`/api/reports/${alexReportId}/review`)
      .set('Authorization', `Bearer ${alexToken}`)
      .send({ action: 'APPROVE' });
    expect(res.statusCode).toBe(403);
  });

  test('5. Team member CANNOT view another member\'s report (403 Forbidden)', async () => {
    // Sarah tries to view Alex's report
    const res = await request(app)
      .get(`/api/reports/${alexReportId}`)
      .set('Authorization', `Bearer ${sarahToken}`);
    expect(res.statusCode).toBe(403);
  });

  test('6. Manager CAN view team member report (200 OK)', async () => {
    const res = await request(app)
      .get(`/api/reports/${alexReportId}`)
      .set('Authorization', `Bearer ${managerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(alexReportId);
  });

  test('7. Admin CAN access user management (200 OK)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
