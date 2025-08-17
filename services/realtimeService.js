const Device = require('../models/Device');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

class RealtimeService {
  static async processAttendanceEvent(deviceId, event) {
    try {
      const device = await Device.findById(deviceId).populate('schoolId');
      if (!device) return null;
      
      const user = await User.findOne({
        schoolId: device.schoolId._id,
        zkUid: event.userId
      });
      
      if (!user) {
        console.warn(`Unknown user ${event.userId} on device ${deviceId}`);
        return null;
      }
      
      const attendance = new Attendance({
        user: user._id,
        device: deviceId,
        school: device.schoolId._id,
        timestamp: event.timestamp,
        status: 'present',
        source: 'push',
        zkUid: event.userId
      });
      
      await attendance.save();
      return attendance;
    } catch (err) {
      console.error('Event processing failed:', err);
      return null;
    }
  }
}

module.exports = RealtimeService;