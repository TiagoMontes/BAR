import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import VendasInterface from '../components/VendasInterface'
import { getServerUrl } from '../hooks/useServerConfig'
import { logout } from '../lib/api'
import { useConfig } from '../hooks/useConfig'

export default function Vendas() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { config } = useConfig()

  console.log(user['Id operador'])

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex flex-col lg:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-100">
            {config && config["nome sala"] ? config["nome sala"] : "TecBar"}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">
              Operador: {user.Nome}
            </span>
            <button
              onClick={() => {
                logout(user['Id operador'])
                localStorage.removeItem('user')
                router.push('/')
              }}
              className="px-4 py-2 bg-red-600 text-sm text-white hover:bg-red-700 rounded-lg transition-colors"
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