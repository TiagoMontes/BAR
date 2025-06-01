import { readJsonFile, validateData, schemas } from '../../lib/database'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const comandas = await readJsonFile('comandas.json')
    
    if (!validateData(comandas, schemas.comandas)) {
      return res.status(500).json({ message: 'Invalid commands data structure' })
    }

    // Return all comandas
    res.status(200).json(comandas)
  } catch (error) {
    console.error('Error fetching commands:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
} 