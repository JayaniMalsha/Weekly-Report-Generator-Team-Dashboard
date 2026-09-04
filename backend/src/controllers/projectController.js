const prisma = require('../config/prisma');

const getProjects = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const projects = await prisma.project.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { reports: true, members: true }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true, department: true } }
          }
        },
        _count: { select: { reports: true } }
      }
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    return res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { name, code, description, color, status, memberIds } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Project name and code are required'
      });
    }

    const existing = await prisma.project.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Project with code '${code.toUpperCase()}' already exists`
      });
    }

    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          name,
          code: code.toUpperCase(),
          description: description || null,
          color: color || '#3b82f6',
          status: status || 'Active'
        }
      });

      if (Array.isArray(memberIds) && memberIds.length > 0) {
        await tx.userProject.createMany({
          data: memberIds.map((userId) => ({
            projectId: created.id,
            userId
          }))
        });
      }

      return tx.project.findUnique({
        where: { id: created.id },
        include: {
          members: {
            include: { user: { select: { id: true, name: true, email: true } } }
          }
        }
      });
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, description, color, status, memberIds } = req.body;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (Array.isArray(memberIds)) {
        await tx.userProject.deleteMany({ where: { projectId: id } });
        if (memberIds.length > 0) {
          await tx.userProject.createMany({
            data: memberIds.map((userId) => ({
              projectId: id,
              userId
            }))
          });
        }
      }

      return tx.project.update({
        where: { id },
        data: {
          name: name || undefined,
          code: code ? code.toUpperCase() : undefined,
          description: description !== undefined ? description : undefined,
          color: color || undefined,
          status: status || undefined
        },
        include: {
          members: {
            include: { user: { select: { id: true, name: true, email: true } } }
          }
        }
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reportCount = await prisma.report.count({ where: { projectId: id } });
    if (reportCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete project because it is referenced by ${reportCount} report(s). Consider archiving or changing status to 'Completed'`
      });
    }

    await prisma.project.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
