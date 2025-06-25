const fs = require('fs').promises;
const path = require('path');

async function testComandaExamples() {
  try {
    console.log('🧪 Exemplos de configurações para teste...\n');
    
    console.log('📋 EXEMPLO 1: Nome do cliente DESABILITADO (configuração atual)');
    console.log('Arquivo config.json:');
    console.log(JSON.stringify({
      "nome sala": "TANGARA",
      "senha diaria": "Senha",
      "imprimir": 0,
      "comissao": 0,
      "nome cliente": 0,
      "comanda inicial": 5001
    }, null, 2));
    
    console.log('\n🎯 Comportamento esperado:');
    console.log('- Apenas campo "Número da Comanda" será exibido');
    console.log('- Comandas criadas: "001", "002", "003"...');
    console.log('- Não é necessário nome do cliente');
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    console.log('📋 EXEMPLO 2: Nome do cliente HABILITADO');
    console.log('Arquivo config.json:');
    console.log(JSON.stringify({
      "nome sala": "TANGARA",
      "senha diaria": "Senha",
      "imprimir": 1,
      "comissao": 1,
      "nome cliente": 1,
      "comanda inicial": 5001
    }, null, 2));
    
    console.log('\n🎯 Comportamento esperado:');
    console.log('- Campo "Nome do Cliente" será exibido');
    console.log('- Campo "Número da Comanda" será exibido');
    console.log('- Comandas criadas: "João - 001", "Maria - 002"...');
    console.log('- Ambos os campos são obrigatórios');
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    console.log('🔧 COMO TESTAR:');
    console.log('1. Altere o valor de "nome cliente" no arquivo config.json');
    console.log('2. Reinicie o servidor');
    console.log('3. Acesse a página de comandas');
    console.log('4. Clique em "Criar" para ver os campos disponíveis');
    console.log('5. Teste a criação de comandas com diferentes valores');
    
    console.log('\n📝 EXEMPLOS DE TESTE:');
    console.log('Com "nome cliente": 0');
    console.log('  - Número: "001" → Comanda: "001"');
    console.log('  - Número: "002" → Comanda: "002"');
    
    console.log('\nCom "nome cliente": 1');
    console.log('  - Nome: "João", Número: "001" → Comanda: "João - 001"');
    console.log('  - Nome: "Maria", Número: "002" → Comanda: "Maria - 002"');
    
    console.log('\n✅ Exemplos de teste concluídos!');
    
  } catch (error) {
    console.error('❌ Erro ao gerar exemplos:', error.message);
  }
}

testComandaExamples(); 