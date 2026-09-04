const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authMiddleware);
router.use(requireRole(['MANAGER', 'ADMIN']));

router.get('/dashboard', analyticsController.getDashboardMetrics);
router.get('/insights', analyticsController.getVisualInsights);
router.get('/comparator', analyticsController.getSectionComparator);

module.exports = router;
