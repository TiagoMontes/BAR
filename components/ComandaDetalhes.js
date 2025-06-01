import { useState, useEffect } from 'react'

export default function ComandaDetalhes({ comanda }) {
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
        setVendas(vendasData)
      } catch (err) {
        console.error('Error loading sales:', err)
        setError('Erro ao carregar histórico de vendas')
      } finally {
        setIsLoading(false)
      }
    }

    loadVendas()
  }, [comanda])

  if (!comanda) return null

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">Detalhes da Comanda</h2>
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
            <p className="font-medium text-primary">R$ {comanda.saldo?.toFixed(2) || '0.00'}</p>
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
            {vendas.map((venda, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    Cupom: {venda.fileName.split('-')[2].split('.')[0]}
                  </span>
                  <span className="font-medium">
                    R$ {(venda.total || 0).toFixed(2)}
                  </span>
                </div>
                <div className="space-y-2">
                  {venda.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between text-sm">
                      <span>{item.descricao} x {item.quantidade}</span>
                      <span className="text-gray-600">
                        R$ {((item.quantidade * item.preco) || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 