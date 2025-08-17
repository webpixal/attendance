const cron = require('node-cron');
const Device = require('../models/Device');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const zktService = require('./zktService');

class SyncService {
  init() {
    // Nightly full sync at 2 AM
    cron.schedule('0 2 * * *', () => this.fullSync());
    
    // Incremental sync every 15 minutes
    cron.schedule('*/15 * * * *', () => this.incrementalSync());
  }

  async fullSync(deviceId = null) {
    const devices = deviceId 
      ? [await Device.findById(deviceId)] 
      : await Device.find({ isActive: true, isConnected: true });
    
    for (const device of devices) {
      try {
        const zkDevice = zktService.devices.get(device._id.toString());
        if (!zkDevice) continue;
        
        const logs = await zkDevice.pullAttendance();
        await this.saveAttendance(device, logs, 'pull');
        
        device.lastSync = new Date();
        await device.save();
      } catch (err) {
        console.error(`Full sync failed for ${device.name}:`, err);
      }
    }
  }

  async incrementalSync() {
    const devices = await Device.find({ 
      isActive: true, 
      isConnected: true 
    });
    
    for (const device of devices) {
      try {
        const lastSync = device.lastSync || new Date(Date.now() - 86400000);
        const zkDevice = zktService.devices.get(device._id.toString());
        
        if (!zkDevice) continue;
        
        const logs = await zkDevice.pullAttendance(lastSync);
        await this.saveAttendance(device, logs, 'pull');
        
        device.lastSync = new Date();
        await device.save();
      } catch (err) {
        console.error(`Incremental sync failed for ${device.name}:`, err);
      }
    }
  }

  async saveAttendance(device, logs, source) {
    const operations = logs.map(log => ({
      updateOne: {
        filter: {
          deviceId: device._id,
          userId: log.userId,
          timestamp: log.timestamp
        },
        update: {
          $setOnInsert: {
            ...log,
            schoolId: device.schoolId,
            source
          }
        },
        upsert: true
      }
    }));
    
    if (operations.length > 0) {
      await Attendance.bulkWrite(operations);
    }
  }
}

module.exports = new SyncService();