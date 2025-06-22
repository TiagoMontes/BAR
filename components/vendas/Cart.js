export default function Cart({ cart, produtos, onUpdateQuantity, onRemoveItem, onCheckout, isProcessingSale, error, saleStatus, onViewLastSale }) {
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const produto = produtos.find(p => p.Id === item.produtoId)
      return total + (produto ? produto.Preco * item.quantidade : 0)
    }, 0)
  }

  return (
    <div className="space-y-4">
      {/* Cart */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h2 className="text-lg font-semibold mb-2 text-gray-100">Carrinho</h2>
        {cart.length === 0 ? (
          <p className="text-gray-400">Carrinho vazio</p>
        ) : (
          <div className="space-y-2">
            {cart.map(item => {
              const produto = produtos.find(p => p.Id === item.produtoId)
              return (
                <div key={item.produtoId} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-100">{produto.Descricao}</p>
                    <p className="text-sm text-gray-400">
                      R$ {Number(produto.Preco).toFixed(2)} x {item.quantidade}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 text-gray-200 transition-colors"
                      onClick={() => onUpdateQuantity(item.produtoId, item.quantidade - 1)}
                    >
                      -
                    </button>
                    <span className="text-gray-200">{item.quantidade}</span>
                    <button
                      className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 text-gray-200 transition-colors"
                      onClick={() => onUpdateQuantity(item.produtoId, item.quantidade + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
            <div className="border-t border-gray-600 pt-2 mt-2">
              <p className="font-semibold text-gray-100">
                Total: R$ {Number(calculateTotal().toFixed(2))}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 text-red-200 p-4 rounded-lg border border-red-700">
          {error}
        </div>
      )}

      {/* Sale Status Message */}
      {saleStatus === 'success' && (
        <div className="mt-4 text-center">
          <p className="text-green-400 hover:text-green-300 font-medium transition-colors">
            Venda realizada com sucesso!
          </p>
        </div>
      )}
      {saleStatus === 'warning' && (
        <div className="mt-4 text-center">
          <p className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors">
            Venda realizada, mas houve problema com a impressora.
          </p>
        </div>
      )}
      {saleStatus === 'error' && (
        <div className="mt-4 text-center text-red-400">
          Erro ao realizar venda
        </div>
      )}
    </div>
  )
} 