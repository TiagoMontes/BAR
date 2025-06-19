const fs = require('fs')
const path = require('path')

// Pega o IP dos argumentos da linha de comando
const ip = process.argv[2]

if (!ip) {
  console.error('❌ Erro: IP não fornecido')
  console.log('Uso: node scripts/setConfig.js <IP>')
  console.log('Exemplo: node scripts/setConfig.js 192.168.1.100')
  process.exit(1)
}

// Valida o formato do IP
const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
if (!ipRegex.test(ip)) {
  console.error('❌ Erro: IP inválido')
  console.log('Formato esperado: xxx.xxx.xxx.xxx')
  process.exit(1)
}

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
console.log('\n📋 Próximos passos:')
console.log('1. npm run build')
console.log('2. npm run cap:sync')
console.log('3. npm run build:apk') 