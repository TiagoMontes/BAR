import { useState } from 'react'
import { createComanda } from '../lib/api'
import { useConfig } from '../hooks/useConfig'

export default function ComandaForm({ onComandaSelect, onCancel }) {
  const [cliente, setCliente] = useState('')
  const [numero, setNumero] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [existingComanda, setExistingComanda] = useState(null)
  const { config } = useConfig()

  // Verificar se nome cliente está habilitado
  const nomeClienteHabilitado = config && config["nome cliente"] === 1

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
    
    if (!numero.trim()) {
      setError('Número da comanda é obrigatório')
      setIsLoading(false)
      return
    }

    const userData = localStorage.getItem('user')
    try {
      const user = JSON.parse(userData)
      
      // Construir nome da comanda baseado na configuração
      let nomeComanda
      if (nomeClienteHabilitado) {
        nomeComanda = `${cliente.trim()} - ${numero.trim()}`
      } else {
        nomeComanda = numero.trim()
      }
      
      const response = await createComanda(nomeComanda, user["Id operador"])
      
      if (response.exists) {
        setExistingComanda(response.comanda)
        setError(response.message)
      } else {
        onComandaSelect(response.comanda)
        setCliente('')
        setNumero('')
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
              required
            />
          </div>

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
              disabled={isLoading || !numero.trim() || (nomeClienteHabilitado && !cliente.trim())}
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