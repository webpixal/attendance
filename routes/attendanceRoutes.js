const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
// const authMiddleware = require('../middleware/auth');

// router.use(authMiddleware);

router.get('/', attendanceController.getAttendance);

module.exports = router;