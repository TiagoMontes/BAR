import { useState } from 'react'
import useServerConfig from '../hooks/useServerConfig'

export default function ServerConfig() {
  const { serverUrl, setServerUrl, isConnected, isLoading, error } = useServerConfig()
  const [newUrl, setNewUrl] = useState(serverUrl)

  const handleSubmit = (e) => {
    e.preventDefault()
    setServerUrl(newUrl)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Configuração do Servidor</h2>
        
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">
              {isLoading ? 'Verificando conexão...' : 
               isConnected ? 'Conectado ao servidor' : 
               'Desconectado do servidor'}
            </span>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-700">
              URL do Servidor
            </label>
            <input
              type="text"
              id="serverUrl"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="http://localhost:3001"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Salvar Configuração
          </button>
        </form>
      </div>
    </div>
  )
} 