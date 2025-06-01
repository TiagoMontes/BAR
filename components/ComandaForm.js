import { useState } from 'react'
import { createComanda } from '../lib/api'

export default function ComandaForm({ onComandaSelect }) {
  const [cliente, setCliente] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [existingComanda, setExistingComanda] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await createComanda(cliente)
      
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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Nova Comanda</h2>
      
      {existingComanda ? (
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-yellow-800">
              Já existe uma comanda para <strong>{existingComanda.Cliente}</strong>
            </p>
            <p className="text-yellow-800 mt-2">
              ID: {existingComanda.Idcomanda} | Saldo: R$ {existingComanda.saldo.toFixed(2)}
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleConfirmExisting}
              className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Usar Comanda Existente
            </button>
            <button
              onClick={() => {
                setExistingComanda(null)
                setError('')
              }}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Cliente
            </label>
            <input
              type="text"
              id="cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Digite o nome do cliente"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading || !cliente.trim()}
            className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verificando...' : 'Verificar/Criar Comanda'}
          </button>
        </form>
      )}
    </div>
  )
} 