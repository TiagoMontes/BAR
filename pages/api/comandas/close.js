import { readJsonFile, writeJsonFile } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { comandaId } = req.body;

  if (!comandaId) {
    return res.status(400).json({ message: 'O ID da comanda é obrigatório.' });
  }

  try {
    const comandas = await readJsonFile('comandas.json');
    
    const comandaIndex = comandas.findIndex(c => c.Idcomanda === comandaId);

    if (comandaIndex === -1) {
      return res.status(404).json({ message: 'Comanda não encontrada.' });
    }

    // Zera o saldo e muda o status para "fechada" (0)
    comandas[comandaIndex].saldo = 0;
    comandas[comandaIndex].status = 0; 
    
    await writeJsonFile('comandas.json', comandas);

    res.status(200).json({ message: 'Comanda fechada com sucesso!' });
  } catch (error) {
    console.error('Erro ao fechar comanda:', error);
    res.status(500).json({ message: 'Erro no servidor ao fechar a comanda.', error: error.message });
  }
} 