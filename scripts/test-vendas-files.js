const fs = require('fs').promises;
const path = require('path');

async function testVendasFiles() {
  try {
    console.log('🧪 Testando arquivos de vendas...\n');
    
    // Caminho para a pasta vendas
    const vendasDir = path.join(__dirname, '../../vendas');
    
    // Verificar se a pasta existe
    try {
      await fs.access(vendasDir);
      console.log('✅ Pasta vendas encontrada');
    } catch (error) {
      console.log('❌ Pasta vendas não encontrada em:', vendasDir);
      return;
    }
    
    // Ler todos os arquivos da pasta vendas
    const files = await fs.readdir(vendasDir);
    const cvFiles = files.filter(file => file.endsWith('.cv'));
    
    console.log(`📁 Total de arquivos na pasta vendas: ${files.length}`);
    console.log(`🎫 Arquivos .cv encontrados: ${cvFiles.length}`);
    
    if (cvFiles.length === 0) {
      console.log('\n⚠️  Nenhum arquivo .cv encontrado na pasta vendas');
      console.log('   Isso pode explicar por que o cupomId está vindo como "N/A"');
      return;
    }
    
    console.log('\n📋 Arquivos .cv encontrados:');
    cvFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });
    
    console.log('\n🔍 Análise da estrutura dos nomes dos arquivos:');
    cvFiles.forEach((file, index) => {
      const parts = file.split('-');
      console.log(`\n   Arquivo ${index + 1}: ${file}`);
      console.log(`   Partes separadas por '-': ${parts.length}`);
      
      if (parts.length >= 3) {
        const comandaId = parts[0];
        const operadorId = parts[1];
        const cupomPart = parts[2];
        const cupomId = cupomPart.split('.')[0];
        
        console.log(`   - Comanda ID: ${comandaId}`);
        console.log(`   - Operador ID: ${operadorId}`);
        console.log(`   - Cupom ID: ${cupomId}`);
        console.log(`   - Extensão: ${cupomPart.split('.')[1] || 'N/A'}`);
      } else {
        console.log(`   ❌ Estrutura inválida: esperado formato "comanda-operador-cupom.cv"`);
      }
    });
    
    // Testar extração do cupomId
    console.log('\n🧪 Teste de extração do cupomId:');
    cvFiles.forEach((file, index) => {
      const cupomId = file.split('-')[2]?.split('.')[0] || 'N/A';
      console.log(`   ${file} → cupomId: ${cupomId}`);
    });
    
    console.log('\n✅ Teste de arquivos de vendas concluído!');
    
  } catch (error) {
    console.error('❌ Erro ao testar arquivos de vendas:', error.message);
  }
}

testVendasFiles(); 