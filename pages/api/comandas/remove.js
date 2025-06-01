import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { comandaId } = req.body

    // Read the comandas file
    const filePath = path.join(process.cwd(), 'data', 'comandas.json')
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const comandas = JSON.parse(fileContent)

    // Find and remove the comanda
    const updatedComandas = comandas.filter(comanda => comanda.Idcomanda !== comandaId)

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(updatedComandas, null, 2))

    res.status(200).json({ message: 'Comanda removida com sucesso' })
  } catch (error) {
    console.error('Error removing comanda:', error)
    res.status(500).json({ message: 'Erro ao remover comanda' })
  }
} 