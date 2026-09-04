const express = require('express');
const router = express.Router();
const aiAssistantController = require('../controllers/aiAssistantController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/chat', aiAssistantController.chatWithAssistant);
router.get('/summary', aiAssistantController.getSummary);

module.exports = router;
