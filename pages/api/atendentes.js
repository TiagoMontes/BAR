import { readJsonFile, validateData, schemas } from '../../lib/database'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const atendentes = await readJsonFile('atendentes.json')
    
    if (!validateData(atendentes, schemas.atendentes)) {
      return res.status(500).json({ message: 'Invalid attendants data structure' })
    }

    // Filter present and active attendants
    const presentAtendentes = atendentes.filter(
      atendente => atendente.Presente === 1 && atendente.Situacao === 1
    )

    res.status(200).json(presentAtendentes)
  } catch (error) {
    console.error('Error fetching attendants:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
} 