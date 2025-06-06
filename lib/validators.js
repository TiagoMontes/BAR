// Schema for operadores
const operadorSchema = {
  Id: 'number',
  Nome: 'string',
  Usuario: 'string',
  Senha: 'string',
  Nivel: 'number',
  Ativo: 'boolean'
}

// Validate operadores data structure
export function validateOperadores(data) {
  if (!data || !Array.isArray(data)) {
    return false
  }

  return data.every(operador => {
    return Object.entries(operadorSchema).every(([key, type]) => {
      return typeof operador[key] === type
    })
  })
}

// Schema for produtos
const produtoSchema = {
  Id: 'number',
  Descricao: 'string',
  Preco: 'number',
  Setor: 'string'
}

// Validate produtos data structure
export function validateProdutos(data) {
  if (!data || !Array.isArray(data.produtos)) {
    return false
  }

  return data.produtos.every(produto => {
    return Object.entries(produtoSchema).every(([key, type]) => {
      return typeof produto[key] === type
    })
  })
}

// Schema for atendentes
const atendenteSchema = {
  id: 'number',
  Nome: 'string',
  Apelido: 'string',
  Presente: 'number',
  Situacao: 'number'
}

// Validate atendentes data structure
export function validateAtendentes(data) {
  if (!data || !Array.isArray(data.atendentes)) {
    return false
  }

  return data.atendentes.every(atendente => {
    return Object.entries(atendenteSchema).every(([key, type]) => {
      return typeof atendente[key] === type
    })
  })
}

// Schema for comandas
const comandaSchema = {
  Idcomanda: 'number',
  Cliente: 'string',
  Entrada: 'string',
  saldo: 'number'
}

// Validate comandas data structure
export function validateComandas(data) {
  if (!data || !Array.isArray(data.comandas)) {
    return false
  }

  return data.comandas.every(comanda => {
    return Object.entries(comandaSchema).every(([key, type]) => {
      return typeof comanda[key] === type
    })
  })
} 