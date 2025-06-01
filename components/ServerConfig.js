import { useServerConfig } from '../hooks/useServerConfig'

export default function ServerConfig() {
  const { isConnected, isLoading, error } = useServerConfig()

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-100 p-2 rounded-lg shadow-md">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-sm text-gray-600">Verificando conexão...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 p-2 rounded-lg shadow-md">
        <div className="flex items-center space-x-2">
          <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm text-red-600">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-100 p-2 rounded-lg shadow-md">
      <div className="flex items-center space-x-2">
        <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm text-green-600">Conectado ao servidor</span>
      </div>
    </div>
  )
} 