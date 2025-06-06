const fs = require('fs')
const path = require('path')
const getLocalIp = require('./getLocalIp')

const ip = getLocalIp()
const config = {
  serverUrl: `http://${ip}:3001`
}

const configPath = path.join(__dirname, '../lib/config.json')
fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

console.log(`Generated config with server URL: ${config.serverUrl}`) 