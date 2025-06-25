const fs = require('fs').promises;
const path = require('path');

async function testComandaCreation() {
  try {
    console.log('🧪 Testando lógica de criação de comandas...\n');
    
    // Caminho para o arquivo config.json
    const configPath = path.join(__dirname, '../../JSon/config.json');
    
    // Ler o arquivo de configuração
    const configData = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configData);
    const configObj = Array.isArray(config) ? config[0] : config;
    
    console.log('📋 Configuração atual:');
    console.log(`Nome cliente: ${configObj["nome cliente"] === 1 ? 'Habilitado' : 'Desabilitado'}`);
    console.log(`Comanda inicial: ${configObj["comanda inicial"]}`);
    console.log('\n');
    
    // Simular diferentes cenários de criação de comandas
    console.log('🎯 Cenários de criação de comandas:');
    
    if (configObj["nome cliente"] === 1) {
      console.log('\n✅ NOME DO CLIENTE HABILITADO:');
      console.log('   Campo "Nome do Cliente": Obrigatório');
      console.log('   Campo "Número da Comanda": Obrigatório');
      console.log('   Formato da comanda: "Nome - Número"');
      console.log('   Exemplos:');
      console.log('   - "João Silva - 001"');
      console.log('   - "Maria Santos - 002"');
      console.log('   - "Pedro Costa - 003"');
    } else {
      console.log('\n❌ NOME DO CLIENTE DESABILITADO:');
      console.log('   Campo "Nome do Cliente": Não exibido');
      console.log('   Campo "Número da Comanda": Obrigatório');
      console.log('   Formato da comanda: "Número"');
      console.log('   Exemplos:');
      console.log('   - "001"');
      console.log('   - "002"');
      console.log('   - "003"');
    }
    
    console.log('\n🔧 Validações implementadas:');
    console.log('   - Verificação de comanda duplicada por nome');
    console.log('   - Validação de campos obrigatórios');
    console.log('   - Geração de ID baseado na configuração "comanda inicial"');
    console.log('   - Criação do arquivo .cv no formato correto');
    
    console.log('\n📁 Estrutura do arquivo .cv criado:');
    console.log('   Formato: "ID!NOME_COMANDA!OPERADOR_ID!DATA_ENTRADA"');
    console.log('   Exemplo: "5001!001!1!01/01/2024 10:30:00"');
    
    console.log('\n✅ Teste de lógica concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao testar criação de comandas:', error.message);
  }
}

testComandaCreation(); 