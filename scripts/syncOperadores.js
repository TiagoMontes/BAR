const fs = require('fs').promises;
const path = require('path');

// Define the data directory path
const DATA_DIR_JSON = path.join(__dirname, '../../JSon');

async function syncOperadores() {
  try {
    console.log('🔄 Iniciando sincronização de operadores...');

    // Ler o arquivo de operadores
    const operadoresPath = path.join(DATA_DIR_JSON, 'operadores.json');
    const operadoresContent = await fs.readFile(operadoresPath, 'utf-8');
    const operadores = JSON.parse(operadoresContent);

    console.log(`📋 Encontrados ${operadores.length} operadores no arquivo operadores.json`);

    // Ler o arquivo de operadoresControlador atual
    const operadoresControladorPath = path.join(DATA_DIR_JSON, 'operadoresControlador.json');
    let operadoresControlador = [];
    
    try {
      const operadoresControladorContent = await fs.readFile(operadoresControladorPath, 'utf-8');
      operadoresControlador = JSON.parse(operadoresControladorContent);
      console.log(`📋 Encontrados ${operadoresControlador.length} registros no operadoresControlador.json`);
    } catch (error) {
      console.log('⚠️  Arquivo operadoresControlador.json não encontrado ou inválido. Criando novo arquivo.');
    }

    // Criar um mapa dos IDs existentes no controlador para evitar duplicatas
    const existingIds = new Set(operadoresControlador.map(op => op.Id));
    
    // Array para novos operadores a serem adicionados
    const novosOperadores = [];

    // Processar cada operador
    operadores.forEach((operador, index) => {
      const operadorId = operador['Id operador']; // Usar o "Id operador" como ID
      
      if (!existingIds.has(operadorId)) {
        // Criar novo objeto no controlador
        const novoOperadorControlador = {
          Id: operadorId,
          Usuario: operador.Nome.toLowerCase().replace(/\s+/g, ''), // Nome sem espaços e em minúsculo
          Ativo: true
        };
        
        novosOperadores.push(novoOperadorControlador);
        existingIds.add(operadorId);
        
        console.log(`✅ Novo operador adicionado: ${operador.Nome} (ID: ${operadorId})`);
      } else {
        console.log(`ℹ️  Operador já existe no controlador: ${operador.Nome} (ID: ${operadorId})`);
      }
    });

    // Adicionar novos operadores ao array existente
    if (novosOperadores.length > 0) {
      operadoresControlador.push(...novosOperadores);
      
      // Salvar o arquivo atualizado
      await fs.writeFile(operadoresControladorPath, JSON.stringify(operadoresControlador, null, 2), 'utf-8');
      
      console.log(`💾 Arquivo operadoresControlador.json atualizado com ${novosOperadores.length} novos registros`);
    } else {
      console.log('ℹ️  Nenhum novo operador para adicionar');
    }

    // Mostrar resumo final
    console.log('\n📊 Resumo da sincronização:');
    console.log(`   - Operadores no arquivo operadores.json: ${operadores.length}`);
    console.log(`   - Registros no operadoresControlador.json: ${operadoresControlador.length}`);
    console.log(`   - Novos registros adicionados: ${novosOperadores.length}`);
    
    console.log('\n✅ Sincronização concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante a sincronização:', error.message);
    process.exit(1);
  }
}

// Executar o script se for chamado diretamente
if (require.main === module) {
  syncOperadores();
}

module.exports = syncOperadores; 