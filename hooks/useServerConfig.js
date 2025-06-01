import { useState, useEffect } from 'react'
import { checkHealth } from '../lib/api'

export function useServerConfig() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true)
        await checkHealth()
        setIsConnected(true)
        setError(null)
      } catch (err) {
        setIsConnected(false)
        setError('Não foi possível conectar ao servidor')
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return {
    isConnected,
    isLoading,
    error,
  }
} 