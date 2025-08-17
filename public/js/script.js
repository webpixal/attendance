document.addEventListener('DOMContentLoaded', () => {
  const discoverBtn = document.getElementById('discoverBtn');
  const devicesBody = document.getElementById('devicesBody');
  
  discoverBtn.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/devices/discover');
      const data = await response.json();
      
      if (data.success) {
        await loadDevices();
      } else {
        alert('Device discovery failed');
      }
    } catch (error) {
      console.error('Discovery error:', error);
      alert('Failed to discover devices');
    }
  });
  
  async function loadDevices() {
    try {
      const response = await fetch('/api/devices');
      const devices = await response.json();
      
      devicesBody.innerHTML = '';
      
      devices.forEach(device => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>${device.ip}:${device.port}</td>
          <td>${device.serial || 'N/A'}</td>
          <td>${device.model || 'N/A'}</td>
          <td>${new Date(device.lastSeen).toLocaleString()}</td>
          <td>
            <a href="/device/${device._id}" class="btn">View</a>
          </td>
        `;
        
        devicesBody.appendChild(row);
      });
    } catch (error) {
      console.error('Device load error:', error);
    }
  }
  
  // Load devices on page load
  loadDevices();
});