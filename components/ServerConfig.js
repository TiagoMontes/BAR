import { useState } from 'react'
import useServerConfig from '../hooks/useServerConfig'

export default function ServerConfig() {
  const { serverUrl, setServerUrl, isConnected, isLoading, error } = useServerConfig()
  const [newUrl, setNewUrl] = useState(serverUrl)
  const [showConfig, setShowConfig] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setServerUrl(newUrl)
    setShowConfig(false)
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Configuração do Servidor</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-sm text-gray-600 hover:text-gray-800"
            title="Instruções"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showConfig ? 'Ocultar' : 'Configurar'}
          </button>
        </div>
      </div>
      
      {showInstructions && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Como configurar:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Inicie o servidor na máquina desejada</li>
            <li>2. Descubra o IP da máquina (ipconfig no Windows, ifconfig no Linux/Mac)</li>
            <li>3. Use o formato: http://IP_DA_MAQUINA:3001</li>
            <li>4. Exemplo: http://192.168.1.100:3001</li>
          </ol>
        </div>
      )}
      
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
        <p className="text-sm text-gray-600 mt-1">
          Servidor atual: {serverUrl}
        </p>
      </div>

      {showConfig && (
        <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
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
              placeholder="http://192.168.1.100:3001"
            />
            <p className="text-xs text-gray-500 mt-1">
              Exemplo: http://192.168.1.100:3001
            </p>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Salvar Configuração
          </button>
        </form>
      )}
    </div>
  )
} 