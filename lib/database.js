import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// Read JSON file
export async function readJsonFile(filename) {
  try {
    await ensureDataDir()
    const filePath = path.join(DATA_DIR, filename)
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filename}:`, error)
    return []
  }
}

// Write JSON file with backup
export async function writeJsonFile(filename, data) {
  try {
    await ensureDataDir()
    const filePath = path.join(DATA_DIR, filename)
    const backupPath = `${filePath}.bak`

    // Create backup of existing file
    try {
      await fs.copyFile(filePath, backupPath)
    } catch (error) {
      // Ignore error if file doesn't exist
    }

    // Write new data
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))

    // Remove backup if write was successful
    try {
      await fs.unlink(backupPath)
    } catch (error) {
      // Ignore error if backup doesn't exist
    }

    return true
  } catch (error) {
    console.error(`Error writing ${filename}:`, error)
    
    // Restore from backup if write failed
    try {
      await fs.copyFile(backupPath, filePath)
    } catch (restoreError) {
      console.error('Failed to restore from backup:', restoreError)
    }
    
    return false
  }
}

// Validate data structure
export function validateData(data, schema) {
  if (!Array.isArray(data)) return false
  
  return data.every(item => {
    return Object.keys(schema).every(key => {
      const value = item[key]
      const type = schema[key]
      
      if (type === 'string') return typeof value === 'string'
      if (type === 'number') return typeof value === 'number'
      if (type === 'boolean') return typeof value === 'boolean'
      if (Array.isArray(type)) return type.includes(value)
      
      return true
    })
  })
}

// Data schemas
export const schemas = {
  operadores: {
    Nome: 'string',
    Senha: 'string',
    Nivel: [1, 2, 3, 4]
  },
  comandas: {
    Idcomanda: 'number',
    Cliente: 'string',
    saldo: 'number',
    Entrada: 'string'
  },
  produtos: {
    Id: 'number',
    Descricao: 'string',
    Preco: 'number',
    'Preco Atendente': 'number',
    Comissao: [0, 1],
    'Id setor': 'number',
    Setor: 'string'
  },
  atendentes: {
    id: 'number',
    Apelido: 'string',
    Presente: [0, 1],
    Situacao: 'number'
  }
} 