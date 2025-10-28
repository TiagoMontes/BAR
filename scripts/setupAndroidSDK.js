const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

console.log('🔧 Configurando Android SDK para Windows...\n');

// Detectar caminhos comuns do Android SDK no Windows
function findAndroidSDK() {
  const possiblePaths = [
    path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk'),
    'C:\\Android\\Sdk',
    'C:\\Program Files\\Android\\Sdk',
    'C:\\Program Files (x86)\\Android\\Sdk',
  ];

  // Verificar variável de ambiente ANDROID_HOME
  if (process.env.ANDROID_HOME) {
    console.log(`✅ ANDROID_HOME encontrado: ${process.env.ANDROID_HOME}`);
    return process.env.ANDROID_HOME;
  }

  // Verificar ANDROID_SDK_ROOT
  if (process.env.ANDROID_SDK_ROOT) {
    console.log(`✅ ANDROID_SDK_ROOT encontrado: ${process.env.ANDROID_SDK_ROOT}`);
    return process.env.ANDROID_SDK_ROOT;
  }

  // Procurar nos caminhos padrão
  for (const sdkPath of possiblePaths) {
    if (fs.existsSync(sdkPath)) {
      console.log(`✅ Android SDK encontrado em: ${sdkPath}`);
      return sdkPath;
    }
  }

  return null;
}

// Atualizar local.properties
function updateLocalProperties(sdkPath) {
  const localPropertiesPath = path.join(__dirname, '..', 'android', 'local.properties');

  // Converter para formato Unix (necessário para Gradle)
  const normalizedPath = sdkPath.replace(/\\/g, '/');

  const content = `sdk.dir=${normalizedPath}\n`;

  fs.writeFileSync(localPropertiesPath, content, 'utf8');
  console.log(`✅ Arquivo local.properties atualizado!`);
  console.log(`   Caminho: ${localPropertiesPath}`);
  console.log(`   SDK: ${normalizedPath}\n`);
}

// Verificar se Android SDK está instalado
function verifySDK(sdkPath) {
  const platformToolsPath = path.join(sdkPath, 'platform-tools');
  const buildToolsPath = path.join(sdkPath, 'build-tools');

  console.log('🔍 Verificando componentes do SDK...');

  if (!fs.existsSync(platformToolsPath)) {
    console.log('⚠️  Platform-tools não encontrado');
    console.log('   Execute no Android Studio: Tools > SDK Manager > SDK Tools > Android SDK Platform-Tools');
  } else {
    console.log('✅ Platform-tools encontrado');
  }

  if (!fs.existsSync(buildToolsPath)) {
    console.log('⚠️  Build-tools não encontrado');
    console.log('   Execute no Android Studio: Tools > SDK Manager > SDK Tools > Android SDK Build-Tools');
  } else {
    const buildToolsVersions = fs.readdirSync(buildToolsPath);
    console.log(`✅ Build-tools encontrado (${buildToolsVersions.length} versões)`);
  }
}

// Main
function main() {
  // Verificar se está no Windows
  if (os.platform() !== 'win32') {
    console.log('⚠️  Este script é específico para Windows.');
    console.log('   Para Mac/Linux, o SDK já deve estar configurado.\n');
    return;
  }

  const sdkPath = findAndroidSDK();

  if (!sdkPath) {
    console.log('❌ Android SDK não encontrado!\n');
    console.log('📋 Soluções:');
    console.log('   1. Instale o Android Studio: https://developer.android.com/studio');
    console.log('   2. Durante a instalação, certifique-se de instalar o Android SDK');
    console.log('   3. Ou configure a variável de ambiente ANDROID_HOME com o caminho do SDK\n');
    console.log('   Exemplo de caminho padrão:');
    console.log(`   C:\\Users\\${os.userInfo().username}\\AppData\\Local\\Android\\Sdk\n`);
    process.exit(1);
  }

  updateLocalProperties(sdkPath);
  verifySDK(sdkPath);

  console.log('✨ Configuração concluída!');
  console.log('   Agora você pode executar: npm run build:apk:win\n');
}

main();
