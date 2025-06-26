import { useState, useEffect } from 'react'
import { createComanda, getComandas } from '../lib/api'
import { useConfig } from '../hooks/useConfig'

export default function ComandaForm({ onComandaSelect, onCancel, onComandaCreated }) {
  const [cliente, setCliente] = useState('')
  const [numero, setNumero] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [existingComanda, setExistingComanda] = useState(null)
  const [proximoNumero, setProximoNumero] = useState(null)
  const { config } = useConfig()

  // Verificar se nome cliente está habilitado
  const nomeClienteHabilitado = config && config["nome cliente"] === 1
  const comandaInicial = config && Number(config["comanda inicial"])
  const mostrarCampoNumero = comandaInicial === 0

  // Calcular próximo número da comanda
  useEffect(() => {
    const calcularProximoNumero = async () => {
      if (!mostrarCampoNumero) {
        try {
          const comandas = await getComandas()
          let proximo
          
          if (comandas.length === 0) {
            // Se não há comandas, usar o valor inicial da configuração
            proximo = comandaInicial
          } else {
            // Se há comandas, usar o maior ID + 1, mas nunca menor que o valor inicial
            const maiorId = Math.max(...comandas.map(c => c.Idcomanda))
            proximo = Math.max(maiorId + 1, comandaInicial)
          }
          
          setProximoNumero(proximo)
        } catch (error) {
          console.error('Erro ao calcular próximo número:', error)
          setProximoNumero(comandaInicial)
        }
      }
    }

    calcularProximoNumero()
  }, [mostrarCampoNumero, comandaInicial])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validar campos obrigatórios
    if (nomeClienteHabilitado && !cliente.trim()) {
      setError('Nome do cliente é obrigatório')
      setIsLoading(false)
      return
    }
    if (mostrarCampoNumero && !numero.trim()) {
      setError('Número da comanda é obrigatório')
      setIsLoading(false)
      return
    }

    const userData = localStorage.getItem('user')
    try {
      const user = JSON.parse(userData)
      let nomeComanda
      if (nomeClienteHabilitado && mostrarCampoNumero) {
        nomeComanda = `${cliente.trim()} - ${numero.trim()}`
      } else if (nomeClienteHabilitado) {
        nomeComanda = cliente.trim()
      } else if (mostrarCampoNumero) {
        nomeComanda = numero.trim()
      } else {
        nomeComanda = '' // será ignorado pelo backend
      }
      const response = await createComanda(nomeComanda, user["Id operador"])
      if (response.exists) {
        setExistingComanda(response.comanda)
        setError(response.message)
      } else {
        onComandaSelect(response.comanda)
        setCliente('')
        setNumero('')
        // Atualizar a listagem de comandas
        if (onComandaCreated) {
          onComandaCreated()
        }
      }
    } catch (err) {
      setError('Erro ao verificar/criar comanda')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmExisting = () => {
    onComandaSelect(existingComanda)
    setExistingComanda(null)
    setCliente('')
    setNumero('')
    setError('')
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">Nova Comanda</h2>
      {existingComanda ? (
        <div className="space-y-4">
          <div className="bg-yellow-900 p-4 rounded-lg border border-yellow-700">
            <p className="text-yellow-200">
              Já existe uma comanda para <strong>{existingComanda.Cliente}</strong>
            </p>
            <p className="text-yellow-200 mt-2">
              ID: {existingComanda.Idcomanda} | Saldo: R$ {existingComanda.saldo.toFixed(2)}
            </p>
          </div>
          <div className="flex space-x-4">
          <button
              onClick={() => {
                setExistingComanda(null)
                setError('')
              }}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmExisting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Usar Existente
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {nomeClienteHabilitado && (
          <div>
              <label htmlFor="cliente" className="block text-sm font-medium text-gray-300 mb-2">
                Nome do Cliente
              </label>
            <input
              type="text"
              id="cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400"
              placeholder="Digite o nome do cliente"
                required={nomeClienteHabilitado}
              />
            </div>
          )}
          {mostrarCampoNumero ? (
            <div>
              <label htmlFor="numero" className="block text-sm font-medium text-gray-300 mb-2">
                Número da Comanda
              </label>
              <input
                type="text"
                id="numero"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400"
                placeholder={nomeClienteHabilitado ? "Ex: 001, 002..." : "Ex: 001, 002..."}
                required={mostrarCampoNumero}
            />
          </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Número da Comanda
              </label>
              <div className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-gray-300">
                Será gerado automaticamente: <span className="font-semibold text-blue-400">{proximoNumero || '...'}</span>
              </div>
            </div>
          )}
          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}
          <div className="flex space-x-4">
          <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || (mostrarCampoNumero && !numero.trim()) || (nomeClienteHabilitado && !cliente.trim())}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verificando...' : 'Criar'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
} 