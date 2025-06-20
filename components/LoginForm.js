import { useState } from 'react'
import { login } from '../lib/api'

export default function LoginForm({ onLogin, onLogout }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessaoAtiva, setSessaoAtiva] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await login(username, password)
      console.log(response)

      if (response.sessaoAtiva) {
        setSessaoAtiva(response.sessaoAtiva)
        setError('Este operador já está logado em outra sessão. Deseja forçar o logout?')
      } else {
        onLogin(response.user)
      }
    } catch (err) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForceLogout = async () => {
    if (!sessaoAtiva) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operadorId: sessaoAtiva.operadorId }),
      })

      if (!response.ok) {
        throw new Error('Erro ao forçar logout')
      }

      // Try login again
      const loginResponse = await login(username, password)
      onLogin(loginResponse.user)
    } catch (err) {
      setError(err.message || 'Erro ao forçar logout')
    } finally {
      setIsLoading(false)
      setSessaoAtiva(null)
    }
  }

  return (
    <div className="flex items-center justify-center mx-auto max-w-md w-full p-4 bg-white border border-gray-200 rounded-lg">
      <div className="w-full">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            TecBar
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Nome de usuário
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
              {sessaoAtiva && (
                <button
                  type="button"
                  onClick={handleForceLogout}
                  className="ml-2 text-primary hover:text-primary-dark underline"
                >
                  Forçar logout
                </button>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Entrar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 