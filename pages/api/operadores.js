import { readJsonFile, validateData, schemas } from '../../lib/database'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const operadores = await readJsonFile('operadores.json')
    
    if (!validateData(operadores, schemas.operadores)) {
      return res.status(500).json({ message: 'Invalid operators data structure' })
    }

    // Remove passwords from response
    const safeOperadores = operadores.map(({ Senha, ...op }) => op)

    res.status(200).json(safeOperadores)
  } catch (error) {
    console.error('Error fetching operators:', error)
    res.status(500).json({ message: 'Internal server error' + error })
  }
} 