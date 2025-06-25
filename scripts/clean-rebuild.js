const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Iniciando limpeza e rebuild completo...\n');

try {
  // 1. Limpar cache do Next.js
  console.log('1. Limpando cache do Next.js...');
  const nextCache = path.join(__dirname, '../.next');
  const outDir = path.join(__dirname, '../out');
  
  if (fs.existsSync(nextCache)) {
    execSync('rm -rf .next', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    console.log('✅ Cache do Next.js removido');
  }
  
  if (fs.existsSync(outDir)) {
    execSync('rm -rf out', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    console.log('✅ Diretório out removido');
  }

  // 2. Limpar node_modules (opcional)
  console.log('\n2. Limpando node_modules...');
  const nodeModules = path.join(__dirname, '../node_modules');
  if (fs.existsSync(nodeModules)) {
    execSync('rm -rf node_modules', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    console.log('✅ node_modules removido');
    
    console.log('Reinstalando dependências...');
    execSync('npm install', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    console.log('✅ Dependências reinstaladas');
  }

  // 3. Build do Next.js
  console.log('\n3. Fazendo build do Next.js...');
  execSync('npm run build', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
  console.log('✅ Build do Next.js concluído');

  // 4. Limpar build do Android
  console.log('\n4. Limpando build do Android...');
  const androidDir = path.join(__dirname, '../android');
  if (fs.existsSync(androidDir)) {
    execSync('./gradlew clean', { cwd: androidDir, stdio: 'inherit' });
    console.log('✅ Build do Android limpo');
  }

  // 5. Sincronizar Capacitor
  console.log('\n5. Sincronizando Capacitor...');
  execSync('npx cap sync', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
  console.log('✅ Capacitor sincronizado');

  // 6. Build do APK
  console.log('\n6. Fazendo build do APK...');
  execSync('npm run build:apk', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
  console.log('✅ APK gerado com sucesso!');

  console.log('\n🎉 Rebuild completo concluído!');
  console.log('O APK está disponível em: apk/bar.apk');
  console.log('\nPara testar:');
  console.log('1. Instale o APK no dispositivo');
  console.log('2. Certifique-se de que o servidor está rodando em: http://192.168.15.179:3000');
  console.log('3. Verifique se o dispositivo está na mesma rede');

} catch (error) {
  console.error('❌ Erro durante o rebuild:', error.message);
  process.exit(1);
} 