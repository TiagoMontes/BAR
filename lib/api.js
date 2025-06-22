import { getServerUrl } from '../hooks/useServerConfig'

const API_BASE_URL = '/api'

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Erro na requisição: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  try {
    const response = await fetch(url, { ...defaultOptions, ...options })
    
    return await handleResponse(response)
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// Authentication
export async function login(username, password) {
  try {
    const serverUrl = getServerUrl()
    const response = await fetch(`${serverUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    const data = await handleResponse(response)
    return data
  } catch (error) {
    console.error('Erro ao logar:', error)
    throw new Error(`Falha ao logar: ${error.message}`)
  }
}

export async function logout(operadorId) {
  try {
    const serverUrl = getServerUrl()
    const response = await fetch(`${serverUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ operadorId }),
    })
    const data = await handleResponse(response)
    return data
  } catch (error) {
    console.error('Erro ao deslogar:', error)
    throw new Error(`Falha ao deslogar: ${error.message}`)
  }
}

export const getComandas = async () => {
  try {
    const serverUrl = getServerUrl()
    const response = await fetch(`${serverUrl}/api/comandas`)
    const data = await handleResponse(response)
    return data
  } catch (error) {
    console.error('Erro ao buscar comandas:', error)
    throw new Error(`Falha ao buscar comandas: ${error.message}`)
  }
}

export const getProdutos = async () => {
  try {
    const serverUrl = getServerUrl()
    const response = await fetch(`${serverUrl}/api/produtos`)
    const data = await handleResponse(response)
    return data
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    throw new Error(`Falha ao buscar produtos: ${error.message}`)
  }
}

export async function getAtendentes() {
  try {
    const serverUrl = getServerUrl()
    const response = await fetch(`${serverUrl}/api/atendentes`)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to fetch atendentes')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erro ao buscar atendentes:', error)
    throw error
  }
}

// Sales
export const registerSale = async (saleData) => {
  try {
    const serverUrl = getServerUrl()
    const response = await fetch(`${serverUrl}/api/vendas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saleData),
    })
    const data = await handleResponse(response)
    return data
  } catch (error) {
    console.error('Erro ao registrar venda:', error)
    throw new Error(`Falha ao registrar venda: ${error.message}`)
  }
}

// Health check
export async function checkHealth() {
  return apiRequest('/health')
}

// Comandas
export async function createComanda(cliente, operadorId) {
  try {
    const serverUrl = getServerUrl()
    const response = await fetch(`${serverUrl}/api/comandas/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cliente, operadorId }),
    })
    const data = await handleResponse(response)
    return data
  } catch (error) {
    console.error('Erro ao deletar comanda:', error)
    throw new Error(`Falha ao deletar comanda: ${error.message}`)
  }
}

export async function getComanda(comandaId) {
  try {
    const serverUrl = getServerUrl()
    const response = await fetch(`${serverUrl}/api/vendas/comanda/${comandaId}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to fetch comanda data')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erro ao buscar comanda:', error)
    throw error
  }
}

export async function deleteComanda(comandaId) {
  try {
    const serverUrl = getServerUrl()
    const response = await fetch(`${serverUrl}/api/comandas/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comandaId }),
    })
    const data = await handleResponse(response)
    return data
  } catch (error) {
    console.error('Erro ao deletar comanda:', error)
    throw new Error(`Falha ao deletar comanda: ${error.message}`)
  }
}

export async function closeComanda(comandaId) {
  try {
    const serverUrl = getServerUrl()
    const response = await fetch(`${serverUrl}/api/comandas/close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comandaId }),
    })
    const data = await handleResponse(response)
    return data
  } catch (error) {
    console.error('Erro ao fechar comanda:', error)
    throw new Error(`Falha ao fechar comanda: ${error.message}`)
  }
}

export async function printVenda(venda) {
  try {
    const serverUrl = getServerUrl()
    const response = await fetch(`${serverUrl}/api/print/venda`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(venda)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to print venda')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erro ao imprimir venda:', error)
    throw error
  }
} 