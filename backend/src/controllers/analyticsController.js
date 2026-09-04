const prisma = require('../config/prisma');
const { getWeekNumber } = require('../utils/dateUtils');

/**
 * Get Manager Dashboard Overview Metrics for a selected week or overall.
 * Includes all 5 statuses: Draft, Submitted, Needs Correction, Approved, Not Yet Started!
 */
const getDashboardMetrics = async (req, res, next) => {
  try {
    const currentWeekInfo = getWeekNumber(new Date());
    const weekNumber = req.query.weekNumber ? parseInt(req.query.weekNumber, 10) : currentWeekInfo.weekNumber;
    const year = req.query.year ? parseInt(req.query.year, 10) : currentWeekInfo.year;
    const projectId = req.query.projectId;

    // Fetch all active team members
    const teamMembers = await prisma.user.findMany({
      where: { role: 'TEAM_MEMBER' },
      select: { id: true, name: true, email: true, department: true, avatar: true }
    });

    // Fetch all reports for the selected week
    const reportWhere = { weekNumber, year };
    if (projectId) reportWhere.projectId = projectId;

    const reportsForWeek = await prisma.report.findMany({
      where: reportWhere,
      include: {
        user: { select: { id: true, name: true, email: true, department: true } },
        project: { select: { id: true, name: true, code: true, color: true } },
        tasks: true,
        reviewComments: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    const reportByUserMap = new Map();
    reportsForWeek.forEach((r) => reportByUserMap.set(r.userId, r));

    // Derive status for EVERY team member (Draft / Submitted / Needs Correction / Approved / Not Yet Started)
    const memberStatusOverview = teamMembers.map((member) => {
      const report = reportByUserMap.get(member.id);
      let status = 'Not Yet Started';
      let isLate = false;
      let reportId = null;
      let project = null;

      if (report) {
        status = report.status;
        isLate = report.isLate;
        reportId = report.id;
        project = report.project;
      }

      return {
        userId: member.id,
        userName: member.name,
        email: member.email,
        department: member.department,
        status,
        isLate,
        reportId,
        project
      };
    });

    // Count statistics
    const totalMembers = teamMembers.length;
    const submittedCount = reportsForWeek.filter((r) => r.status === 'Submitted' || r.status === 'Approved').length;
    const approvedCount = reportsForWeek.filter((r) => r.status === 'Approved').length;
    const needsCorrectionCount = reportsForWeek.filter((r) => r.status === 'Needs Correction').length;
    const draftCount = reportsForWeek.filter((r) => r.status === 'Draft').length;
    const notYetStartedCount = totalMembers - reportsForWeek.length;
    const lateCount = reportsForWeek.filter((r) => r.isLate).length;
    const onTimeCount = reportsForWeek.filter((r) => !r.isLate && r.status !== 'Draft').length;

    // Compliance rate: % of members who submitted on time or submitted
    const complianceRate = totalMembers > 0
      ? Math.round((submittedCount / totalMembers) * 100)
      : 100;

    // Count open blockers across team for this week
    let totalBlockers = 0;
    let keyBlockers = 0;
    reportsForWeek.forEach((r) => {
      try {
        const blockers = JSON.parse(r.blockers || '[]');
        totalBlockers += blockers.length;
        keyBlockers += blockers.filter((b) => b.isKey).length;
      } catch (e) {}
    });

    return res.status(200).json({
      success: true,
      data: {
        weekNumber,
        year,
        summary: {
          totalTeamMembers: totalMembers,
          totalReportsThisWeek: reportsForWeek.length,
          totalSubmitted: submittedCount,
          approvedCount,
          needsCorrectionCount,
          draftCount,
          notYetStartedCount,
          lateCount,
          onTimeCount,
          complianceRate,
          totalBlockers,
          keyBlockers
        },
        memberStatusOverview,
        reports: reportsForWeek
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Visual Insights & Charts Data:
 * - Tasks completed trend over time (weeks)
 * - Submission/approval status distribution by member
 * - Workload distribution by project
 * - Time spent by task type team-wide
 * - Recent activity feed
 */
const getVisualInsights = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const reportWhere = {};
    if (projectId) reportWhere.projectId = projectId;

    // 1. Fetch all reports with tasks & projects for aggregation
    const reports = await prisma.report.findMany({
      where: reportWhere,
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, color: true } },
        tasks: true
      },
      orderBy: [{ year: 'asc' }, { weekNumber: 'asc' }]
    });

    // 2. Trend: Tasks completed per week
    const weekMap = new Map();
    reports.forEach((r) => {
      const key = `W${r.weekNumber} ${r.year}`;
      if (!weekMap.has(key)) {
        weekMap.set(key, {
          week: `W${r.weekNumber}`,
          label: key,
          weekNumber: r.weekNumber,
          year: r.year,
          completedTasks: 0,
          totalTasks: 0,
          hoursLogged: 0
        });
      }
      const entry = weekMap.get(key);
      r.tasks.forEach((t) => {
        entry.totalTasks += 1;
        if (t.status === 'Completed' || t.actualPercent === 100) {
          entry.completedTasks += 1;
        }
        entry.hoursLogged += t.timeSpentHours || 0;
      });
    });
    const tasksTrend = Array.from(weekMap.values());

    // 3. Status breakdown by Team Member
    const memberMap = new Map();
    reports.forEach((r) => {
      const userName = r.user.name;
      if (!memberMap.has(userName)) {
        memberMap.set(userName, {
          name: userName,
          Approved: 0,
          Submitted: 0,
          NeedsCorrection: 0,
          Draft: 0,
          Late: 0
        });
      }
      const m = memberMap.get(userName);
      if (r.status === 'Approved') m.Approved += 1;
      else if (r.status === 'Submitted') m.Submitted += 1;
      else if (r.status === 'Needs Correction') m.NeedsCorrection += 1;
      else if (r.status === 'Draft') m.Draft += 1;
      if (r.isLate) m.Late += 1;
    });
    const memberStatusBreakdown = Array.from(memberMap.values());

    // 4. Workload distribution by Project
    const projectMap = new Map();
    reports.forEach((r) => {
      const pName = r.project.name;
      const pColor = r.project.color;
      if (!projectMap.has(pName)) {
        projectMap.set(pName, {
          name: pName,
          color: pColor,
          taskCount: 0,
          hours: 0,
          reportsCount: 0
        });
      }
      const p = projectMap.get(pName);
      p.reportsCount += 1;
      p.taskCount += r.tasks.length;
      r.tasks.forEach((t) => {
        p.hours += t.timeSpentHours || 0;
      });
    });
    const projectWorkload = Array.from(projectMap.values());

    // 5. Hours spent by Task Type team-wide
    const hoursByType = {
      Development: 0,
      Testing: 0,
      Meetings: 0,
      Documentation: 0,
      DevOps: 0,
      Other: 0
    };

    reports.forEach((r) => {
      try {
        const breakdown = JSON.parse(r.hoursBreakdown || '{}');
        hoursByType.Development += parseFloat(breakdown.development || 0);
        hoursByType.Testing += parseFloat(breakdown.testing || 0);
        hoursByType.Meetings += parseFloat(breakdown.meetings || 0);
        hoursByType.Documentation += parseFloat(breakdown.documentation || 0);
        hoursByType.DevOps += parseFloat(breakdown.devops || 0);
        hoursByType.Other += parseFloat(breakdown.other || 0);
      } catch (e) {}
    });

    const timeSpentChartData = Object.entries(hoursByType).map(([type, hours]) => ({
      type,
      hours: Math.round(hours * 10) / 10
    }));

    // 6. Recent Activity Feed (Review comments & Submissions)
    const recentComments = await prisma.reviewComment.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, role: true } },
        report: {
          include: {
            user: { select: { id: true, name: true } },
            project: { select: { id: true, name: true } }
          }
        }
      }
    });

    const recentSubmissions = await prisma.report.findMany({
      where: { submittedAt: { not: null } },
      take: 8,
      orderBy: { submittedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } }
      }
    });

    const activityFeed = [];
    recentComments.forEach((c) => {
      activityFeed.push({
        id: `comment-${c.id}`,
        type: c.action === 'APPROVED' ? 'APPROVAL' : 'CHANGES_REQUESTED',
        title: c.action === 'APPROVED' ? 'Report Approved' : 'Changes Requested',
        description: `Manager ${c.author.name} ${c.action === 'APPROVED' ? 'approved' : 'requested changes on'} ${c.report.user.name}'s Week ${c.report.weekNumber} report: "${c.comment}"`,
        timestamp: c.createdAt,
        reportId: c.reportId,
        userName: c.report.user.name,
        actorName: c.author.name
      });
    });

    recentSubmissions.forEach((s) => {
      activityFeed.push({
        id: `submission-${s.id}-${s.submittedAt.getTime()}`,
        type: 'SUBMISSION',
        title: s.isLate ? 'Report Submitted (Late)' : 'Report Submitted',
        description: `${s.user.name} submitted Week ${s.weekNumber} report for ${s.project.name}`,
        timestamp: s.submittedAt,
        reportId: s.id,
        userName: s.user.name,
        actorName: s.user.name
      });
    });

    activityFeed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.status(200).json({
      success: true,
      data: {
        tasksTrend,
        memberStatusBreakdown,
        projectWorkload,
        timeSpentChartData,
        activityFeed: activityFeed.slice(0, 15)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Side-by-Side Section Comparator (Section 4 Bonus):
 * Let manager view a single section (e.g. Blockers, Achievements, Planned Tasks)
 * across all team members side-by-side for a selected week.
 */
const getSectionComparator = async (req, res, next) => {
  try {
    const currentWeekInfo = getWeekNumber(new Date());
    const weekNumber = req.query.weekNumber ? parseInt(req.query.weekNumber, 10) : currentWeekInfo.weekNumber;
    const year = req.query.year ? parseInt(req.query.year, 10) : currentWeekInfo.year;
    const section = req.query.section || 'blockers'; // 'blockers', 'achievements', 'planned'

    const reports = await prisma.report.findMany({
      where: { weekNumber, year },
      include: {
        user: { select: { id: true, name: true, department: true } },
        project: { select: { id: true, name: true, color: true } }
      }
    });

    const comparatorData = reports.map((r) => {
      let items = [];
      try {
        if (section === 'blockers') {
          items = JSON.parse(r.blockers || '[]');
        } else if (section === 'achievements') {
          items = JSON.parse(r.achievements || '[]');
        } else if (section === 'planned') {
          items = JSON.parse(r.tasksPlannedNextWeek || '[]');
        }
      } catch (e) {
        items = [];
      }

      return {
        reportId: r.id,
        status: r.status,
        user: r.user,
        project: r.project,
        items
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        weekNumber,
        year,
        section,
        comparatorData
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardMetrics,
  getVisualInsights,
  getSectionComparator
};
