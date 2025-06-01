import { readJsonFile, writeJsonFile, validateData, schemas } from '../../lib/database'
import fs from 'fs/promises'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { comandaId, operadorId, items, atendentes } = req.body

    if (!comandaId || !operadorId || !items || !Array.isArray(items)) {
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

    // Generate sequential cupomId
    const salesDir = path.join(process.cwd(), 'data', 'vendas')
    try {
      await fs.mkdir(salesDir, { recursive: true })
    } catch (error) {
      // Ignore error if directory already exists
    }

    // Get all existing cupom files
    const files = await fs.readdir(salesDir)
    const cupomFiles = files.filter(file => file.endsWith('.cv'))
    
    // Find the highest cupomId
    let highestCupomId = 0
    cupomFiles.forEach(file => {
      const cupomId = parseInt(file.split('-')[2].split('.')[0])
      if (cupomId > highestCupomId) {
        highestCupomId = cupomId
      }
    })

    // Generate new cupomId (increment by 1)
    const cupomId = highestCupomId + 1

    // Create sale file
    const saleContent = items.map(item => {
      const produto = produtos.find(p => p.Id === item.produtoId)
      const atendenteIds = produto?.Comissao === 1 ? (atendentes || []).join(',') : ''
      return `${item.produtoId}!${produto.Descricao}!${item.quantidade}!${atendenteIds}!`
    }).join('\n')

    const saleFileName = `${String(comandaId).padStart(5, '0')}-${String(operadorId).padStart(2, '0')}-${String(cupomId).padStart(5, '0')}.cv`
    
    await fs.writeFile(path.join(salesDir, saleFileName), saleContent)

    res.status(200).json({ message: 'Sale registered successfully', cupomId })
  } catch (error) {
    console.error('Error creating/checking comanda:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
} 