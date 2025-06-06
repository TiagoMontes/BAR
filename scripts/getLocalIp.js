const { networkInterfaces } = require('os')

function getLocalIp() {
  const nets = networkInterfaces()
  const results = {}

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = []
        }
        results[name].push(net.address)
      }
    }
  }

  // Get the first non-internal IPv4 address
  for (const name of Object.keys(results)) {
    for (const ip of results[name]) {
      if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
        return ip
      }
    }
  }

  return 'localhost' // fallback
}

module.exports = getLocalIp 