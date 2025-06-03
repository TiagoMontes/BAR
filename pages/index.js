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
    <div>
      <LoginForm onLogin={handleLogin} onLogout={handleLogout} />
      <ServerConfig />
    </div>
  )
} 