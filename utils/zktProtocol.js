exports.buildPacket = (command, payload, sessionId) => {
  const header = Buffer.alloc(8);
  header.writeUInt16LE(command, 0);
  header.writeUInt16LE(sessionId, 2);
  header.writeUInt32LE(payload.length, 8);
  
  return Buffer.concat([header, payload]);
};

exports.parseAttendance = (payload) => {
  return {
    userId: payload.readUInt32LE(0),
    timestamp: new Date(
      payload.readUInt16LE(4) + 2000, // Year
      payload.readUInt16LE(6) - 1,    // Month
      payload.readUInt16LE(8),        // Day
      payload.readUInt16LE(10),       // Hour
      payload.readUInt16LE(12),       // Minute
      payload.readUInt16LE(14)        // Second
    )
  };
};

exports.createTimeBuffer = (date) => {
  const buffer = Buffer.alloc(16);
  buffer.writeUInt16LE(date.getFullYear() - 2000, 0);
  buffer.writeUInt16LE(date.getMonth() + 1, 2);
  buffer.writeUInt16LE(date.getDate(), 4);
  buffer.writeUInt16LE(date.getHours(), 6);
  buffer.writeUInt16LE(date.getMinutes(), 8);
  buffer.writeUInt16LE(date.getSeconds(), 10);
  return buffer;
};