import { useState, useEffect } from 'react'
import { getComandas, getProdutos, getAtendentes, registerSale } from '../lib/api'
import ComandaForm from './ComandaForm'
import ComandaDetalhes from './ComandaDetalhes'

export default function VendasInterface({ user }) {
  const [comandas, setComandas] = useState([])
  const [produtos, setProdutos] = useState([])
  const [atendentes, setAtendentes] = useState([])
  const [selectedComanda, setSelectedComanda] = useState(null)
  const [selectedAtendente, setSelectedAtendente] = useState(null)
  const [cart, setCart] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [comandaSearchTerm, setComandaSearchTerm] = useState('')
  const [selectedSetor, setSelectedSetor] = useState('todos')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showComandaForm, setShowComandaForm] = useState(false)
  const [isProcessingSale, setIsProcessingSale] = useState(false)

  // Get unique sectors
  const setores = ['todos', ...new Set(produtos.map(p => p.Setor))]

  // Filter products based on search term and selected sector
  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.Descricao.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSetor = selectedSetor === 'todos' || produto.Setor === selectedSetor
    return matchesSearch && matchesSetor
  })

  // Filter comandas based on search term
  const filteredComandas = comandas.filter(comanda => 
    comanda.Cliente.toLowerCase().includes(comandaSearchTerm.toLowerCase()) ||
    String(comanda.Idcomanda).includes(comandaSearchTerm)
  )

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [comandasData, produtosData, atendentesData] = await Promise.all([
          getComandas(),
          getProdutos(),
          getAtendentes()
        ])
        setComandas(comandasData)
        setProdutos(produtosData)
        setAtendentes(atendentesData)
      } catch (err) {
        setError('Erro ao carregar dados')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Update comanda data when it changes
  useEffect(() => {
    if (selectedComanda) {
      const updatedComanda = comandas.find(c => c.Idcomanda === selectedComanda.Idcomanda)
      if (updatedComanda) {
        setSelectedComanda(updatedComanda)
      }
    }
  }, [comandas, selectedComanda])

  const addToCart = (produto) => {
    if (!selectedAtendente) {
      setError('Selecione um atendente antes de adicionar produtos')
      return
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.produtoId === produto.Id)
      if (existingItem) {
        return prevCart.map(item =>
          item.produtoId === produto.Id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      }
      return [...prevCart, { 
        produtoId: produto.Id, 
        quantidade: 1, 
        atendenteId: selectedAtendente.id 
      }]
    })
  }

  const removeFromCart = (produtoId) => {
    setCart(prevCart => prevCart.filter(item => item.produtoId !== produtoId))
  }

  const updateQuantity = (produtoId, quantidade) => {
    if (quantidade < 1) {
      removeFromCart(produtoId)
      return
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.produtoId === produtoId
          ? { ...item, quantidade }
          : item
      )
    )
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const produto = produtos.find(p => p.Id === item.produtoId)
      return total + (produto ? produto.Preco * item.quantidade : 0)
    }, 0)
  }

  const handleSale = async () => {
    if (!selectedComanda || !selectedAtendente || cart.length === 0) {
      setError('Selecione uma comanda, atendente e adicione itens ao carrinho')
      return
    }

    try {
      setIsProcessingSale(true)
      const cupomId = Math.floor(Math.random() * 100000)
      await registerSale({
        comandaId: selectedComanda.Idcomanda,
        operadorId: user.Nivel,
        cupomId,
        items: cart
      })
      
      // Update comandas data
      const updatedComandas = await getComandas()
      setComandas(updatedComandas)
      
      // Clear only the cart
      setCart([])
      setError('')
    } catch (err) {
      setError('Erro ao registrar venda')
    } finally {
      setIsProcessingSale(false)
    }
  }

  const handleComandaSelect = (comanda) => {
    setSelectedComanda(comanda)
    setShowComandaForm(false)
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Product Catalog */}
        <div className="lg:col-span-2">
          <div className="mb-4 space-y-4">
            {/* Search Input */}
            <div>
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Sector Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {setores.map(setor => (
                <button
                  key={setor}
                  onClick={() => setSelectedSetor(setor)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedSetor === setor
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {setor === 'todos' ? 'Todos' : setor}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProdutos.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                Nenhum produto encontrado
              </div>
            ) : (
              filteredProdutos.map(produto => (
                <div
                  key={produto.Id}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => addToCart(produto)}
                >
                  <h3 className="font-semibold">{produto.Descricao}</h3>
                  <p className="text-gray-600">R$ {produto.Preco.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{produto.Setor}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column - Cart and Controls */}
        <div className="space-y-4">
          {/* Command Selection */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Comanda</h2>
              <button
                onClick={() => setShowComandaForm(true)}
                className="text-sm text-primary hover:text-primary-dark"
              >
                Nova Comanda
              </button>
            </div>
            
            {showComandaForm ? (
              <ComandaForm onComandaSelect={handleComandaSelect} />
            ) : selectedComanda ? (
              <div className="space-y-2">
                <p className="font-medium">{selectedComanda.Cliente}</p>
                <p className="text-sm text-gray-600">
                  ID: {selectedComanda.Idcomanda} | Saldo: R$ {selectedComanda.saldo.toFixed(2)}
                </p>
                <button
                  onClick={() => setSelectedComanda(null)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Trocar Comanda
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Comanda Search */}
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Buscar comanda por nome ou ID..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={comandaSearchTerm}
                    onChange={(e) => setComandaSearchTerm(e.target.value)}
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredComandas.length === 0 ? (
                    <p className="text-gray-500 text-center py-2">Nenhuma comanda encontrada</p>
                  ) : (
                    filteredComandas.map(comanda => (
                      <div
                        key={comanda.Idcomanda}
                        onClick={() => setSelectedComanda(comanda)}
                        className="p-2 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{comanda.Cliente}</span>
                          <span className="text-sm text-gray-600">
                            ID: {comanda.Idcomanda}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Saldo: R$ {comanda.saldo.toFixed(2)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Attendant Selection */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Atendente</h2>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedAtendente?.id || ''}
              onChange={(e) => {
                const atendente = atendentes.find(a => a.id === Number(e.target.value))
                setSelectedAtendente(atendente)
              }}
            >
              <option value="">Selecione um atendente</option>
              {atendentes.map(atendente => (
                <option key={atendente.id} value={atendente.id}>
                  {atendente.Apelido}
                </option>
              ))}
            </select>
          </div>

          {/* Cart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Carrinho</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500">Carrinho vazio</p>
            ) : (
              <div className="space-y-2">
                {cart.map(item => {
                  const produto = produtos.find(p => p.Id === item.produtoId)
                  return (
                    <div key={item.produtoId} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{produto.Descricao}</p>
                        <p className="text-sm text-gray-500">
                          R$ {produto.Preco.toFixed(2)} x {item.quantidade}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                          onClick={() => updateQuantity(item.produtoId, item.quantidade - 1)}
                        >
                          -
                        </button>
                        <span>{item.quantidade}</span>
                        <button
                          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                          onClick={() => updateQuantity(item.produtoId, item.quantidade + 1)}
                        >
                          +
                        </button>
                        <button
                          className="px-2 py-1 text-red-500 hover:text-red-600"
                          onClick={() => removeFromCart(item.produtoId)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )
                })}
                <div className="border-t pt-2 mt-2">
                  <p className="font-semibold">
                    Total: R$ {calculateTotal().toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Checkout Button */}
          <button
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedComanda || !selectedAtendente || cart.length === 0 || isProcessingSale}
            onClick={handleSale}
          >
            {isProcessingSale ? 'Processando...' : 'Finalizar Venda'}
          </button>
        </div>
      </div>

      {/* Comanda Details Section */}
      {selectedComanda && (
        <div className="mt-8">
          <ComandaDetalhes comanda={selectedComanda} />
        </div>
      )}
    </div>
  )
} 