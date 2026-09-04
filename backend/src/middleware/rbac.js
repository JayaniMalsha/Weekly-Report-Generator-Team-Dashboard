const prisma = require('../config/prisma');

/**
 * Middleware to restrict endpoints based on user roles.
 * e.g. requireRole('ADMIN') or requireRole(['MANAGER', 'ADMIN'])
 */
const requireRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${roles.join(', ')}]. Your role is '${req.user.role}'`
      });
    }

    next();
  };
};

/**
 * Enforce that a team member can ONLY access their own report,
 * while Managers and Admins can view any report.
 */
const requireReportReadAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await prisma.report.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true, department: true } } }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Role-based read check:
    // If TEAM_MEMBER, must be the owner of this report
    if (req.user.role === 'TEAM_MEMBER' && report.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view another team member\'s report'
      });
    }

    req.targetReport = report;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Enforce that ONLY the author of a report can edit its content (tasks, blockers, etc.),
 * and only when in 'Draft' or 'Needs Correction' status.
 * Managers/Admins cannot rewrite the report content!
 */
const requireReportEditAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await prisma.report.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Only author can edit content
    if (report.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the author of the report can edit its content'
      });
    }

    // Check editable status: must be Draft or Needs Correction
    if (report.status !== 'Draft' && report.status !== 'Needs Correction') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit report in '${report.status}' status. Reports can only be edited when 'Draft' or 'Needs Correction'`
      });
    }

    req.targetReport = report;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requireRole,
  requireReportReadAccess,
  requireReportEditAccess
};
