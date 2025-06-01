const API_BASE_URL = '/api'

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  try {
    const response = await fetch(url, { ...defaultOptions, ...options })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
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

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message)
  }

  return data
}

// Data fetching
export async function getOperadores() {
  return apiRequest('/operadores')
}

export async function getComandas() {
  return apiRequest('/comandas')
}

export async function getProdutos() {
  return apiRequest('/produtos')
}

export async function getAtendentes() {
  return apiRequest('/atendentes')
}

// Sales
export async function registerSale(saleData) {
  return apiRequest('/vendas', {
    method: 'POST',
    body: JSON.stringify(saleData),
  })
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