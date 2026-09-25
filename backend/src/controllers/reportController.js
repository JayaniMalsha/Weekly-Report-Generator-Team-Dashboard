const prisma = require('../config/prisma');
const { getWeekNumber, getDateRangeForWeek } = require('../utils/dateUtils');

/**
 * Create or save draft report.
 * Team members create their own reports.
 */
const saveReportDraft = async (req, res, next) => {
  try {
    const {
      id, // if editing existing draft/needs correction
      projectId,
      weekNumber: inputWeek,
      year: inputYear,
      tasksPlannedNextWeek,
      blockers,
      achievements,
      hoursBreakdown,
      notes,
      links,
      tasks // array of tasks
    } = req.body;

    const currentWeekInfo = getWeekNumber(new Date());
    const weekNumber = inputWeek ? parseInt(inputWeek, 10) : currentWeekInfo.weekNumber;
    const year = inputYear ? parseInt(inputYear, 10) : currentWeekInfo.year;
    const { startDate, endDate, dueDate } = getDateRangeForWeek(weekNumber, year);

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project / category is required'
      });
    }

    let report;

    if (id) {
      // Editing existing report
      const existing = await prisma.report.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }
      if (existing.userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'You can only edit your own reports' });
      }
      if (existing.status !== 'Draft' && existing.status !== 'Needs Correction') {
        return res.status(400).json({
          success: false,
          message: `Cannot edit report in '${existing.status}' status`
        });
      }

      report = await prisma.$transaction(async (tx) => {
        // Delete existing tasks to replace with new tasks array
        if (Array.isArray(tasks)) {
          await tx.task.deleteMany({ where: { reportId: id } });
          if (tasks.length > 0) {
            await tx.task.createMany({
              data: tasks.map((t) => ({
                reportId: id,
                name: t.name || 'Untitled Task',
                priority: t.priority || 'Medium',
                plannedPercent: parseInt(t.plannedPercent || 100, 10),
                actualPercent: parseInt(t.actualPercent || 0, 10),
                status: t.status || 'In Progress',
                timePlannedHours: parseFloat(t.timePlannedHours || 0),
                timeSpentHours: parseFloat(t.timeSpentHours || 0),
                outputDeliverable: t.outputDeliverable || null
              }))
            });
          }
        }

        return tx.report.update({
          where: { id },
          data: {
            projectId,
            tasksPlannedNextWeek: typeof tasksPlannedNextWeek === 'string' ? tasksPlannedNextWeek : JSON.stringify(tasksPlannedNextWeek || []),
            blockers: typeof blockers === 'string' ? blockers : JSON.stringify(blockers || []),
            achievements: typeof achievements === 'string' ? achievements : JSON.stringify(achievements || []),
            hoursBreakdown: typeof hoursBreakdown === 'string' ? hoursBreakdown : JSON.stringify(hoursBreakdown || {}),
            notes: notes || null,
            links: links || null
          },
          include: {
            tasks: true,
            project: true,
            user: { select: { id: true, name: true, email: true, department: true } }
          }
        });
      });
    } else {
      // Team members can add only their first report, and thereafter only edit and submit it
      if (req.user.role === 'TEAM_MEMBER') {
        const existingMemberReport = await prisma.report.findFirst({
          where: { userId: req.user.id }
        });
        if (existingMemberReport) {
          return res.status(409).json({
            success: false,
            message: 'You already have a weekly report. Team members can only edit and submit their existing report.',
            data: existingMemberReport
          });
        }
      }

      // Check if report already exists for this week
      const existing = await prisma.report.findUnique({
        where: {
          userId_weekNumber_year: {
            userId: req.user.id,
            weekNumber,
            year
          }
        }
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: `A report for Week ${weekNumber}, ${year} already exists. You can edit it from your report history.`
        });
      }

      report = await prisma.$transaction(async (tx) => {
        const createdReport = await tx.report.create({
          data: {
            userId: req.user.id,
            projectId,
            weekNumber,
            year,
            startDate,
            endDate,
            dueDate,
            status: 'Draft',
            tasksPlannedNextWeek: typeof tasksPlannedNextWeek === 'string' ? tasksPlannedNextWeek : JSON.stringify(tasksPlannedNextWeek || []),
            blockers: typeof blockers === 'string' ? blockers : JSON.stringify(blockers || []),
            achievements: typeof achievements === 'string' ? achievements : JSON.stringify(achievements || []),
            hoursBreakdown: typeof hoursBreakdown === 'string' ? hoursBreakdown : JSON.stringify(hoursBreakdown || {}),
            notes: notes || null,
            links: links || null
          }
        });

        if (Array.isArray(tasks) && tasks.length > 0) {
          await tx.task.createMany({
            data: tasks.map((t) => ({
              reportId: createdReport.id,
              name: t.name || 'Untitled Task',
              priority: t.priority || 'Medium',
              plannedPercent: parseInt(t.plannedPercent || 100, 10),
              actualPercent: parseInt(t.actualPercent || 0, 10),
              status: t.status || 'In Progress',
              timePlannedHours: parseFloat(t.timePlannedHours || 0),
              timeSpentHours: parseFloat(t.timeSpentHours || 0),
              outputDeliverable: t.outputDeliverable || null
            }))
          });
        }

        return tx.report.findUnique({
          where: { id: createdReport.id },
          include: {
            tasks: true,
            project: true,
            user: { select: { id: true, name: true, email: true, department: true } }
          }
        });
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Report draft saved successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit or Resubmit a report for manager review.
 * Captures snapshot into ReportVersion and checks late status.
 */
const submitReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        tasks: true,
        project: true,
        versions: { orderBy: { versionNumber: 'desc' } }
      }
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (report.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only submit your own report' });
    }

    if (report.status !== 'Draft' && report.status !== 'Needs Correction') {
      return res.status(400).json({
        success: false,
        message: `Report cannot be submitted in '${report.status}' status`
      });
    }

    const now = new Date();
    const isLate = now > new Date(report.dueDate);

    // Calculate version number: next integer
    const nextVersionNumber = report.versions.length > 0 ? report.versions[0].versionNumber + 1 : 1;

    // Snapshot full state of report
    const snapshotPayload = {
      weekNumber: report.weekNumber,
      year: report.year,
      projectId: report.projectId,
      projectName: report.project.name,
      tasks: report.tasks,
      tasksPlannedNextWeek: JSON.parse(report.tasksPlannedNextWeek || '[]'),
      blockers: JSON.parse(report.blockers || '[]'),
      achievements: JSON.parse(report.achievements || '[]'),
      hoursBreakdown: JSON.parse(report.hoursBreakdown || '{}'),
      notes: report.notes,
      links: report.links,
      submittedAt: now.toISOString(),
      isLate
    };

    const updatedReport = await prisma.$transaction(async (tx) => {
      // Create version record
      await tx.reportVersion.create({
        data: {
          reportId: report.id,
          versionNumber: nextVersionNumber,
          submittedAt: now,
          submittedById: req.user.id,
          snapshot: JSON.stringify(snapshotPayload),
          statusAtSnapshot: 'Submitted'
        }
      });

      // Update report status
      return tx.report.update({
        where: { id },
        data: {
          status: 'Submitted',
          submittedAt: now,
          isLate
        },
        include: {
          tasks: true,
          project: true,
          versions: { orderBy: { versionNumber: 'desc' } },
          reviewComments: { orderBy: { createdAt: 'desc' } }
        }
      });
    });

    return res.status(200).json({
      success: true,
      message: `Report successfully submitted for review (Version ${nextVersionNumber})${isLate ? ' [Marked Late]' : ''}`,
      data: updatedReport
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List reports with pagination and filtering.
 * Enforces role access: Team Member only gets their own. Manager/Admin can see all.
 */
const getReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || 1, 10);
    const limit = parseInt(req.query.limit || 10, 10);
    const skip = (page - 1) * limit;

    const {
      userId,
      projectId,
      status,
      weekNumber,
      year,
      isLate,
      search
    } = req.query;

    const where = {};

    // Role-based security filter
    if (req.user.role === 'TEAM_MEMBER') {
      where.userId = req.user.id;
    } else if (userId) {
      where.userId = userId;
    }

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (weekNumber) where.weekNumber = parseInt(weekNumber, 10);
    if (year) where.year = parseInt(year, 10);
    if (isLate !== undefined && isLate !== '') where.isLate = isLate === 'true';

    if (search) {
      where.OR = [
        { notes: { contains: search } },
        { tasks: { some: { name: { contains: search } } } },
        { user: { name: { contains: search } } }
      ];
    }

    const [total, reports] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ year: 'desc' }, { weekNumber: 'desc' }, { createdAt: 'desc' }],
        include: {
          user: { select: { id: true, name: true, email: true, department: true, avatar: true } },
          project: { select: { id: true, name: true, code: true, color: true } },
          tasks: true,
          reviewComments: { orderBy: { createdAt: 'desc' }, take: 1 },
          _count: { select: { versions: true } }
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single report detail.
 */
const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, department: true, avatar: true } },
        project: true,
        tasks: true,
        reviewComments: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { id: true, name: true, role: true } } }
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          include: {
            submittedBy: { select: { id: true, name: true } },
            reviewComment: true
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Role-based read access
    if (req.user.role === 'TEAM_MEMBER' && report.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot view reports from other team members'
      });
    }

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Review report (Manager or Admin only).
 * Action: APPROVE or REQUEST_CHANGES.
 * Links review comment directly to the version under review!
 */
const reviewReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, comment } = req.body;

    if (!action || !['APPROVE', 'REQUEST_CHANGES'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either APPROVE or REQUEST_CHANGES'
      });
    }

    if (action === 'REQUEST_CHANGES' && (!comment || comment.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'A general comment is required when requesting changes'
      });
    }

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { versionNumber: 'desc' }, take: 1 }
      }
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (report.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: `Only reports in 'Submitted' status can be reviewed. Current status is '${report.status}'`
      });
    }

    const now = new Date();
    const newStatus = action === 'APPROVE' ? 'Approved' : 'Needs Correction';
    const latestVersion = report.versions.length > 0 ? report.versions[0] : null;
    const versionNumber = latestVersion ? latestVersion.versionNumber : 1;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the ReviewComment
      const createdComment = await tx.reviewComment.create({
        data: {
          reportId: report.id,
          authorId: req.user.id,
          action,
          comment: comment || (action === 'APPROVE' ? 'Report approved.' : 'Changes requested.'),
          versionNumber
        }
      });

      // 2. Link this review comment to the specific version being reviewed
      if (latestVersion) {
        await tx.reportVersion.update({
          where: { id: latestVersion.id },
          data: {
            reviewCommentId: createdComment.id,
            statusAtSnapshot: newStatus
          }
        });
      }

      // 3. Update report status
      return tx.report.update({
        where: { id },
        data: {
          status: newStatus,
          approvedAt: action === 'APPROVE' ? now : null
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          project: true,
          reviewComments: {
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { id: true, name: true, role: true } } }
          },
          versions: {
            orderBy: { versionNumber: 'desc' },
            include: { reviewComment: true }
          }
        }
      });
    });

    return res.status(200).json({
      success: true,
      message: action === 'APPROVE' ? 'Report approved successfully' : 'Changes requested. Report sent back for correction.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all historical versions of a report.
 */
const getReportVersions = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
      select: { id: true, userId: true }
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (req.user.role === 'TEAM_MEMBER' && report.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const versions = await prisma.reportVersion.findMany({
      where: { reportId: id },
      orderBy: { versionNumber: 'desc' },
      include: {
        submittedBy: { select: { id: true, name: true, email: true } },
        reviewComment: {
          include: { author: { select: { id: true, name: true, role: true } } }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: versions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveReportDraft,
  submitReport,
  getReports,
  getReportById,
  reviewReport,
  getReportVersions
};
