import { useState, useEffect } from 'react'
import config from '../lib/config.json'

const DEFAULT_SERVER_URL = config.serverUrl

export const getServerUrl = () => {
  const storedUrl = localStorage.getItem('serverUrl')
  return storedUrl || DEFAULT_SERVER_URL
}

export default function useServerConfig() {
  const [serverUrl, setServerUrl] = useState(getServerUrl())
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Salva a URL no localStorage sempre que ela mudar
  useEffect(() => {
    localStorage.setItem('serverUrl', serverUrl)
  }, [serverUrl])

  // Verifica a conexão com o servidor
  const checkConnection = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${serverUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Timeout de 5 segundos
        signal: AbortSignal.timeout(5000)
      })
      
      if (response.ok) {
        setIsConnected(true)
        setError(null)
      } else {
        setIsConnected(false)
        setError('Servidor respondeu com erro')
      }
    } catch (err) {
      setIsConnected(false)
      if (err.name === 'AbortError') {
        setError('Timeout: Servidor não respondeu em 5 segundos')
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Erro de rede: Verifique a URL do servidor')
      } else {
        setError(`Erro de conexão: ${err.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Verifica conexão quando a URL muda
  useEffect(() => {
    if (serverUrl) {
      checkConnection()
    }
  }, [serverUrl])

  // Verifica conexão periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      if (serverUrl && !isLoading) {
        checkConnection()
      }
    }, 30000) // Verifica a cada 30 segundos

    return () => clearInterval(interval)
  }, [serverUrl, isLoading])

  return {
    serverUrl,
    setServerUrl,
    isConnected,
    isLoading,
    error,
    checkConnection
  }
} 