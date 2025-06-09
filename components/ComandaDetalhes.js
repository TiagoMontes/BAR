import { useState, useEffect } from 'react'

export default function ComandaDetalhes({ comanda, isOpen, onClose, highlightCupom }) {
  const [vendas, setVendas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadVendas = async () => {
      if (!comanda) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/vendas/comanda/${comanda.Idcomanda}`)
        if (!response.ok) {
          throw new Error('Failed to fetch sales data')
        }
        const vendasData = await response.json()
        setVendas(vendasData.reverse())
      } catch (err) {
        console.error('Error loading sales:', err)
        setError('Erro ao carregar histórico de vendas')
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      loadVendas()
    }
  }, [comanda, isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Detalhes da Comanda</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="border-b pb-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-medium">{comanda.Cliente}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ID</p>
                <p className="font-medium">{comanda.Idcomanda}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data de Abertura</p>
                <p className="font-medium">{comanda.Entrada}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Gasto</p>
                <p className="font-medium text-primary">R$ {Number(comanda.saldo)?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Histórico de Vendas</h3>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <p className="text-red-500 text-center py-4">{error}</p>
            ) : vendas.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma venda registrada</p>
            ) : (
              <div className="space-y-4">
                {vendas.map((venda, index) => {
                  const cupomId = venda.fileName.split('-')[2].split('.')[0]
                  const isHighlighted = highlightCupom && String(cupomId) === String(highlightCupom)
                  return (
                    <div 
                      key={index} 
                      className={`border rounded-lg p-4 transition-colors ${
                        isHighlighted ? 'bg-green-50 border-green-200 shadow-md' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm ${isHighlighted ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                          Cupom: {cupomId}
                        </span>
                        <span className={`font-medium ${isHighlighted ? 'text-green-700' : ''}`}>
                          R$ {Number(venda.total || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {venda.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex justify-between text-sm">
                            <span>{item.descricao} x {item.quantidade}</span>
                            <span className="text-gray-600">
                              R$ {Number((item.quantidade * item.preco) || 0).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 