import { useState } from 'react'
import { createComanda } from '../lib/api'

export default function ComandaForm({ onComandaSelect, onCancel }) {
  const [cliente, setCliente] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [existingComanda, setExistingComanda] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    const userData = localStorage.getItem('user')
    try {
      const user = JSON.parse(userData)
      const response = await createComanda(cliente, user["Id operador"])
      
      if (response.exists) {
        setExistingComanda(response.comanda)
        setError(response.message)
      } else {
        onComandaSelect(response.comanda)
        setCliente('')
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
          <div>
            <input
              type="text"
              id="cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400"
              placeholder="Digite o nome do cliente"
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
              disabled={isLoading || !cliente.trim()}
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