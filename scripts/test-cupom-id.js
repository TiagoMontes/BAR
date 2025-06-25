async function testCupomId() {
  try {
    console.log('🧪 Testando cupomId no servidor...\n');
    
    // Testar endpoint de vendas para comanda 1
    const response = await fetch('http://localhost:3001/api/vendas/comanda/1');
    const vendas = await response.json();
    
    console.log(`📊 Total de vendas encontradas: ${vendas.length}`);
    
    if (vendas.length === 0) {
      console.log('❌ Nenhuma venda encontrada para testar');
      return;
    }
    
    vendas.forEach((venda, index) => {
      console.log(`\n🎫 Venda ${index + 1}:`);
      console.log(`   - fileName: "${venda.fileName}"`);
      console.log(`   - cupomId: "${venda.cupomId}"`);
      console.log(`   - total: R$ ${venda.total}`);
      
      // Testar extração manual do cupomId
      const extractedCupomId = venda.fileName?.split('-')[2]?.split('.')[0] || 'N/A';
      console.log(`   - cupomId extraído manualmente: "${extractedCupomId}"`);
      
      if (venda.cupomId === 'N/A' || venda.cupomId === 'undefined' || venda.cupomId === undefined) {
        console.log(`   ❌ PROBLEMA: cupomId está vindo como "${venda.cupomId}"`);
        console.log(`   💡 Solução: O servidor não está extraindo o cupomId corretamente`);
      } else if (venda.cupomId !== extractedCupomId) {
        console.log(`   ❌ PROBLEMA: cupomId do servidor (${venda.cupomId}) ≠ extraído manualmente (${extractedCupomId})`);
      } else {
        console.log(`   ✅ OK: cupomId correto`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao testar:', error.message);
  }
}

testCupomId(); 