const Device = require('../models/Device');
const zktService = require('../services/zktService');

exports.createDevice = async (req, res) => {
  try {
    const device = new Device(req.body);
    await device.save();
    
    // Attempt connection
    await zktService.connectDevice(device);
    
    res.status(201).json(device);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getDevices = async (req, res) => {
  try {
    const devices = await Device.find({ schoolId: req.user.schoolId });
    const status = Array.from(zktService.devices.entries()).map(([id, dev]) => ({
      deviceId: id,
      status: dev.isConnected ? 'connected' : 'disconnected'
    }));
    
    const result = devices.map(device => {
      const devStatus = status.find(s => s.deviceId === device._id.toString()) || {};
      return {
        ...device.toObject(),
        status: devStatus.status || 'disconnected'
      };
    });
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    // Reconnect if IP/port changed
    if (req.body.ip || req.body.port) {
      const existing = zktService.devices.get(device._id.toString());
      if (existing) existing.disconnect();
      
      await zktService.connectDevice(device);
    }
    
    res.json(device);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    // Disconnect if connected
    const existing = zktService.devices.get(device._id.toString());
    if (existing) existing.disconnect();
    
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDeviceStatus = async (req, res) => {
  try {
    const device = zktService.devices.get(req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not connected' });
    }
    
    res.json({
      status: device.isConnected ? 'connected' : 'disconnected',
      lastEvent: device.lastEvent
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};