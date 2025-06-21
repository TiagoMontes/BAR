const fs = require('fs').promises;
const path = require('path');

// Define the vendas directory path
const VENDAS_DIR = path.join(__dirname, '../../Historico');
const COMANDAS_PATH = path.join(__dirname, '../../JSon/comandas.json');

async function limparVendas() {
  try {
    console.log('🧹 Iniciando limpeza da pasta vendas...');

    // Verificar se a pasta vendas existe
    try {
      await fs.access(VENDAS_DIR);
    } catch (error) {
      console.log('⚠️  Pasta vendas não encontrada. Criando pasta vazia.');
      await fs.mkdir(VENDAS_DIR, { recursive: true });
      console.log('✅ Pasta vendas criada com sucesso!');
      // Mesmo que a pasta não existisse, ainda vamos tentar fechar as comandas
    }

    // Ler todos os arquivos da pasta vendas
    const files = await fs.readdir(VENDAS_DIR);
    
    if (files.length === 0) {
      console.log('ℹ️  Pasta vendas já está vazia.');
    } else {
      console.log(`📋 Encontrados ${files.length} arquivos na pasta vendas`);

      // Contador de arquivos removidos
      let arquivosRemovidos = 0;

      // Remover cada arquivo
      for (const file of files) {
        const filePath = path.join(VENDAS_DIR, file);
        await fs.unlink(filePath);
        console.log(`🗑️  Removido: ${file}`);
        arquivosRemovidos++;
      }

      console.log(`\n✅ Limpeza concluída com sucesso!`);
      console.log(`   - Arquivos removidos: ${arquivosRemovidos}`);
    }

    // Fechar todas as comandas
    try {
      const comandasContent = await fs.readFile(COMANDAS_PATH, 'utf-8');
      const comandas = JSON.parse(comandasContent);
      let alterou = false;
      for (const comanda of comandas) {
        if (comanda.saldo !== 0 || comanda.status !== 0) {
          comanda.saldo = 0;
          comanda.status = 0;
          alterou = true;
        }
      }
      if (alterou) {
        await fs.writeFile(COMANDAS_PATH, JSON.stringify(comandas, null, 2), 'utf-8');
        console.log('🔒 Todas as comandas foram fechadas (saldo zerado e status = 0).');
      } else {
        console.log('ℹ️  Todas as comandas já estavam fechadas.');
      }
    } catch (error) {
      console.error('❌ Erro ao tentar fechar as comandas:', error.message);
    }

  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error.message);
    process.exit(1);
  }
}

// Executar o script se for chamado diretamente
if (require.main === module) {
  limparVendas();
}

module.exports = limparVendas; 