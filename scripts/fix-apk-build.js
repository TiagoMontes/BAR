const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Diagnosticando problema da tela branca no APK...\n');

// 1. Verificar se o diretório out existe e tem conteúdo
console.log('1. Verificando build do Next.js...');
const outDir = path.join(__dirname, '../out');
if (!fs.existsSync(outDir)) {
  console.log('❌ Diretório "out" não encontrado. Execute "npm run build" primeiro.');
  process.exit(1);
}

const outFiles = fs.readdirSync(outDir);
console.log(`✅ Diretório "out" encontrado com ${outFiles.length} arquivos`);

// 2. Verificar se o index.html existe
const indexHtmlPath = path.join(outDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.log('❌ index.html não encontrado no diretório out');
  process.exit(1);
}

console.log('✅ index.html encontrado');

// 3. Verificar conteúdo do index.html
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
if (!indexHtml.includes('<div id="__next">')) {
  console.log('⚠️ index.html pode não estar correto - não encontrou div __next');
}

// 4. Verificar se há arquivos CSS e JS
const hasCss = outFiles.some(file => file.endsWith('.css'));
const hasJs = outFiles.some(file => file.endsWith('.js'));

console.log(`✅ CSS encontrado: ${hasCss}`);
console.log(`✅ JS encontrado: ${hasJs}`);

// 5. Verificar configuração do Capacitor
console.log('\n2. Verificando configuração do Capacitor...');
const capacitorConfigPath = path.join(__dirname, '../capacitor.config.js');
if (!fs.existsSync(capacitorConfigPath)) {
  console.log('❌ capacitor.config.js não encontrado');
  process.exit(1);
}

const capacitorConfig = require(capacitorConfigPath);
console.log(`✅ Capacitor config encontrado:`);
console.log(`   - App ID: ${capacitorConfig.appId}`);
console.log(`   - App Name: ${capacitorConfig.appName}`);
console.log(`   - Web Dir: ${capacitorConfig.webDir}`);

// 6. Verificar se o diretório android existe
console.log('\n3. Verificando projeto Android...');
const androidDir = path.join(__dirname, '../android');
if (!fs.existsSync(androidDir)) {
  console.log('❌ Diretório android não encontrado. Execute "npx cap add android" primeiro.');
  process.exit(1);
}

console.log('✅ Diretório android encontrado');

// 7. Verificar se os assets foram copiados
const androidAssetsDir = path.join(androidDir, 'app/src/main/assets');
if (!fs.existsSync(androidAssetsDir)) {
  console.log('❌ Diretório assets não encontrado no Android');
  console.log('Execute "npx cap sync" para copiar os assets');
  process.exit(1);
}

const assetFiles = fs.readdirSync(androidAssetsDir);
console.log(`✅ Assets encontrados: ${assetFiles.length} arquivos`);

// 8. Verificar se o index.html foi copiado para assets
const androidIndexHtml = path.join(androidAssetsDir, 'index.html');
if (!fs.existsSync(androidIndexHtml)) {
  console.log('❌ index.html não encontrado nos assets do Android');
  console.log('Execute "npx cap sync" para copiar os arquivos');
  process.exit(1);
}

console.log('✅ index.html copiado para assets do Android');

// 9. Verificar configuração do Android
console.log('\n4. Verificando configuração do Android...');
const androidManifestPath = path.join(androidDir, 'app/src/main/AndroidManifest.xml');
if (fs.existsSync(androidManifestPath)) {
  const manifest = fs.readFileSync(androidManifestPath, 'utf8');
  if (manifest.includes('android:usesCleartextTraffic="true"')) {
    console.log('✅ Cleartext traffic habilitado');
  } else {
    console.log('⚠️ Cleartext traffic não encontrado no manifest');
  }
} else {
  console.log('❌ AndroidManifest.xml não encontrado');
}

// 10. Sugestões de correção
console.log('\n5. Sugestões para resolver tela branca:');
console.log('   a) Limpe o cache do Next.js:');
console.log('      rm -rf .next out');
console.log('      npm run build');
console.log('');
console.log('   b) Sincronize o Capacitor:');
console.log('      npx cap sync');
console.log('');
console.log('   c) Limpe o build do Android:');
console.log('      cd android && ./gradlew clean && cd ..');
console.log('');
console.log('   d) Rebuild completo:');
console.log('      npm run build && npx cap sync && cd android && ./gradlew assembleDebug');
console.log('');
console.log('   e) Verifique se o servidor está rodando na URL configurada:');
console.log(`      ${capacitorConfig.server?.url || 'URL não configurada'}`);

// 11. Verificar se há erros no build
console.log('\n6. Verificando logs de build...');
try {
  const buildLog = execSync('cd android && ./gradlew assembleDebug --info', { 
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 10 // 10MB
  });
  
  if (buildLog.includes('BUILD SUCCESSFUL')) {
    console.log('✅ Build do Android bem-sucedido');
  } else if (buildLog.includes('BUILD FAILED')) {
    console.log('❌ Build do Android falhou');
    console.log('Verifique os logs acima para erros específicos');
  }
} catch (error) {
  console.log('❌ Erro ao executar build do Android:');
  console.log(error.message);
}

console.log('\n🎯 Diagnóstico concluído!');
console.log('Se ainda houver tela branca, verifique:');
console.log('1. Se o servidor está rodando na URL correta');
console.log('2. Se há erros no console do Android Studio');
console.log('3. Se a rede está funcionando no dispositivo');
console.log('4. Se as permissões estão configuradas corretamente'); 