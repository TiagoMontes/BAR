import fs from 'fs/promises'
import path from 'path'
import { validateOperadores } from '../../../lib/validators'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }

  try {
    // Read operadores.json
    const operadoresPath = path.join(process.cwd(), 'data', 'operadores.json')
    const operadoresContent = await fs.readFile(operadoresPath, 'utf-8')
    const operadoresData = JSON.parse(operadoresContent)


    // Validate data structure
    if (!validateOperadores(operadoresData)) {
      return res.status(500).json({ message: operadoresContent})
    }

    // Find matching operator
    const operador = operadoresData.operadores.find(
      op => op.Usuario.toLowerCase() === username.toLowerCase() && op.Senha === password
    )

    if (!operador) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check if operator is already logged in
    const sessoesPath = path.join(process.cwd(), 'data', 'sessoes.json')
    const sessoesContent = await fs.readFile(sessoesPath, 'utf-8')
    const sessoesData = JSON.parse(sessoesContent)

    const sessaoAtiva = sessoesData.sessoes.find(s => s.operadorId === operador.Id)
    if (sessaoAtiva) {
      return res.status(409).json({ 
        message: 'Operador já está logado em outra sessão',
        sessaoAtiva: {
          operadorId: sessaoAtiva.operadorId,
          ultimoAcesso: sessaoAtiva.ultimoAcesso
        }
      })
    }

    // Create new session
    const novaSessao = {
      operadorId: operador.Id,
      inicio: new Date().toISOString(),
      ultimoAcesso: new Date().toISOString()
    }

    sessoesData.sessoes.push(novaSessao)
    await fs.writeFile(sessoesPath, JSON.stringify(sessoesData, null, 2))

    // Remove password from response
    const { Senha, ...operadorSemSenha } = operador

    res.status(200).json({
      user: operadorSemSenha,
      sessao: novaSessao
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: error.message })
  }
} 