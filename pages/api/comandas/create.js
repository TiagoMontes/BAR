import { readJsonFile, writeJsonFile, validateData, schemas } from '../../../lib/database'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { cliente } = req.body

    if (!cliente) {
      return res.status(400).json({ message: 'Nome do cliente é obrigatório' })
    }

    const comandas = await readJsonFile('comandas.json')
    
    if (!validateData(comandas, schemas.comandas)) {
      return res.status(500).json({ message: 'Invalid commands data structure' })
    }

    // Check if there's any comanda for this client (case insensitive)
    const existingComanda = comandas.find(
      c => c.Cliente.toUpperCase() === cliente.toUpperCase()
    )

    if (existingComanda) {
      return res.status(200).json({
        exists: true,
        comanda: existingComanda,
        message: 'Já existe uma comanda para este cliente'
      })
    }

    // Generate new comanda ID
    const lastId = comandas.length > 0 
      ? Math.max(...comandas.map(c => c.Idcomanda))
      : 0
    const newId = lastId + 1

    // Create new comanda
    const newComanda = {
      Idcomanda: newId,
      Cliente: cliente.toUpperCase(),
      saldo: 0,
      Entrada: new Date().toLocaleString('pt-BR')
    }

    // Add to comandas list
    comandas.push(newComanda)
    await writeJsonFile('comandas.json', comandas)

    res.status(200).json({
      exists: false,
      comanda: newComanda
    })
  } catch (error) {
    console.error('Error creating/checking comanda:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
} 