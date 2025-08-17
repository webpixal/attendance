const net = require('net');
const Device = require('../models/Device');
const { EventEmitter } = require('events');
const zktProtocol = require('../utils/zktProtocol');

class ZKTDevice extends EventEmitter {
  constructor(ip, port = 4370) {
    super();
    this.ip = ip;
    this.port = port;
    this.socket = new net.Socket();
    this.sessionId = 0;
    this.replyId = 0;
    this.buffer = Buffer.alloc(0);
    this.isConnected = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket.connect(this.port, this.ip, () => {
        this.isConnected = true;
        this.emit('connected');
        resolve();
      });

      this.socket.on('data', (data) => this.handleData(data));
      this.socket.on('close', () => this.handleClose());
      this.socket.on('error', (err) => this.handleError(err));
    });
  }

  handleData(data) {
    this.buffer = Buffer.concat([this.buffer, data]);
    while (this.buffer.length >= 16) {
      const header = this.buffer.subarray(0, 16);
      const size = header.readUInt32LE(8);
      
      if (this.buffer.length >= 8 + size) {
        const packet = this.buffer.subarray(0, 8 + size);
        this.buffer = this.buffer.subarray(8 + size);
        this.parsePacket(packet);
      }
    }
  }

  parsePacket(packet) {
    const commandId = packet.readUInt16LE(0);
    const payload = packet.subarray(8, packet.length - 2);
    
    if (commandId === 0x000D) { // Attendance event
      const eventData = zktProtocol.parseAttendance(payload);
      this.emit('attendance', eventData);
    }
    // Add other command handlers
  }

  enableRealtime() {
    const payload = Buffer.alloc(4);
    payload.writeUInt32LE(1, 0);
    this.sendCommand(0x0014, payload);
  }

  sendCommand(command, payload = Buffer.alloc(0)) {
    const packet = zktProtocol.buildPacket(command, payload, this.sessionId);
    this.socket.write(packet);
  }

  async pullAttendance(startTime = null) {
    const timeBuffer = startTime ? zktProtocol.createTimeBuffer(startTime) : Buffer.alloc(0);
    this.sendCommand(0x000D, timeBuffer);
    
    return new Promise((resolve) => {
      const logs = [];
      const handler = (data) => logs.push(data);
      
      this.on('attendance-data', handler);
      this.once('attendance-end', () => {
        this.off('attendance-data', handler);
        resolve(logs);
      });
      
      setTimeout(() => {
        this.off('attendance-data', handler);
        resolve(logs);
      }, 30000);
    });
  }

  handleClose() {
    this.isConnected = false;
    this.emit('disconnected');
  }

  handleError(err) {
    this.emit('error', err);
  }

  disconnect() {
    this.socket.destroy();
  }
}

class ZKTManager {
  constructor() {
    this.devices = new Map();
    this.io = null;
  }

  setSocketIO(io) {
    this.io = io;
  }

  async initDevices() {
    const devices = await Device.find({ isActive: true });
    for (const device of devices) {
      await this.connectDevice(device);
    }
  }

  async connectDevice(deviceConfig) {
    const device = new ZKTDevice(deviceConfig.ip, deviceConfig.port);
    
    try {
      await device.connect();
      device.enableRealtime();
      
      device.on('attendance', async (event) => {
        // Process real-time event
        const attendance = await this.processAttendanceEvent(
          deviceConfig._id, 
          event
        );
        
        // Emit to Socket.IO room
        if (this.io) {
          this.io.to(`device-${deviceConfig._id}`).emit('attendance', attendance);
        }
      });
      
      this.devices.set(deviceConfig._id.toString(), device);
      await Device.findByIdAndUpdate(deviceConfig._id, {
        isConnected: true,
        lastEvent: new Date()
      });
      
      return device;
    } catch (err) {
      console.error(`Connection failed to ${deviceConfig.ip}:`, err);
      return null;
    }
  }

  async processAttendanceEvent(deviceId, event) {
    // Implementation to save attendance to DB
    // (See attendanceController for similar logic)
  }
}

module.exports = new ZKTManager();