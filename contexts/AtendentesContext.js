import { createContext, useContext, useState, useEffect } from 'react'
import { getAtendentes } from '../lib/api'

const AtendentesContext = createContext()

export function AtendentesProvider({ children }) {
  const [atendentes, setAtendentes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadAtendentes = async () => {
      try {
        setIsLoading(true)
        const data = await getAtendentes()
        setAtendentes(data)
      } catch (err) {
        console.error('Error loading atendentes:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadAtendentes()
  }, [])

  return (
    <AtendentesContext.Provider value={{ atendentes, isLoading, error }}>
      {children}
    </AtendentesContext.Provider>
  )
}

export function useAtendentes() {
  const context = useContext(AtendentesContext)
  if (!context) {
    throw new Error('useAtendentes must be used within an AtendentesProvider')
  }
  return context
} 