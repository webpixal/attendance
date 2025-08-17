const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
// const authMiddleware = require('../middleware/auth');

// router.use(authMiddleware);

router.post('/manual', syncController.manualSync);
router.get('/:deviceId/pull/:dataType', syncController.pullDeviceData);

module.exports = router;