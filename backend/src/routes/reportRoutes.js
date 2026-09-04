const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// All report routes require authentication
router.use(authMiddleware);

// List reports (paginated & filtered)
router.get('/', reportController.getReports);

// Save draft (create or update)
router.post('/draft', reportController.saveReportDraft);

// Submit report for manager review
router.post('/:id/submit', reportController.submitReport);

// Get single report detail
router.get('/:id', reportController.getReportById);

// Get report version history
router.get('/:id/versions', reportController.getReportVersions);

// Review report (Approve or Request Changes with comment) - Manager & Admin only
router.post('/:id/review', requireRole(['MANAGER', 'ADMIN']), reportController.reviewReport);

module.exports = router;
