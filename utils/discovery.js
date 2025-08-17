const dgram = require('dgram');

// Broadcast discovery packet to find ZKTeco devices
function broadcastDiscovery(timeout = 5000) {
  return new Promise((resolve) => {
    const socket = dgram.createSocket('udp4');
    const devices = [];

    // Create discovery packet (ZKTeco protocol)
    const packet = Buffer.alloc(72);
    packet[0] = 0x50;  // Header
    packet[1] = 0x50;
    packet[2] = 0x82;  // Command (DISCOVERY)
    packet.writeUInt32LE(0, 3);  // Data length
    packet[7] = 0x00;  // Checksum placeholder

    socket.on('message', (msg, rinfo) => {
      if (msg.length > 8 && msg[0] === 0x50 && msg[1] === 0x50) {
        const serial = msg.slice(8, 24).toString('ascii').replace(/\0/g, '');
        const model = msg.slice(30, 46).toString('ascii').replace(/\0/g, '');
        
        devices.push({
          ip: rinfo.address,
          mac: msg.slice(24, 30).toString('hex'),
          serial,
          model
        });
      }
    });

    socket.bind(() => {
      socket.setBroadcast(true);
      socket.send(packet, 0, packet.length, 4370, '255.255.255.255');
    });

    setTimeout(() => {
      socket.close();
      resolve(devices);
    }, timeout);
  });
}

module.exports = { broadcastDiscovery };