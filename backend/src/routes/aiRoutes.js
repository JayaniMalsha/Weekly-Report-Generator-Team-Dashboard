const express = require('express');
const router = express.Router();
const aiAssistantController = require('../controllers/aiAssistantController');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Authentication required
router.use(authMiddleware);

// Only Managers and Admins can access AI Chatbot / Summary features
router.use(requireRole(['MANAGER', 'ADMIN']));

router.post('/chat', aiAssistantController.chatWithAssistant);
router.get('/summary', aiAssistantController.getSummary);

module.exports = router;
