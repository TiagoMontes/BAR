const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Construindo APK para Windows...\n');

const projectRoot = path.join(__dirname, '..');
const androidDir = path.join(projectRoot, 'android');
const apkSourcePath = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const apkDestDir = path.join(projectRoot, 'apk');
const apkDestPath = path.join(apkDestDir, 'bar.apk');

try {
  // Passo 1: Executar gradlew
  console.log('📦 Executando Gradle build...');
  process.chdir(androidDir);

  const gradlewCommand = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
  execSync(`${gradlewCommand} assembleDebug`, {
    stdio: 'inherit',
    cwd: androidDir
  });

  console.log('\n✅ Build concluído com sucesso!\n');

  // Passo 2: Verificar se o APK foi gerado
  console.log('🔍 Verificando APK gerado...');
  if (!fs.existsSync(apkSourcePath)) {
    console.error('❌ APK não encontrado em:', apkSourcePath);
    process.exit(1);
  }

  const stats = fs.statSync(apkSourcePath);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`✅ APK encontrado (${fileSizeMB} MB)`);
  console.log(`   Origem: ${apkSourcePath}\n`);

  // Passo 3: Criar diretório de destino se não existir
  console.log('📁 Preparando diretório de destino...');
  if (!fs.existsSync(apkDestDir)) {
    fs.mkdirSync(apkDestDir, { recursive: true });
    console.log('✅ Diretório criado:', apkDestDir);
  } else {
    console.log('✅ Diretório já existe:', apkDestDir);
  }

  // Passo 4: Copiar APK
  console.log('\n📋 Copiando APK...');
  fs.copyFileSync(apkSourcePath, apkDestPath);
  console.log('✅ APK copiado com sucesso!');
  console.log(`   Destino: ${apkDestPath}\n`);

  // Passo 5: Verificar cópia
  if (fs.existsSync(apkDestPath)) {
    const destStats = fs.statSync(apkDestPath);
    const destSizeMB = (destStats.size / (1024 * 1024)).toFixed(2);
    console.log('✨ APK pronto para instalação!');
    console.log(`   Tamanho: ${destSizeMB} MB`);
    console.log(`   Local: ${apkDestPath}\n`);
  } else {
    console.error('❌ Erro ao copiar APK');
    process.exit(1);
  }

} catch (error) {
  console.error('\n❌ Erro durante o build:');
  console.error(error.message);
  process.exit(1);
}
