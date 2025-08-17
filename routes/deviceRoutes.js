const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
// const authMiddleware = require('../middleware/auth');

// router.use(authMiddleware);

router.post('/', deviceController.createDevice);
router.get('/', deviceController.getDevices);
router.get('/:id/status', deviceController.getDeviceStatus);
router.put('/:id', deviceController.updateDevice);
router.delete('/:id', deviceController.deleteDevice);

module.exports = router;