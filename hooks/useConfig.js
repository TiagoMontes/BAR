import { useState, useEffect } from 'react'
import { getConfig } from '../lib/api'

export function useConfig() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true)
        const configData = await getConfig()
        setConfig(configData)
      } catch (err) {
        console.error('Erro ao carregar configurações:', err)
        setError(err.message)
        // Configuração padrão caso não consiga carregar
        setConfig({
          "nome sala": "TANGARA",
          "senha diaria": "Senha",
          "imprimir": 1,
          "comissao": 1,
          "nome cliente": 0,
          "comanda inicial": 5001
        })
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  return { config, loading, error }
} 