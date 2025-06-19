const fs = require('fs')
const path = require('path')
const getLocalIp = require('./getLocalIp')

const ip = getLocalIp()
const config = {
  serverUrl: `http://${ip}:3001`
}

// Gerar lib/config.json
const configPath = path.join(__dirname, '../lib/config.json')
fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

// Gerar capacitor.config.js
const capacitorConfig = {
  appId: 'com.rivaldo.bar',
  appName: 'BAR',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    url: `http://${ip}:3000`,
    cleartext: true
  },
  plugins: {
    BluetoothLe: {
      displayStrings: {
        scanning: 'Scanning for devices...',
        cancel: 'Cancel',
        availableDevices: 'Available devices',
        noDeviceFound: 'No device found'
      },
      services: ['FFE0'],
      optionalServices: ['FFE0']
    }
  },
  android: {
    permissions: [
      'android.permission.BLUETOOTH',
      'android.permission.BLUETOOTH_ADMIN',
      'android.permission.BLUETOOTH_SCAN',
      'android.permission.BLUETOOTH_CONNECT',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION'
    ],
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined
    },
    allowMixedContent: true
  }
}

const capacitorConfigPath = path.join(__dirname, '../capacitor.config.js')
const capacitorConfigContent = `const config = ${JSON.stringify(capacitorConfig, null, 2)};

module.exports = config;`
fs.writeFileSync(capacitorConfigPath, capacitorConfigContent)

// Gerar android/app/src/main/assets/capacitor.config.json
const androidConfigPath = path.join(__dirname, '../android/app/src/main/assets/capacitor.config.json')
fs.writeFileSync(androidConfigPath, JSON.stringify(capacitorConfig, null, 2))

console.log(`✅ Configurações geradas com IP: ${ip}`)
console.log(`📁 lib/config.json: ${config.serverUrl}`)
console.log(`📁 capacitor.config.js: ${capacitorConfig.server.url}`)
console.log(`📁 android/app/src/main/assets/capacitor.config.json: ${capacitorConfig.server.url}`) 