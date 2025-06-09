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
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })

  const data = await handleResponse(response)

  if (!response.ok) {
    throw new Error(data.message)
  }

  return data
}

// Data fetching
export async function getOperadores() {
  return apiRequest('/operadores')
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

export const getAtendentes = async () => {
  try {
    const serverUrl = getServerUrl()
    const response = await fetch(`${serverUrl}/api/operadores`)
    const data = await handleResponse(response)
    return data
  } catch (error) {
    console.error('Erro ao buscar atendentes:', error)
    throw new Error(`Falha ao buscar atendentes: ${error.message}`)
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
export async function createComanda(cliente) {
  return apiRequest('/comandas/create', {
    method: 'POST',
    body: JSON.stringify({ cliente }),
  })
}

export async function deleteComanda(comandaId) {
  return apiRequest('/comandas/remove', {
    method: 'POST',
    body: JSON.stringify({ comandaId })
  })
}

export async function closeComanda(comandaId) {
  return apiRequest('/comandas/close', {
    method: 'POST',
    body: JSON.stringify({ comandaId }),
  });
} 