const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3001;

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
  res.json({ status: 'ok' });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const operadores = await readJsonFile(path.join(__dirname, '../data/operadores.json'));
    
    const operador = operadores.find(op => 
      op.Usuario === username && op.Senha === password
    );

    if (operador) {
      res.json({ 
        success: true, 
        user: {
          id: operador.Id,
          name: operador.Nome,
          username: operador.Usuario,
          role: operador.Nivel === 1 ? 'admin' : 'operador'
        }
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Usuário ou senha inválidos' 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao fazer login' 
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

// Data routes
app.get('/api/operadores', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/operadores.json'), 'utf8');
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
    const data = await fs.readFile(path.join(__dirname, '../data/produtos.json'), 'utf8');
    const produtos = JSON.parse(data);
    res.json(produtos);
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
    const data = await fs.readFile(path.join(__dirname, '../data/comandas.json'), 'utf8');
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
    const comandas = await readJsonFile(path.join(__dirname, '../data/comandas.json'));
    const newComanda = {
      Idcomanda: Date.now(),
      ...req.body,
      Entrada: new Date().toLocaleString('pt-BR')
    };
    comandas.push(newComanda);
    await writeJsonFile(path.join(__dirname, '../data/comandas.json'), comandas);
    res.json(newComanda);
  } catch (error) {
    console.error('Error creating comanda:', error);
    res.status(500).json({ error: 'Erro ao criar comanda' });
  }
});

app.post('/api/comandas/remove', async (req, res) => {
  try {
    const { id } = req.body;
    const comandas = await readJsonFile(path.join(__dirname, '../data/comandas.json'));
    const filteredComandas = comandas.filter(c => c.Idcomanda !== id);
    await writeJsonFile(path.join(__dirname, '../data/comandas.json'), filteredComandas);
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing comanda:', error);
    res.status(500).json({ error: 'Erro ao remover comanda' });
  }
});

app.post('/api/comandas/close', async (req, res) => {
  try {
    const { comandaId } = req.body;
    if (!comandaId) {
      return res.status(400).json({ message: 'O ID da comanda é obrigatório.' });
    }

    const comandasPath = path.join(__dirname, '../data/comandas.json');
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
    const comandasPath = path.join(__dirname, '../data/comandas.json');
    const comandasData = await fs.readFile(comandasPath, 'utf8');
    const comandas = JSON.parse(comandasData);

    // Encontrar comanda
    const comandaIndex = comandas.findIndex(c => c.Idcomanda === comandaId);
    if (comandaIndex === -1) {
      throw new Error(`Comanda ${comandaId} não encontrada`);
    }

    // Ler produtos para calcular o valor total
    const produtosPath = path.join(__dirname, '../data/produtos.json');
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
    const salesDir = path.join(__dirname, '../data/vendas');
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
      const atendenteIds = produto?.Comissao === 1 ? (atendentes || []).join(',') : '';
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
    const atendentesPath = path.join(__dirname, '../data/atendentes.json');
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

// Catch all route to serve the Next.js app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../out/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
}); 