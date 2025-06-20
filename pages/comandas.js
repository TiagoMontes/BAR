import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getComandas, deleteComanda } from '../lib/api'
import ComandaForm from '../components/ComandaForm'
import ComandaDetalhes from '../components/ComandaDetalhes'

export default function Comandas() {
  const router = useRouter()
  const [comandas, setComandas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showComandaForm, setShowComandaForm] = useState(false)
  const [selectedComanda, setSelectedComanda] = useState(null)
  const [showComandaDetalhes, setShowComandaDetalhes] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.push('/vendas')}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Vendas
        </button>
        <h1 className="text-2xl font-bold">Comandas</h1>
        <button
          onClick={() => setShowComandaForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Criar
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar comanda por nome ou ID..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Comandas List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComandas.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Nenhuma comanda encontrada
          </div>
        ) : (
          filteredComandas.map(comanda => (
            <div
              key={comanda.Idcomanda}
              className="bg-white p-4 rounded-lg border border-gray-300 hover:border-gray-500 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{comanda.Cliente}</h3>
                  <p className="text-sm text-gray-600">
                    ID: {comanda.Idcomanda}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedComanda(comanda)
                      setShowComandaDetalhes(true)
                    }}
                    className="p-2 rounded-lg bg-primary text-white"
                  >
                    Detalhes
                  </button>
                  <button
                    onClick={() => handleDeleteComanda(comanda.Idcomanda)}
                    className="  p-2 rounded-lg bg-red-400 text-white"
                  >
                    Excluir
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Saldo: R$ {comanda.saldo.toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comanda Form Modal */}
      {showComandaForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <ComandaForm
            onComandaSelect={handleCreateComanda}
            onCancel={() => setShowComandaForm(false)}
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