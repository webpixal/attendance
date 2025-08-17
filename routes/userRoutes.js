const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public routes
router.post('/login', userController.loginUser);
router.post('/register', userController.registerUser);

// Protected routes
router.use(authMiddleware);

// User management
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
router.post('/logout', userController.logoutUser);

// Admin-only routes
router.use(adminMiddleware);
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;