const fs = require('fs').promises;
const path = require('path');

async function testConfig() {
  try {
    console.log('🧪 Testando carregamento das configurações...\n');
    
    // Caminho para o arquivo config.json
    const configPath = path.join(__dirname, '../../JSon/config.json');
    
    // Verificar se o arquivo existe
    try {
      await fs.access(configPath);
      console.log('✅ Arquivo config.json encontrado');
    } catch (error) {
      console.log('❌ Arquivo config.json não encontrado em:', configPath);
      return;
    }
    
    // Ler o arquivo de configuração
    const configData = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configData);
    
    console.log('📄 Conteúdo do arquivo config.json:');
    console.log(JSON.stringify(config, null, 2));
    console.log('\n');
    
    // Verificar se é um array e pegar o primeiro item
    const configObj = Array.isArray(config) ? config[0] : config;
    
    console.log('🔍 Configurações extraídas:');
    console.log(`Nome da sala: "${configObj["nome sala"] || 'Não definido'}"`);
    console.log(`Senha diária: "${configObj["senha diaria"] || 'Não definida'}"`);
    console.log(`Imprimir: ${configObj.imprimir === 1 ? 'Habilitado' : 'Desabilitado'}`);
    console.log(`Comissão: ${configObj.comissao === 1 ? 'Habilitada' : 'Desabilitada'}`);
    console.log(`Nome cliente: ${configObj["nome cliente"] === 1 ? 'Habilitado' : 'Desabilitado'}`);
    console.log(`Comanda inicial: ${configObj["comanda inicial"] || 'Não definida'}`);
    
    console.log('\n📋 Comportamento da criação de comandas:');
    if (configObj["nome cliente"] === 1) {
      console.log('✅ Nome do cliente HABILITADO');
      console.log('   - Campo "Nome do Cliente" será exibido');
      console.log('   - Campo "Número da Comanda" será exibido');
      console.log('   - Nome da comanda: "Nome - Número"');
      console.log('   - Exemplo: "João - 001"');
    } else {
      console.log('❌ Nome do cliente DESABILITADO');
      console.log('   - Apenas campo "Número da Comanda" será exibido');
      console.log('   - Nome da comanda: apenas o número');
      console.log('   - Exemplo: "001"');
    }
    
    console.log('\n✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao testar configurações:', error.message);
  }
}

testConfig(); 