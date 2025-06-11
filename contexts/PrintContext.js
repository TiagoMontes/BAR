import { createContext, useContext } from 'react'
import { printVenda as apiPrintVenda } from '../lib/api'

const PrintContext = createContext()

export function PrintProvider({ children }) {
  const printVenda = async (venda) => {
    try {
      await apiPrintVenda(venda)
    } catch (error) {
      console.error('Error printing venda:', error)
      throw error
    }
  }

  return (
    <PrintContext.Provider value={{ printVenda }}>
      {children}
    </PrintContext.Provider>
  )
}

export const usePrint = () => {
  const context = useContext(PrintContext)
  if (!context) {
    throw new Error('usePrint must be used within a PrintProvider')
  }
  return context
} 