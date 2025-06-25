const fs = require('fs').promises;
const path = require('path');

async function testConfigLogic() {
  try {
    console.log('🧪 Testando lógica de configuração...\n');
    
    // Ler configuração
    const configPath = path.join(__dirname, '../../JSon/config.json');
    const configData = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configData);
    const configObj = Array.isArray(config) ? config[0] : config;
    
    console.log('📋 Configuração atual:');
    console.log(`   - comanda inicial: ${configObj["comanda inicial"]}`);
    console.log(`   - cupom inicial: ${configObj["cupom inicial"]}`);
    
    // Testar lógica de comanda inicial
    console.log('\n🎯 Teste da lógica de comanda inicial:');
    const comandaInicial = configObj["comanda inicial"] || 5001;
    
    if (comandaInicial === 0) {
      console.log('   ✅ Comanda inicial = 0: Usará sequencial (1, 2, 3...)');
    } else {
      console.log(`   ✅ Comanda inicial = ${comandaInicial}: Primeira comanda será ${comandaInicial}`);
    }
    
    // Testar lógica de cupom inicial
    console.log('\n🎫 Teste da lógica de cupom inicial:');
    const cupomInicial = configObj["cupom inicial"] || 5001;
    
    if (cupomInicial === 0) {
      console.log('   ✅ Cupom inicial = 0: Usará sequencial (1, 2, 3...)');
    } else {
      console.log(`   ✅ Cupom inicial = ${cupomInicial}: Primeiro cupom será ${cupomInicial}`);
    }
    
    // Verificar arquivos existentes
    console.log('\n📁 Verificando arquivos existentes:');
    
    // Verificar comandas
    try {
      const comandasPath = path.join(__dirname, '../JSon/comandas.json');
      const comandasData = await fs.readFile(comandasPath, 'utf8');
      const comandas = JSON.parse(comandasData);
      console.log(`   - Comandas existentes: ${comandas.length}`);
      if (comandas.length > 0) {
        const ids = comandas.map(c => c.Idcomanda).sort((a, b) => a - b);
        console.log(`   - IDs de comandas: ${ids.join(', ')}`);
        console.log(`   - Maior ID: ${Math.max(...ids)}`);
      }
    } catch (error) {
      console.log('   - Nenhuma comanda encontrada');
    }
    
    // Verificar cupons
    try {
      const salesDir = path.join(__dirname, '../../rivaldo2/Vendas');
      const files = await fs.readdir(salesDir);
      const cupomFiles = files.filter(file => file.endsWith('.cv'));
      console.log(`   - Cupons existentes: ${cupomFiles.length}`);
      if (cupomFiles.length > 0) {
        const cupomIds = cupomFiles.map(file => {
          const cupomId = parseInt(file.split('-')[2].split('.')[0]);
          return cupomId;
        }).sort((a, b) => a - b);
        console.log(`   - IDs de cupons: ${cupomIds.join(', ')}`);
        console.log(`   - Maior cupomId: ${Math.max(...cupomIds)}`);
      }
    } catch (error) {
      console.log('   - Nenhum cupom encontrado');
    }
    
    console.log('\n✅ Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro ao testar:', error.message);
  }
}

testConfigLogic(); 