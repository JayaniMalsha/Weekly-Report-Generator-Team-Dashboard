const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

/**
 * List all users with report counts and role info.
 * Accessible to Manager and Admin.
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, department, search } = req.query;
    const where = {};
    if (role) where.role = role;
    if (department) where.department = department;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: { reports: true }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Team Member Profile View (Section 7 requirement: manager view).
 * Shows full report history, task counts, compliance stats.
 */
const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        avatar: true,
        createdAt: true,
        reports: {
          orderBy: [{ year: 'desc' }, { weekNumber: 'desc' }],
          include: {
            project: { select: { id: true, name: true, code: true, color: true } },
            tasks: true,
            reviewComments: { orderBy: { createdAt: 'desc' }, take: 1 }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Role-based security check: team members can only view their own profile
    if (req.user.role === 'TEAM_MEMBER' && req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot view other member profiles' });
    }

    // Calculate user statistics
    const totalReports = user.reports.length;
    const approvedReports = user.reports.filter((r) => r.status === 'Approved').length;
    const needsCorrectionReports = user.reports.filter((r) => r.status === 'Needs Correction').length;
    const lateReports = user.reports.filter((r) => r.isLate).length;
    const onTimeReports = user.reports.filter((r) => r.status !== 'Draft' && !r.isLate).length;

    let totalTasksCompleted = 0;
    let totalHoursLogged = 0;

    user.reports.forEach((report) => {
      report.tasks.forEach((task) => {
        if (task.status === 'Completed') totalTasksCompleted += 1;
        totalHoursLogged += task.timeSpentHours || 0;
      });
    });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          avatar: user.avatar,
          createdAt: user.createdAt
        },
        stats: {
          totalReports,
          approvedReports,
          needsCorrectionReports,
          lateReports,
          onTimeReports,
          complianceRate: totalReports > 0 ? Math.round((onTimeReports / totalReports) * 100) : 100,
          totalTasksCompleted,
          totalHoursLogged
        },
        reports: user.reports
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Only: Create / Invite a user.
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const validRoles = ['TEAM_MEMBER', 'MANAGER', 'ADMIN'];
    const assignedRole = validRoles.includes(role) ? role : 'TEAM_MEMBER';

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: assignedRole,
        department: department || 'Engineering'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Only: Update a user's role or details.
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, department, name, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Protect against self-demotion from Admin if sole admin
    if (existing.id === req.user.id && role && role !== 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot demote the only remaining Admin' });
      }
    }

    const dataToUpdate = {};
    if (role && ['TEAM_MEMBER', 'MANAGER', 'ADMIN'].includes(role)) dataToUpdate.role = role;
    if (department) dataToUpdate.department = department;
    if (name) dataToUpdate.name = name;
    if (password && password.length >= 6) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Only: Delete user.
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    await prisma.user.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserProfile,
  createUser,
  updateUser,
  deleteUser
};
