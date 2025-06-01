import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import VendasInterface from '../components/VendasInterface'

export default function Vendas() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/')
      return
    }

    try {
      setUser(JSON.parse(userData))
    } catch (err) {
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operadorId: user.Id }),
      })

      if (!response.ok) {
        throw new Error('Erro ao fazer logout')
      }

      localStorage.removeItem('user')
      router.push('/')
    } catch (err) {
      console.error('Erro ao fazer logout:', err)
      // Even if the API call fails, we still want to clear the local session
      localStorage.removeItem('user')
      router.push('/')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Sistema de Vendas</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              Operador: {user.Nome}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main>
        <VendasInterface user={user} />
      </main>
    </div>
  )
} 