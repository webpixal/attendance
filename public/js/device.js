document.addEventListener('DOMContentLoaded', () => {
  const deviceDetails = document.getElementById('deviceDetails');
  const attendanceBody = document.getElementById('attendanceBody');
  const connectBtn = document.getElementById('connectBtn');
  const getAttendanceBtn = document.getElementById('getAttendanceBtn');
  
  // Load device details
  async function loadDeviceDetails() {
    try {
      const response = await fetch(`/api/devices/${deviceId}`);
      const data = await response.json();
      
      if (data.device) {
        deviceDetails.innerHTML = `
          <p><strong>IP:</strong> ${data.device.ip}</p>
          <p><strong>Port:</strong> ${data.device.port}</p>
          <p><strong>Serial:</strong> ${data.device.serial || 'N/A'}</p>
          <p><strong>Model:</strong> ${data.device.model || 'N/A'}</p>
          <p><strong>Last Seen:</strong> ${new Date(data.device.lastSeen).toLocaleString()}</p>
        `;
      }
      
      if (data.attendance) {
        attendanceBody.innerHTML = '';
        
        data.attendance.forEach(record => {
          const row = document.createElement('tr');
          
          row.innerHTML = `
            <td>${record.userId}</td>
            <td>${new Date(record.timestamp).toLocaleString()}</td>
            <td>${record.status}</td>
            <td>${record.verification || 'N/A'}</td>
          `;
          
          attendanceBody.appendChild(row);
        });
      }
    } catch (error) {
      console.error('Device details error:', error);
    }
  }
  
  connectBtn.addEventListener('click', async () => {
    try {
      const response = await fetch(`/api/devices/${deviceId}/connect`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadDeviceDetails();
        alert('Device information updated');
      } else {
        alert('Failed to connect to device');
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert('Error connecting to device');
    }
  });
  
  getAttendanceBtn.addEventListener('click', async () => {
    try {
      const response = await fetch(`/api/devices/${deviceId}/attendance`, {
        method: 'GET'
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadDeviceDetails();
        alert(`Added ${data.added} new attendance records`);
      } else {
        alert('Failed to get attendance data');
      }
    } catch (error) {
      console.error('Attendance error:', error);
      alert('Error retrieving attendance data');
    }
  });
  
  // Load device details on page load
  loadDeviceDetails();
});