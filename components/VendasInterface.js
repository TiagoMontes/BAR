import { useState, useEffect } from 'react'
import { getComandas, getProdutos, getAtendentes, registerSale } from '../lib/api'
import ComandaDetalhes from './ComandaDetalhes'
import ProductGrid from './vendas/ProductGrid'
import Cart from './vendas/Cart'
import ComandaSelector from './vendas/ComandaSelector'
import AttendantSelector from './vendas/AttendantSelector'

export default function VendasInterface({ user }) {
  const [comandas, setComandas] = useState([])
  const [produtos, setProdutos] = useState([])
  const [atendentes, setAtendentes] = useState([])
  const [selectedComanda, setSelectedComanda] = useState(null)
  const [selectedAtendentes, setSelectedAtendentes] = useState([])
  const [cart, setCart] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isProcessingSale, setIsProcessingSale] = useState(false)
  const [showComandaDetalhes, setShowComandaDetalhes] = useState(false)
  const [saleStatus, setSaleStatus] = useState(null)
  const [lastSaleCupom, setLastSaleCupom] = useState(null)

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
        atendenteId: produto.Comissao === 1 ? selectedAtendentes[0]?.id || null : null
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

  const hasCommissionProducts = () => {
    return cart.some(item => {
      const produto = produtos.find(p => p.Id === item.produtoId)
      return produto?.Comissao === 1
    })
  }

  const handleSale = async () => {
    if (!selectedComanda || cart.length === 0) {
      setError('Selecione uma comanda e adicione itens ao carrinho')
      return
    }

    try {
      setIsProcessingSale(true)
      setSaleStatus(null)
      const response = await registerSale({
        comandaId: selectedComanda.Idcomanda,
        operadorId: user.Nivel,
        items: cart,
        atendentes: selectedAtendentes.map(a => a.id)
      })
      
      // Update comandas data
      const updatedComandas = await getComandas()
      setComandas(updatedComandas)
      
      // Clear cart and selected attendants
      setCart([])
      setSelectedAtendentes([])
      setError('')
      setSaleStatus('success')
      setLastSaleCupom(response.cupomId)
    } catch (err) {
      setError('Erro ao registrar venda')
      setSaleStatus('error')
    } finally {
      setIsProcessingSale(false)
    }
  }

  const handleViewLastSale = () => {
    setShowComandaDetalhes(true)
    setLastSaleCupom(lastSaleCupom)
  }

  const handleSelectAttendant = (atendente) => {
    setSelectedAtendentes([...selectedAtendentes, atendente])
    // Update cart items with commission to include the selected attendant
    setCart(prevCart => 
      prevCart.map(item => {
        const produto = produtos.find(p => p.Id === item.produtoId)
        return produto?.Comissao === 1 
          ? { ...item, atendenteId: atendente.id }
          : item
      })
    )
  }

  const handleRemoveAttendant = (atendenteId) => {
    setSelectedAtendentes(selectedAtendentes.filter(a => a.id !== atendenteId))
    // Remove attendant from cart items
    setCart(prevCart => 
      prevCart.map(item => {
        const produto = produtos.find(p => p.Id === item.produtoId)
        return produto?.Comissao === 1 
          ? { ...item, atendenteId: null }
          : item
      })
    )
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
          <ProductGrid 
            produtos={produtos}
            onAddToCart={addToCart}
          />
        </div>

        {/* Right Column - Cart and Controls */}
        <div className="space-y-4">
          <ComandaSelector 
            comandas={comandas}
            selectedComanda={selectedComanda}
            onComandaSelect={setSelectedComanda}
            onShowDetails={setShowComandaDetalhes}
          />

          {/* Attendant Selection - Only show if there are commission products */}
          {hasCommissionProducts() && (
            <AttendantSelector 
              atendentes={atendentes}
              selectedAtendentes={selectedAtendentes}
              onSelectAttendant={handleSelectAttendant}
              onRemoveAttendant={handleRemoveAttendant}
            />
          )}

          <Cart 
            cart={cart}
            produtos={produtos}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onCheckout={handleSale}
            isProcessingSale={isProcessingSale}
            error={error}
            saleStatus={saleStatus}
            onViewLastSale={handleViewLastSale}
          />
        </div>
      </div>

      {/* Comanda Details Modal */}
      {selectedComanda && (
        <ComandaDetalhes 
          comanda={selectedComanda} 
          isOpen={showComandaDetalhes}
          onClose={() => setShowComandaDetalhes(false)}
          highlightCupom={lastSaleCupom}
        />
      )}
    </div>
  )
} 