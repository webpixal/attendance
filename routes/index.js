const express = require('express');
const router = express.Router();

// Auth routes
router.use('/auth', require('./authRoutes'));

// Protected routes
router.use('/devices', require('./deviceRoutes'));
router.use('/attendance', require('./attendanceRoutes'));
router.use('/sync', require('./syncRoutes'));
router.use('/users', require('./userRoutes'));

module.exports = router;