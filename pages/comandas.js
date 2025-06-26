import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getComandas, deleteComanda } from '../lib/api'
import ComandaForm from '../components/ComandaForm'
import ComandaDetalhes from '../components/ComandaDetalhes'
import { useConfig } from '../hooks/useConfig'

export default function Comandas() {
  const router = useRouter()
  const [comandas, setComandas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showComandaForm, setShowComandaForm] = useState(false)
  const [selectedComanda, setSelectedComanda] = useState(null)
  const [showComandaDetalhes, setShowComandaDetalhes] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { config } = useConfig()

  // Load comandas data
  useEffect(() => {
    const fetchComandas = async () => {
      try {
        setIsLoading(true)
        const data = await getComandas()
        setComandas(data)
      } catch (err) {
        setError('Erro ao carregar comandas')
      } finally {
        setIsLoading(false)
      }
    }

    fetchComandas()
  }, [])

  // Filter comandas based on search term
  const filteredComandas = comandas.filter(comanda => 
    comanda.Cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(comanda.Idcomanda).includes(searchTerm)
  )

  const handleCreateComanda = async (newComanda) => {
    try {
      const updatedComandas = await getComandas()
      setComandas(updatedComandas)
      setShowComandaForm(false)
    } catch (err) {
      setError('Erro ao criar comanda')
    }
  }

  const handleComandaCreated = async () => {
    try {
      const updatedComandas = await getComandas()
      setComandas(updatedComandas)
    } catch (err) {
      setError('Erro ao atualizar listagem')
    }
  }

  const handleDeleteComanda = async (comandaId) => {
    if (!confirm('Tem certeza que deseja excluir esta comanda?')) {
      return
    }

    try {
      setError('')
      await deleteComanda(comandaId)
      const updatedComandas = await getComandas()
      setComandas(updatedComandas)
    } catch (err) {
      console.error('Erro ao excluir comanda:', err)
      setError(err.message || 'Erro ao excluir comanda. Verifique se a comanda não possui vendas associadas.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.push('/vendas')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Vendas
        </button>
        <h1 className="text-2xl font-bold text-gray-100">
          {config && config["nome sala"] ? config["nome sala"] : "TecBar"} - Comandas
        </h1>
        <button
          onClick={() => setShowComandaForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Criar
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar comanda por nome ou ID..."
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6 border border-red-700">
          {error}
        </div>
      )}

      {/* Comandas List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComandas.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-400">
            Nenhuma comanda encontrada
          </div>
        ) : (
          filteredComandas.map(comanda => (
            <div
              key={comanda.Idcomanda}
              className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-100">{comanda.Cliente}</h3>
                  <p className="text-sm text-gray-400">
                    ID: {comanda.Idcomanda}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedComanda(comanda)
                      setShowComandaDetalhes(true)
                    }}
                    className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Detalhes
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                Saldo: R$ {comanda.saldo.toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comanda Form Modal */}
      {showComandaForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
          <ComandaForm
            onComandaSelect={handleCreateComanda}
            onCancel={() => setShowComandaForm(false)}
            onComandaCreated={handleComandaCreated}
          />
        </div>
      )}

      {/* Comanda Details Modal */}
      {selectedComanda && (
        <ComandaDetalhes
          comanda={selectedComanda}
          isOpen={showComandaDetalhes}
          onClose={() => setShowComandaDetalhes(false)}
        />
      )}
    </div>
  )
} 