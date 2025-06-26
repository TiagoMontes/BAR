const fs = require('fs').promises;
const path = require('path');

async function testVendasEndpoint() {
  try {
    console.log('🧪 Testando endpoint de vendas...\n');
    
    // Testar caminho da pasta vendas
    const salesDir = path.join(__dirname, '../../vendas');
    console.log(`📁 Caminho da pasta vendas: ${salesDir}`);
    
    try {
      const stats = await fs.stat(salesDir);
      console.log(`✅ Pasta vendas existe: ${stats.isDirectory() ? 'Sim' : 'Não'}`);
    } catch (error) {
      console.log(`❌ Pasta vendas não existe: ${error.message}`);
      console.log('💡 Criando pasta vendas...');
      await fs.mkdir(salesDir, { recursive: true });
      console.log('✅ Pasta vendas criada');
    }
    
    // Listar arquivos na pasta vendas
    try {
      const files = await fs.readdir(salesDir);
      console.log(`📄 Arquivos na pasta vendas: ${files.length}`);
      if (files.length > 0) {
        console.log('   Arquivos encontrados:');
        files.forEach(file => {
          console.log(`   - ${file}`);
        });
      }
    } catch (error) {
      console.log(`❌ Erro ao listar arquivos: ${error.message}`);
    }
    
    // Testar arquivo produtos.json
    const produtosPath = path.join(__dirname, '../../JSon/produtos.json');
    console.log(`\n📋 Testando arquivo produtos.json: ${produtosPath}`);
    
    try {
      const produtosContent = await fs.readFile(produtosPath, 'utf-8');
      const produtos = JSON.parse(produtosContent);
      console.log(`✅ Produtos carregados: ${produtos.length} produtos`);
    } catch (error) {
      console.log(`❌ Erro ao carregar produtos: ${error.message}`);
    }
    
    // Simular busca por comanda 6
    console.log('\n🎯 Simulando busca por comanda 6:');
    try {
      const files = await fs.readdir(salesDir);
      const comandaFiles = files.filter(file => 
        file.startsWith('00006')
      );
      console.log(`📄 Arquivos da comanda 6: ${comandaFiles.length}`);
      comandaFiles.forEach(file => {
        console.log(`   - ${file}`);
      });
    } catch (error) {
      console.log(`❌ Erro ao buscar arquivos da comanda 6: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testVendasEndpoint(); 