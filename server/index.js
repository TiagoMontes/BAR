const express = require('express');
const cors = require('cors');
const path = require('path');
const { validateOperadores } = require('../lib/validators');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3001;

// Define the data directory path (parent directory)
const DATA_DIR_DEFAULT = path.join(__dirname, '../../');
const DATA_DIR_JSON = path.join(__dirname, '../../JSon');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the out directory
app.use(express.static(path.join(__dirname, '../out')));

// Helper function to read JSON files
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
}

// Helper function to write JSON files
async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    throw error;
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Server is running'
  })
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const operadoresPath = path.join(DATA_DIR_JSON, 'operadores.json');
    const operadoresContent = await fs.readFile(operadoresPath, 'utf-8');
    const operadores = JSON.parse(operadoresContent);

    const operadoresControladorPath = path.join(DATA_DIR_JSON, 'operadoresControlador.json');
    const operadoresControladorContent = await fs.readFile(operadoresControladorPath, 'utf-8');
    const operadoresControlador = JSON.parse(operadoresControladorContent);

    if (!validateOperadores(operadores)) {
      return res.status(500).json({ message: 'Invalid operadores data structure' });
    }

    const operador = operadores.find(
      op => op.Nome.toLowerCase() === username.toLowerCase() && op.Senha === password
    );

    if (!operador) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos' });
    }

    // Buscar o objeto do operadoresControlador usando o ID que corresponde à senha do operador
    const operadorControlador = operadoresControlador.find(
      oc => oc.Id === operador.Senha
    );

    if (!operadorControlador) {
      return res.status(401).json({ message: 'Operador não encontrado no controlador' });
    }

    // Check for active sessions
    const sessoesPath = path.join(DATA_DIR_JSON, 'sessoes.json');
    const sessoesContent = await fs.readFile(sessoesPath, 'utf-8');
    const sessoesData = JSON.parse(sessoesContent);

    const sessaoAtiva = sessoesData.sessoes.find(s => s.operadorId === operadorControlador.Id);
    if (sessaoAtiva) {
      return res.status(409).json({ 
        message: 'Operador já está logado em outra sessão',
        sessaoAtiva: {
          operadorId: sessaoAtiva.operadorId,
          ultimoAcesso: sessaoAtiva.ultimoAcesso
        }
      });
    }

    // Create new session
    const novaSessao = {
      operadorId: operadorControlador.Id,
      inicio: new Date().toISOString(),
      ultimoAcesso: new Date().toISOString()
    };

    sessoesData.sessoes.push(novaSessao);
    await fs.writeFile(sessoesPath, JSON.stringify(sessoesData, null, 2));

    // Juntar todos os valores em um único objeto
    const userData = {
      user: {
        ...operador,
        ...operadorControlador,
      },
      sessao: novaSessao
    };

    // Remove password from response
    const { Senha, ...userDataSemSenha } = userData;

    res.status(200).json(userDataSemSenha);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  const { operadorId } = req.body;

  if (!operadorId) {
    return res.status(400).json({ message: 'Operador ID is required' });
  }

  try {
    const sessoesPath = path.join(DATA_DIR_JSON, 'sessoes.json');
    const sessoesContent = await fs.readFile(sessoesPath, 'utf-8');
    const sessoesData = JSON.parse(sessoesContent);

    // Remove session
    sessoesData.sessoes = sessoesData.sessoes.filter(s => s.operadorId !== operadorId);
    await fs.writeFile(sessoesPath, JSON.stringify(sessoesData, null, 2));

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Data routes
app.get('/api/operadores', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(DATA_DIR_JSON, 'operadores.json'), 'utf8');
    const operadores = JSON.parse(data);
    res.json(operadores);
  } catch (error) {
    console.error('Erro ao ler operadores:', error);
    res.status(500).json({ 
      error: true, 
      message: `Erro ao ler operadores: ${error.message}`,
      details: error.stack
    });
  }
});

app.get('/api/produtos', async (req, res) => {
  try {
    // Lê os produtos
    const produtosData = await fs.readFile(path.join(DATA_DIR_JSON, 'Produtos.json'), 'utf8');
    const produtos = JSON.parse(produtosData);

    // Lê o top12
    const top12Data = await fs.readFile(path.join(DATA_DIR_JSON, 'top12.json'), 'utf8');
    const top12 = JSON.parse(top12Data);

    // Cria um mapa de posição para cada produto do top12
    const top12Map = new Map(top12.map(item => [item.Id, item.Posicao]));

    // Ordena os produtos
    const produtosOrdenados = [...produtos].sort((a, b) => {
      const posicaoA = top12Map.get(a.Id);
      const posicaoB = top12Map.get(b.Id);

      // Se ambos estão no top12, ordena pela posição
      if (posicaoA !== undefined && posicaoB !== undefined) {
        return posicaoA - posicaoB;
      }
      // Se apenas A está no top12, A vem primeiro
      if (posicaoA !== undefined) {
        return -1;
      }
      // Se apenas B está no top12, B vem primeiro
      if (posicaoB !== undefined) {
        return 1;
      }
      // Se nenhum está no top12, mantém a ordem original
      return 0;
    });

    res.json(produtosOrdenados);
  } catch (error) {
    console.error('Erro ao ler produtos:', error);
    res.status(500).json({ 
      error: true, 
      message: `Erro ao ler produtos: ${error.message}`,
      details: error.stack
    });
  }
});

