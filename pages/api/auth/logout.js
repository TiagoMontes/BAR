import fs from 'fs/promises'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { operadorId } = req.body

  if (!operadorId) {
    return res.status(400).json({ message: 'Operador ID is required' })
  }

  try {
    const sessoesPath = path.join(process.cwd(), 'data', 'sessoes.json')
    const sessoesContent = await fs.readFile(sessoesPath, 'utf-8')
    const sessoesData = JSON.parse(sessoesContent)

    // Remove session
    sessoesData.sessoes = sessoesData.sessoes.filter(s => s.operadorId !== operadorId)
    await fs.writeFile(sessoesPath, JSON.stringify(sessoesData, null, 2))

    res.status(200).json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
} 