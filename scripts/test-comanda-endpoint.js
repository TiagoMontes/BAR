const fetch = require('node-fetch');

async function testComandaEndpoint() {
  try {
    console.log('🧪 Testando endpoint de vendas de comanda...\n');
    
    // Testar com uma comanda que sabemos que tem vendas (comanda 8)
    const comandaId = 8;
    const serverUrl = 'http://localhost:3001';
    
    console.log(`🔍 Testando comanda ID: ${comandaId}`);
    console.log(`🌐 URL: ${serverUrl}/api/vendas/comanda/${comandaId}`);
    
    const response = await fetch(`${serverUrl}/api/vendas/comanda/${comandaId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const vendasData = await response.json();
    
    console.log(`\n📊 Resposta do servidor:`);
    console.log(`   - Status: ${response.status}`);
    console.log(`   - Total de vendas: ${vendasData.length}`);
    
    if (vendasData.length === 0) {
      console.log('   ⚠️  Nenhuma venda encontrada para esta comanda');
      return;
    }
    
    console.log('\n📋 Dados das vendas:');
    vendasData.forEach((venda, index) => {
      console.log(`\n   Venda ${index + 1}:`);
      console.log(`   - fileName: "${venda.fileName}"`);
      console.log(`   - cupomId: "${venda.cupomId}"`);
      console.log(`   - total: R$ ${venda.total}`);
      console.log(`   - items: ${venda.items.length} itens`);
      
      // Testar extração manual do cupomId
      const extractedCupomId = venda.fileName?.split('-')[2]?.split('.')[0] || 'N/A';
      console.log(`   - cupomId extraído manualmente: "${extractedCupomId}"`);
      
      if (venda.cupomId !== extractedCupomId) {
        console.log(`   ❌ PROBLEMA: cupomId do servidor (${venda.cupomId}) ≠ extraído manualmente (${extractedCupomId})`);
      } else {
        console.log(`   ✅ OK: cupomId correto`);
      }
    });
    
    console.log('\n✅ Teste do endpoint concluído!');
    
  } catch (error) {
    console.error('❌ Erro ao testar endpoint:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dica: Certifique-se de que o servidor está rodando na porta 3001');
      console.log('   Execute: npm run dev ou node server/index.js');
    }
  }
}

testComandaEndpoint(); 