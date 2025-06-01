import fs from 'fs/promises'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id } = req.query

  try {
    // Read produtos.json to get prices
    const produtosPath = path.join(process.cwd(), 'data', 'produtos.json')
    const produtosContent = await fs.readFile(produtosPath, 'utf-8')
    const produtos = JSON.parse(produtosContent)

    const salesDir = path.join(process.cwd(), 'data', 'vendas')
    const files = await fs.readdir(salesDir)
    
    // Filter files for this comanda
    const comandaFiles = files.filter(file => 
      file.startsWith(String(id).padStart(5, '0'))
    )

    // Read and parse each sale file
    const vendasData = await Promise.all(
      comandaFiles.map(async (file) => {
        const content = await fs.readFile(path.join(salesDir, file), 'utf-8')
        const items = content.split('\n').filter(Boolean).map(line => {
          const [produtoId, descricao, quantidade, atendenteId] = line.split('!')
          const produto = produtos.find(p => p.Id === Number(produtoId))
          return {
            produtoId: Number(produtoId),
            descricao,
            quantidade: Number(quantidade),
            atendenteId: Number(atendenteId),
            preco: produto ? produto.Preco : 0
          }
        })

        const total = items.reduce((sum, item) => sum + (item.quantidade * item.preco), 0)

        return {
          fileName: file,
          items,
          total
        }
      })
    )

    res.status(200).json(vendasData)
  } catch (error) {
    console.error('Error fetching sales:', error)
    res.status(500).json({ message: 'Error fetching sales data' })
  }
} 