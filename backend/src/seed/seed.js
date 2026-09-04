require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { getWeekNumber, getDateRangeForWeek } = require('../utils/dateUtils');

async function seed() {
  console.log('🌱 Starting comprehensive database seed for Weekly Report System...');

  // Clean existing tables in reverse dependency order
  await prisma.reportVersion.deleteMany();
  await prisma.reviewComment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.report.deleteMany();
  await prisma.userProject.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Users
  console.log('Creating users with roles (Admin, Manager, Team Members)...');
  const admin = await prisma.user.create({
    data: {
      name: 'Victoria Vance (Admin)',
      email: 'admin@example.com',
      password: passwordHash,
      role: 'ADMIN',
      department: 'Executive / Engineering Leadership'
    }
  });

  const manager = await prisma.user.create({
    data: {
      name: 'David Miller (Manager)',
      email: 'manager@example.com',
      password: passwordHash,
      role: 'MANAGER',
      department: 'Software Engineering'
    }
  });

  const alex = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex@example.com',
      password: passwordHash,
      role: 'TEAM_MEMBER',
      department: 'Frontend Development'
    }
  });

  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      password: passwordHash,
      role: 'TEAM_MEMBER',
      department: 'Backend & Cloud Infrastructure'
    }
  });

  const marcus = await prisma.user.create({
    data: {
      name: 'Marcus Johnson',
      email: 'marcus@example.com',
      password: passwordHash,
      role: 'TEAM_MEMBER',
      department: 'Quality Assurance & Automation'
    }
  });

  const elena = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena@example.com',
      password: passwordHash,
      role: 'TEAM_MEMBER',
      department: 'UI/UX Design & Product'
    }
  });

  // 2. Create Projects / Work Categories
  console.log('Creating projects/categories...');
  const projClientA = await prisma.project.create({
    data: {
      name: 'Client A - Fintech Portal',
      code: 'CLIENT-A',
      description: 'Enterprise banking portal modernization and secure transaction processing.',
      color: '#3b82f6',
      status: 'Active'
    }
  });

  const projTooling = await prisma.project.create({
    data: {
      name: 'Internal Developer Tooling',
      code: 'DEV-TOOLS',
      description: 'Developer productivity tools, CI/CD telemetry, and container automation.',
      color: '#10b981',
      status: 'Active'
    }
  });

  const projRnD = await prisma.project.create({
    data: {
      name: 'AI R&D Core Engine',
      code: 'AI-RND',
      description: 'Retrieval Augmented Generation research and fine-tuning for workflow automation.',
      color: '#8b5cf6',
      status: 'Active'
    }
  });

  const projMarketing = await prisma.project.create({
    data: {
      name: 'Growth & Marketing App',
      code: 'GROWTH',
      description: 'Public marketing website, lead conversion funnels, and analytics.',
      color: '#f59e0b',
      status: 'Active'
    }
  });

  // Link Members to Projects
  await prisma.userProject.createMany({
    data: [
      { userId: alex.id, projectId: projClientA.id },
      { userId: alex.id, projectId: projTooling.id },
      { userId: sarah.id, projectId: projClientA.id },
      { userId: sarah.id, projectId: projRnD.id },
      { userId: marcus.id, projectId: projClientA.id },
      { userId: marcus.id, projectId: projTooling.id },
      { userId: elena.id, projectId: projMarketing.id }
    ]
  });

  // Helper date calculations: current week, previous week (Week - 1), two weeks ago (Week - 2)
  const currentWeekInfo = getWeekNumber(new Date());
  const wCur = currentWeekInfo.weekNumber;
  const yCur = currentWeekInfo.year;
  const wPrev = wCur > 1 ? wCur - 1 : 52;
  const yPrev = wCur > 1 ? yCur : yCur - 1;
  const wTwoAgo = wCur > 2 ? wCur - 2 : 51;
  const yTwoAgo = wCur > 2 ? yCur : yCur - 1;

  console.log(`Generating multi-week reports across Weeks: ${wTwoAgo}, ${wPrev}, and current Week ${wCur}...`);

  // --- REPORT 1: Alex Rivera, Two Weeks Ago (Approved) ---
  const rangeTwoAgo = getDateRangeForWeek(wTwoAgo, yTwoAgo);
  const rep1 = await prisma.report.create({
    data: {
      userId: alex.id,
      projectId: projClientA.id,
      weekNumber: wTwoAgo,
      year: yTwoAgo,
      startDate: rangeTwoAgo.startDate,
      endDate: rangeTwoAgo.endDate,
      dueDate: rangeTwoAgo.dueDate,
      status: 'Approved',
      isLate: false,
      submittedAt: new Date(rangeTwoAgo.startDate.getTime() + 4 * 86400000 + 14 * 3600000), // Friday 14:00 (on-time)
      approvedAt: new Date(rangeTwoAgo.startDate.getTime() + 4 * 86400000 + 17 * 3600000),
      tasksPlannedNextWeek: JSON.stringify(['Implement OAuth2 login flow', 'Refactor state store']),
      blockers: JSON.stringify([{ id: 'b1', text: 'Waiting for staging API token from client', isKey: false }]),
      achievements: JSON.stringify([{ id: 'a1', text: 'Zero regression defects on dashboard release', isKey: true }]),
      hoursBreakdown: JSON.stringify({ development: 26, testing: 6, meetings: 4, documentation: 2, devops: 2, other: 0 }),
      notes: 'Smooth iteration with no major showstoppers.',
      links: 'https://github.com/org/client-a/pull/104'
    }
  });

  await prisma.task.createMany({
    data: [
      {
        reportId: rep1.id,
        name: 'Design high-converting landing dashboard layout',
        priority: 'High',
        plannedPercent: 100,
        actualPercent: 100,
        status: 'Completed',
        timePlannedHours: 18,
        timeSpentHours: 16,
        outputDeliverable: 'Figma to React responsive template shipped to staging'
      },
      {
        reportId: rep1.id,
        name: 'Fix hydration mismatches in Next.js SSR',
        priority: 'Medium',
        plannedPercent: 100,
        actualPercent: 100,
        status: 'Completed',
        timePlannedHours: 8,
        timeSpentHours: 10,
        outputDeliverable: 'PR #104 merged into main'
      }
    ]
  });

  const rep1Comment = await prisma.reviewComment.create({
    data: {
      reportId: rep1.id,
      authorId: manager.id,
      action: 'APPROVED',
      comment: 'Excellent delivery and crisp documentation Alex!',
      versionNumber: 1,
      createdAt: rep1.approvedAt
    }
  });

  await prisma.reportVersion.create({
    data: {
      reportId: rep1.id,
      versionNumber: 1,
      submittedAt: rep1.submittedAt,
      submittedById: alex.id,
      snapshot: JSON.stringify({
        weekNumber: wTwoAgo,
        year: yTwoAgo,
        projectName: 'Client A - Fintech Portal',
        tasks: ['Design high-converting landing dashboard layout', 'Fix hydration mismatches in Next.js SSR'],
        notes: 'Smooth iteration with no major showstoppers.'
      }),
      reviewCommentId: rep1Comment.id,
      statusAtSnapshot: 'Approved'
    }
  });

  // --- REPORT 2: Sarah Chen, Previous Week (Approved) ---
  const rangePrev = getDateRangeForWeek(wPrev, yPrev);
  const rep2 = await prisma.report.create({
    data: {
      userId: sarah.id,
      projectId: projRnD.id,
      weekNumber: wPrev,
      year: yPrev,
      startDate: rangePrev.startDate,
      endDate: rangePrev.endDate,
      dueDate: rangePrev.dueDate,
      status: 'Approved',
      isLate: false,
      submittedAt: new Date(rangePrev.startDate.getTime() + 4 * 86400000 + 15 * 3600000),
      approvedAt: new Date(rangePrev.startDate.getTime() + 5 * 86400000 + 10 * 3600000),
      tasksPlannedNextWeek: JSON.stringify(['Implement vector similarity cache in Redis', 'Benchmark latency']),
      blockers: JSON.stringify([{ id: 'b2', text: 'CUDA driver mismatch in GPU staging cluster', isKey: true }]),
      achievements: JSON.stringify([{ id: 'a2', text: 'Reduced retrieval latency by 42% via chunk pre-indexing', isKey: true }]),
      hoursBreakdown: JSON.stringify({ development: 30, testing: 5, meetings: 3, documentation: 3, devops: 4, other: 0 }),
      notes: 'GPU cluster upgrade needed next quarter.'
    }
  });

  await prisma.task.createMany({
    data: [
      {
        reportId: rep2.id,
        name: 'Build semantic search embedding pipeline',
        priority: 'Urgent',
        plannedPercent: 100,
        actualPercent: 100,
        status: 'Completed',
        timePlannedHours: 25,
        timeSpentHours: 28,
        outputDeliverable: 'Embeddings microservice deployed with 99.8% uptime'
      }
    ]
  });

  const rep2Comment = await prisma.reviewComment.create({
    data: {
      reportId: rep2.id,
      authorId: manager.id,
      action: 'APPROVED',
      comment: 'Impressive latency improvements. Approved!',
      versionNumber: 1,
      createdAt: rep2.approvedAt
    }
  });

  await prisma.reportVersion.create({
    data: {
      reportId: rep2.id,
      versionNumber: 1,
      submittedAt: rep2.submittedAt,
      submittedById: sarah.id,
      snapshot: JSON.stringify({
        weekNumber: wPrev,
        year: yPrev,
        projectName: 'AI R&D Core Engine',
        tasks: ['Build semantic search embedding pipeline']
      }),
      reviewCommentId: rep2Comment.id,
      statusAtSnapshot: 'Approved'
    }
  });

  // --- REPORT 3: Marcus Johnson, Previous Week (Needs Correction - demonstrates review cycle and versioning!) ---
  const rep3 = await prisma.report.create({
    data: {
      userId: marcus.id,
      projectId: projClientA.id,
      weekNumber: wPrev,
      year: yPrev,
      startDate: rangePrev.startDate,
      endDate: rangePrev.endDate,
      dueDate: rangePrev.dueDate,
      status: 'Needs Correction',
      isLate: true, // Marked late submission!
      submittedAt: new Date(rangePrev.startDate.getTime() + 5 * 86400000 + 19 * 3600000), // Saturday evening (Late!)
      tasksPlannedNextWeek: JSON.stringify(['Expand Playwright end-to-end coverage for checkout']),
      blockers: JSON.stringify([{ id: 'b3', text: 'Test database migrations failing intermittently on CI runner', isKey: true }]),
      achievements: JSON.stringify([{ id: 'a3', text: 'Authored 45 unit tests for billing engine', isKey: false }]),
      hoursBreakdown: JSON.stringify({ development: 10, testing: 22, meetings: 5, documentation: 3, devops: 2, other: 0 }),
      notes: 'Submitted late due to CI runner investigation.'
    }
  });

  await prisma.task.createMany({
    data: [
      {
        reportId: rep3.id,
        name: 'Setup Cypress & Playwright integration suite',
        priority: 'High',
        plannedPercent: 100,
        actualPercent: 65,
        status: 'In Progress',
        timePlannedHours: 20,
        timeSpentHours: 22,
        outputDeliverable: 'Draft test scripts in branch feature/e2e-tests'
      }
    ]
  });

  // Manager leaves comment requesting changes on Version 1
  const rep3Comment1 = await prisma.reviewComment.create({
    data: {
      reportId: rep3.id,
      authorId: manager.id,
      action: 'REQUESTED_CHANGES',
      comment: 'Please specify the exact deliverable output produced and update the actual completion percentage for the Cypress task.',
      versionNumber: 1,
      createdAt: new Date(rangePrev.startDate.getTime() + 6 * 86400000 + 11 * 3600000)
    }
  });

  await prisma.reportVersion.create({
    data: {
      reportId: rep3.id,
      versionNumber: 1,
      submittedAt: rep3.submittedAt,
      submittedById: marcus.id,
      snapshot: JSON.stringify({
        weekNumber: wPrev,
        year: yPrev,
        projectName: 'Client A - Fintech Portal',
        tasks: [{ name: 'Setup Cypress & Playwright integration suite', actualPercent: 65 }],
        notes: 'Submitted late due to CI runner investigation.'
      }),
      reviewCommentId: rep3Comment1.id,
      statusAtSnapshot: 'Needs Correction'
    }
  });

  // --- REPORT 4: Current Week - Alex Rivera (Submitted, awaiting manager review) ---
  const rangeCur = getDateRangeForWeek(wCur, yCur);
  const rep4 = await prisma.report.create({
    data: {
      userId: alex.id,
      projectId: projClientA.id,
      weekNumber: wCur,
      year: yCur,
      startDate: rangeCur.startDate,
      endDate: rangeCur.endDate,
      dueDate: rangeCur.dueDate,
      status: 'Submitted',
      isLate: false,
      submittedAt: new Date(rangeCur.startDate.getTime() + 3 * 86400000 + 16 * 3600000), // Thursday
      tasksPlannedNextWeek: JSON.stringify(['Integrate Recharts analytics widgets', 'Optimize bundle size with code-splitting']),
      blockers: JSON.stringify([{ id: 'b4', text: 'Waiting for approved color palette for dark mode from UI team', isKey: false }]),
      achievements: JSON.stringify([{ id: 'a4', text: 'Completed report submission form with real-time field validation', isKey: true }]),
      hoursBreakdown: JSON.stringify({ development: 28, testing: 6, meetings: 4, documentation: 2, devops: 0, other: 0 }),
      notes: 'Ready for manager review.'
    }
  });

  await prisma.task.createMany({
    data: [
      {
        reportId: rep4.id,
        name: 'Implement Weekly Report Form components',
        priority: 'Urgent',
        plannedPercent: 100,
        actualPercent: 100,
        status: 'Completed',
        timePlannedHours: 16,
        timeSpentHours: 15,
        outputDeliverable: 'Interactive task table and hours breakdown widget'
      },
      {
        reportId: rep4.id,
        name: 'Build Section Comparator modal for managers',
        priority: 'High',
        plannedPercent: 100,
        actualPercent: 85,
        status: 'In Progress',
        timePlannedHours: 12,
        timeSpentHours: 13,
        outputDeliverable: 'Side-by-side blocker comparison matrix component'
      }
    ]
  });

  await prisma.reportVersion.create({
    data: {
      reportId: rep4.id,
      versionNumber: 1,
      submittedAt: rep4.submittedAt,
      submittedById: alex.id,
      snapshot: JSON.stringify({
        weekNumber: wCur,
        year: yCur,
        projectName: 'Client A - Fintech Portal',
        tasks: ['Implement Weekly Report Form components', 'Build Section Comparator modal for managers']
      }),
      statusAtSnapshot: 'Submitted'
    }
  });

  // --- REPORT 5: Current Week - Sarah Chen (Draft) ---
  const rep5 = await prisma.report.create({
    data: {
      userId: sarah.id,
      projectId: projRnD.id,
      weekNumber: wCur,
      year: yCur,
      startDate: rangeCur.startDate,
      endDate: rangeCur.endDate,
      dueDate: rangeCur.dueDate,
      status: 'Draft',
      isLate: false,
      tasksPlannedNextWeek: JSON.stringify(['Multi-threaded vector indexing worker']),
      blockers: JSON.stringify([{ id: 'b5', text: 'API rate limits on external test endpoint', isKey: true }]),
      achievements: JSON.stringify([{ id: 'a5', text: 'Drafted architecture RFC for local RAG indexing', isKey: true }]),
      hoursBreakdown: JSON.stringify({ development: 18, testing: 4, meetings: 3, documentation: 5, devops: 2, other: 0 }),
      notes: 'Still drafting current progress; will submit before Friday.'
    }
  });

  await prisma.task.createMany({
    data: [
      {
        reportId: rep5.id,
        name: 'Evaluate lightweight token embeddings model',
        priority: 'Medium',
        plannedPercent: 100,
        actualPercent: 60,
        status: 'In Progress',
        timePlannedHours: 14,
        timeSpentHours: 12,
        outputDeliverable: 'Benchmark table comparing response times'
      }
    ]
  });

  // Notice: Elena Rostova has NO report for current week, which enables the Team Dashboard to showcase the derived "Not Yet Started" status!

  console.log('✅ Seed data successfully created!');
  console.log('----------------------------------------------------');
  console.log('Demo Accounts Ready for Testing:');
  console.log('👑 Admin:       admin@example.com   / Password123!');
  console.log('👔 Manager:     manager@example.com / Password123!');
  console.log('💻 Team Member: alex@example.com    / Password123!');
  console.log('💻 Team Member: sarah@example.com   / Password123!');
  console.log('💻 Team Member: marcus@example.com  / Password123!');
  console.log('💻 Team Member: elena@example.com   / Password123!');
  console.log('----------------------------------------------------');
}

seed()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
