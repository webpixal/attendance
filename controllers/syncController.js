const syncService = require('../services/syncService');

exports.manualSync = async (req, res) => {
  try {
    const { deviceId, type = 'incremental' } = req.body;
    
    if (type === 'full') {
      await syncService.fullSync(deviceId);
    } else {
      await syncService.incrementalSync();
    }
    
    res.json({ 
      success: true,
      message: `Manual ${type} sync completed` 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.pullDeviceData = async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const dataType = req.params.dataType;
    const device = zktService.devices.get(deviceId);
    
    if (!device) {
      return res.status(404).json({ error: 'Device not connected' });
    }
    
    let data;
    if (dataType === 'attendance') {
      data = await device.pullAttendance();
    } else {
      return res.status(400).json({ error: 'Invalid data type' });
    }
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};