const Attendance = require('../models/Attendance');

exports.getAttendance = async (req, res) => {
  try {
    const { startDate, endDate, userId, deviceId } = req.query;
    const filter = { schoolId: req.user.schoolId };
    
    if (startDate && endDate) {
      filter.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (userId) filter.userId = userId;
    if (deviceId) filter.deviceId = deviceId;
    
    const attendance = await Attendance.find(filter)
      .populate('userId', 'name')
      .populate('deviceId', 'name')
      .sort({ timestamp: -1 })
      .limit(100);
    
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};