import { readJsonFile, validateData, schemas } from '../../lib/database'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const produtos = await readJsonFile('produtos.json')
    
    if (!validateData(produtos, schemas.produtos)) {
      return res.status(500).json({ message: 'Invalid products data structure' })
    }

    res.status(200).json(produtos)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
} 