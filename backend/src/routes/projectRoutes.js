const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authMiddleware);

router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', requireRole(['MANAGER', 'ADMIN']), projectController.createProject);
router.put('/:id', requireRole(['MANAGER', 'ADMIN']), projectController.updateProject);
router.delete('/:id', requireRole(['MANAGER', 'ADMIN']), projectController.deleteProject);

module.exports = router;
