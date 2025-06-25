const fetch = require('node-fetch');

async function checkServer() {
  try {
    console.log('🔍 Verificando se o servidor está rodando...\n');
    
    const serverUrl = 'http://localhost:3001';
    
    // Testar endpoint de health
    console.log(`🌐 Testando: ${serverUrl}/api/health`);
    const healthResponse = await fetch(`${serverUrl}/api/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Servidor está rodando!');
      console.log('   Status:', healthData.status);
      console.log('   Timestamp:', healthData.timestamp);
      
      // Testar endpoint de vendas
      console.log('\n🧪 Testando endpoint de vendas...');
      const vendasResponse = await fetch(`${serverUrl}/api/vendas/comanda/8`);
      
      if (vendasResponse.ok) {
        const vendasData = await vendasResponse.json();
        console.log(`✅ Endpoint de vendas funcionando!`);
        console.log(`   Total de vendas: ${vendasData.length}`);
        
        if (vendasData.length > 0) {
          const primeiraVenda = vendasData[0];
          console.log(`\n📋 Primeira venda:`);
          console.log(`   - fileName: "${primeiraVenda.fileName}"`);
          console.log(`   - cupomId: "${primeiraVenda.cupomId}"`);
          console.log(`   - total: R$ ${primeiraVenda.total}`);
          
          if (primeiraVenda.cupomId === 'undefined' || primeiraVenda.cupomId === undefined) {
            console.log(`\n❌ PROBLEMA: cupomId ainda está vindo como "undefined"`);
            console.log(`   Isso indica que o servidor precisa ser reiniciado para aplicar as mudanças`);
            console.log(`\n💡 Solução:`);
            console.log(`   1. Pare o servidor (Ctrl+C)`);
            console.log(`   2. Reinicie o servidor: npm run dev ou node server/index.js`);
            console.log(`   3. Execute este teste novamente`);
          } else {
            console.log(`\n✅ PROBLEMA RESOLVIDO: cupomId está correto!`);
          }
        }
      } else {
        console.log(`❌ Erro no endpoint de vendas: ${vendasResponse.status}`);
      }
      
    } else {
      console.log('❌ Servidor não está respondendo');
      console.log('   Status:', healthResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar servidor:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 O servidor não está rodando');
      console.log('   Execute: npm run dev ou node server/index.js');
    }
  }
}

checkServer(); 