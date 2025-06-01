import { readJsonFile, writeJsonFile, validateData, schemas } from '../../lib/database'
import fs from 'fs/promises'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { comandaId, operadorId, cupomId, items } = req.body

    if (!comandaId || !operadorId || !cupomId || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid sale data' })
    }

    // Validate comanda exists
    const comandas = await readJsonFile('comandas.json')
    const comanda = comandas.find(c => c.Idcomanda === comandaId)
    
    if (!comanda) {
      return res.status(404).json({ message: 'Command not found' })
    }

    // Calculate total sale amount
    const produtos = await readJsonFile('produtos.json')
    const totalAmount = items.reduce((total, item) => {
      const produto = produtos.find(p => p.Id === item.produtoId)
      return total + (produto ? produto.Preco * item.quantidade : 0)
    }, 0)

    // Update comanda balance (add to spent amount)
    comanda.saldo += totalAmount
    await writeJsonFile('comandas.json', comandas)

    // Create sale file
    const saleContent = items.map(item => {
      const produto = produtos.find(p => p.Id === item.produtoId)
      return `${item.produtoId}!${produto.Descricao}!${item.quantidade}!${item.atendenteId}!`
    }).join('\n')

    const saleFileName = `${String(comandaId).padStart(5, '0')}-${String(operadorId).padStart(2, '0')}-${String(cupomId).padStart(5, '0')}.cv`
    const salesDir = path.join(process.cwd(), 'data', 'vendas')
    
    try {
      await fs.mkdir(salesDir, { recursive: true })
    } catch (error) {
      // Ignore error if directory already exists
    }

    await fs.writeFile(path.join(salesDir, saleFileName), saleContent)

    res.status(200).json({ message: 'Sale registered successfully' })
  } catch (error) {
    console.error('Error registering sale:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
} 