app.get('/api/comandas', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(DATA_DIR_JSON, 'comandas.json'), 'utf8');
    const comandas = JSON.parse(data);
    res.json(comandas);
  } catch (error) {
    console.error('Erro ao ler comandas:', error);
    res.status(500).json({ 
      error: true, 
      message: `Erro ao ler comandas: ${error.message}`,
      details: error.stack
    });
  }
});

app.post('/api/comandas/create', async (req, res) => {
  try {
    const { cliente } = req.body;

    if (!cliente) {
      return res.status(400).json({ message: 'Nome do cliente é obrigatório' });
    }

    // Criar pasta Comandas se não existir
    const comandasDir = path.join(DATA_DIR_DEFAULT, 'Comandas');
    try {
      await fs.mkdir(comandasDir, { recursive: true });
    } catch (error) {
      // Ignorar erro se o diretório já existir
    }

    // Ler comandas existentes para gerar novo ID
    const comandasPath = path.join(DATA_DIR_JSON, 'comandas.json');
    const comandas = await readJsonFile(comandasPath);
    
    // Gerar novo ID de comanda
    const lastId = comandas.length > 0 
      ? Math.max(...comandas.map(c => c.Idcomanda))
      : 0;
    const newId = lastId + 1;

    // Criar conteúdo do arquivo .cv no formato: id_da_comanda!nome_da_comanda!entrada_data
    const entradaData = new Date().toLocaleString('pt-BR');
    const cvContent = `${newId}!${cliente.toUpperCase()}!${entradaData}`;
    const cvFileName = `${String(newId).padStart(5, '0')}.cv`;
    const cvFilePath = path.join(comandasDir, cvFileName);
    
    await fs.writeFile(cvFilePath, cvContent, 'utf8');

    res.status(200).json({
      success: true,
      message: 'Arquivo .cv criado com sucesso',
      comandaId: newId,
      fileName: cvFileName
    });
  } catch (error) {
    console.error('Error creating .cv file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/comandas/remove', async (req, res) => {
  try {
    const { comandaId } = req.body;

    if (!comandaId) {
      return res.status(400).json({ message: 'O ID da comanda é obrigatório' });
    }

    // Ler o arquivo de comandas
    const comandasPath = path.join(DATA_DIR_JSON, 'comandas.json');
    const comandasData = await fs.readFile(comandasPath, 'utf8');
    const comandas = JSON.parse(comandasData);

    // Encontrar e remover a comanda
    const updatedComandas = comandas.filter(comanda => comanda.Idcomanda !== comandaId);

    // Escrever de volta no arquivo
    await fs.writeFile(comandasPath, JSON.stringify(updatedComandas, null, 2));

    res.status(200).json({ message: 'Comanda removida com sucesso' });
  } catch (error) {
    console.error('Error removing comanda:', error);
    res.status(500).json({ message: 'Erro ao remover comanda' });
  }
});

app.post('/api/comandas/close', async (req, res) => {
  try {
    const { comandaId } = req.body;
    if (!comandaId) {
      return res.status(400).json({ message: 'O ID da comanda é obrigatório.' });
    }

    const comandasPath = path.join(DATA_DIR_JSON, 'comandas.json');
    const comandas = await readJsonFile(comandasPath);
    
    const comandaIndex = comandas.findIndex(c => c.Idcomanda === comandaId);
    if (comandaIndex === -1) {
      return res.status(404).json({ message: 'Comanda não encontrada.' });
    }

    // Zera o saldo e muda o status para "fechada" (0)
    comandas[comandaIndex].saldo = 0;
    comandas[comandaIndex].status = 0;
    
    await writeJsonFile(comandasPath, comandas);

    res.status(200).json({ message: 'Comanda fechada com sucesso!' });
  } catch (error) {
    console.error('Erro ao fechar comanda:', error);
    res.status(500).json({ message: 'Erro no servidor ao fechar a comanda.', error: error.message });
  }
});

app.post('/api/vendas', async (req, res) => {
  try {
    const { comandaId, operadorId, items, atendentes } = req.body;

    // Validar dados
    if (!comandaId || !operadorId || !items || !Array.isArray(items)) {
      throw new Error('Dados incompletos: comandaId, operadorId e items são obrigatórios');
    }

    // Ler comandas existentes
    const comandasPath = path.join(DATA_DIR_JSON, 'comandas.json');
    const comandasData = await fs.readFile(comandasPath, 'utf8');
    const comandas = JSON.parse(comandasData);

    // Encontrar comanda
    const comandaIndex = comandas.findIndex(c => c.Idcomanda === comandaId);
    if (comandaIndex === -1) {
      throw new Error(`Comanda ${comandaId} não encontrada`);
    }

    // Ler produtos para calcular o valor total
    const produtosPath = path.join(DATA_DIR_JSON, 'Produtos.json');
    const produtosData = await fs.readFile(produtosPath, 'utf8');
    const produtos = JSON.parse(produtosData);

    // Calcular valor total da venda
    const valorTotal = items.reduce((total, item) => {
      const produto = produtos.find(p => p.Id === item.produtoId);
      return total + (produto ? produto.Preco * item.quantidade : 0);
    }, 0);

    // Atualizar comanda
    const comanda = comandas[comandaIndex];
    comanda.saldo = Number(comanda.saldo || 0) + valorTotal;

    // Salvar comandas atualizadas
    await fs.writeFile(comandasPath, JSON.stringify(comandas, null, 2));

    // Gerar cupomId sequencial
    const salesDir = path.join(DATA_DIR_DEFAULT, 'vendas');
    try {
      await fs.mkdir(salesDir, { recursive: true });
    } catch (error) {
      // Ignorar erro se o diretório já existir
    }

    // Obter todos os arquivos de cupom existentes
    const files = await fs.readdir(salesDir);
    const cupomFiles = files.filter(file => file.endsWith('.cv'));
    
    // Encontrar o maior cupomId
    let highestCupomId = 0;
    cupomFiles.forEach(file => {
      const cupomId = parseInt(file.split('-')[2].split('.')[0]);
      if (cupomId > highestCupomId) {
        highestCupomId = cupomId;
      }
    });

    // Gerar novo cupomId (incrementar em 1)
    const cupomId = highestCupomId + 1;

    // Criar arquivo de venda
    const saleContent = items.map(item => {
      const produto = produtos.find(p => p.Id === item.produtoId);
      const atendenteIds = produto?.Comissao > 0 ? (atendentes || []).join(',') : '';
      return `${item.produtoId}!${produto.Descricao}!${item.quantidade}!${atendenteIds}!`;
    }).join('\n');

    const saleFileName = `${String(comandaId).padStart(5, '0')}-${String(operadorId).padStart(2, '0')}-${String(cupomId).padStart(5, '0')}.cv`;
    
    await fs.writeFile(path.join(salesDir, saleFileName), saleContent);

    res.json({ 
      success: true, 
      message: 'Venda registrada com sucesso',
      cupomId,
      comanda 
    });
  } catch (error) {
    console.error('Erro ao registrar venda:', error);
    res.status(500).json({ 
      error: true, 
      message: `Erro ao registrar venda: ${error.message}`,
      details: error.stack
    });
  }
});

// Adicionar após as outras rotas e antes do catch-all route
app.get('/api/atendentes', async (req, res) => {
  try {
    const atendentesPath = path.join(DATA_DIR_JSON, 'atendentes.json');
    const atendentes = await readJsonFile(atendentesPath);
    
    // Validar estrutura dos dados
    if (!Array.isArray(atendentes)) {
      throw new Error('Invalid attendants data structure');
    }

    // Filtrar atendentes presentes e ativos
    const presentAtendentes = atendentes.filter(
      atendente => atendente.Presente === 1 && atendente.Situacao === 1
    );

    res.status(200).json(presentAtendentes);
  } catch (error) {
    console.error('Error fetching attendants:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Internal server error',
      details: error.message 
    });
  }
});

// Get sales data for a specific comanda
app.get('/api/vendas/comanda/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Read produtos.json to get prices
    const produtosPath = path.join(DATA_DIR_JSON, 'produtos.json');
    const produtosContent = await fs.readFile(produtosPath, 'utf-8');
    const produtos = JSON.parse(produtosContent);

    const salesDir = path.join(DATA_DIR_DEFAULT, 'vendas');
    const files = await fs.readdir(salesDir);
    
    // Filter files for this comanda
    const comandaFiles = files.filter(file => 
      file.startsWith(String(id).padStart(5, '0'))
    );

    // Read and parse each sale file
    const vendasData = await Promise.all(
      comandaFiles.map(async (file) => {
        const content = await fs.readFile(path.join(salesDir, file), 'utf-8');
        const items = content.split('\n').filter(Boolean).map(line => {
          const [produtoId, descricao, quantidade, atendenteIds] = line.split('!');
          const produto = produtos.find(p => p.Id === Number(produtoId));
          
          // Parse atendente IDs - handle both empty string and comma-separated values
          const atendentes = atendenteIds ? 
            atendenteIds.split(',').filter(id => id).map(Number) : 
            [];

          // Se o produto não for encontrado, use valores padrão
          if (!produto) {
            console.warn(`Produto não encontrado: ID ${produtoId}`);
            return {
              produtoId: Number(produtoId),
              descricao,
              quantidade: Number(quantidade),
              atendentes,
              preco: 0,
              comissao: 0
            };
          }

          return {
            produtoId: Number(produtoId),
            descricao,
            quantidade: Number(quantidade),
            atendentes,
            preco: produto.Preco || 0,
            comissao: produto.Comissao || 0
          };
        });

        const total = items.reduce((sum, item) => sum + (item.quantidade * item.preco), 0);

        return {
          fileName: file,
          items,
          total
        };
      })
    );

    res.status(200).json(vendasData);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Error fetching sales data',
      details: error.message 
    });
  }
});

// Catch all route to serve the Next.js app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../out/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
}); 