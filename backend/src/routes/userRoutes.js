const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authMiddleware);

// List users: Manager & Admin
router.get('/', requireRole(['MANAGER', 'ADMIN']), userController.getUsers);

// User profile view: Own user or Manager/Admin
router.get('/:id/profile', userController.getUserProfile);

// Admin-only user management actions
router.post('/', requireRole('ADMIN'), userController.createUser);
router.put('/:id', requireRole('ADMIN'), userController.updateUser);
router.delete('/:id', requireRole('ADMIN'), userController.deleteUser);

module.exports = router;
