const request = require('supertest');
const app = require('../src/server');

describe('Report Review & Correction Workflow Lifecycle Tests', () => {
  let managerToken;
  let elenaToken;
  let testProjectId;
  let reportId;

  beforeAll(async () => {
    // Login as Manager
    const managerRes = await request(app).post('/api/auth/login').send({
      email: 'manager@example.com',
      password: 'Password123!'
    });
    managerToken = managerRes.body.data.token;

    // Login as Elena (who has no week 36 report initially)
    const elenaRes = await request(app).post('/api/auth/login').send({
      email: 'elena@example.com',
      password: 'Password123!'
    });
    elenaToken = elenaRes.body.data.token;

    // Get a project id
    const projRes = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${elenaToken}`);
    testProjectId = projRes.body.data[0].id;

    // Clean up test report if exists
    const prisma = require('../src/config/prisma');
    await prisma.report.deleteMany({
      where: { weekNumber: 42, year: 2026 }
    });
  });

  afterAll(async () => {
    const prisma = require('../src/config/prisma');
    await prisma.report.deleteMany({
      where: { weekNumber: 42, year: 2026 }
    });
    await prisma.$disconnect();
  });

  test('Step 1: Elena creates a new report draft', async () => {
    const res = await request(app)
      .post('/api/reports/draft')
      .set('Authorization', `Bearer ${elenaToken}`)
      .send({
        projectId: testProjectId,
        weekNumber: 42,
        year: 2026,
        tasks: [
          {
            name: 'Create design system tokens',
            priority: 'High',
            plannedPercent: 100,
            actualPercent: 80,
            status: 'In Progress',
            timePlannedHours: 15,
            timeSpentHours: 14,
            outputDeliverable: 'Design token schema in Figma'
          }
        ],
        tasksPlannedNextWeek: ['Publish token documentation'],
        blockers: [{ id: 'b1', text: 'Color contrast guidelines pending audit', isKey: true }],
        achievements: [{ id: 'a1', text: 'Completed icon set', isKey: true }],
        hoursBreakdown: { development: 10, testing: 4, meetings: 2 }
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('Draft');
    reportId = res.body.data.id;
  });

  test('Step 2: Elena submits the report for manager review', async () => {
    const res = await request(app)
      .post(`/api/reports/${reportId}/submit`)
      .set('Authorization', `Bearer ${elenaToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('Submitted');
    expect(res.body.data.versions.length).toBeGreaterThanOrEqual(1);
  });

  test('Step 3: Manager reviews and requests changes with comment', async () => {
    const res = await request(app)
      .post(`/api/reports/${reportId}/review`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        action: 'REQUEST_CHANGES',
        comment: 'Elena, please update the actual deliverable link and clarify the blocker resolution timeline.'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('Needs Correction');
  });

  test('Step 4: Elena updates report and resubmits for second review', async () => {
    // Elena updates content
    const editRes = await request(app)
      .post('/api/reports/draft')
      .set('Authorization', `Bearer ${elenaToken}`)
      .send({
        id: reportId,
        projectId: testProjectId,
        tasks: [
          {
            name: 'Create design system tokens',
            priority: 'High',
            plannedPercent: 100,
            actualPercent: 100,
            status: 'Completed',
            timePlannedHours: 15,
            timeSpentHours: 15,
            outputDeliverable: 'Figma token repository v1.0 published'
          }
        ],
        notes: 'Updated deliverables and resolved contrast blockers.'
      });

    expect(editRes.statusCode).toBe(200);

    // Elena resubmits
    const submitRes = await request(app)
      .post(`/api/reports/${reportId}/submit`)
      .set('Authorization', `Bearer ${elenaToken}`);

    expect(submitRes.statusCode).toBe(200);
    expect(submitRes.body.data.status).toBe('Submitted');
  });

  test('Step 5: Manager approves the updated report', async () => {
    const res = await request(app)
      .post(`/api/reports/${reportId}/review`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        action: 'APPROVE',
        comment: 'Looks complete and well documented. Approved!'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('Approved');
  });

  test('Step 6: Verify version history preserves all versions and linked comments', async () => {
    const res = await request(app)
      .get(`/api/reports/${reportId}/versions`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(2); // Version 1 and Version 2 preserved!
    // Version 1 should have the REQUESTED_CHANGES comment linked
    const v1 = res.body.data.find((v) => v.versionNumber === 1);
    expect(v1).toBeDefined();
    expect(v1.reviewComment).toBeDefined();
    expect(v1.reviewComment.action).toBe('REQUEST_CHANGES');
  });
});
