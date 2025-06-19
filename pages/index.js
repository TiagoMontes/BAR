import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import LoginForm from '../components/LoginForm'
import ServerConfig from '../components/ServerConfig'

export default function Login() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user && user.Id) {
          router.push('/vendas')
          return
        }
      } catch (err) {
        // If there's an error parsing the data, clear it
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [router])

  const handleLogin = (userData) => {
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData))
    // Redirect to sales page
    router.push('/vendas')
  }

  const handleLogout = () => {
    // Remove user data from localStorage
    localStorage.removeItem('user')
    // Redirect to login page
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900 mb-2">
          TecBar
        </h1>
        <p className="text-center text-sm text-gray-600">
          Sistema de Vendas
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm onLogin={handleLogin} onLogout={handleLogout} />
        </div>
        
        <div className="mt-6">
          <ServerConfig />
        </div>
      </div>
    </div>
  )
} 