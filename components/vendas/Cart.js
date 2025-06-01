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
                      onClick={() => onUpdateQuantity(item.produtoId, item.quantidade - 1)}
                    >
                      -
                    </button>
                    <span>{item.quantidade}</span>
                    <button
                      className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      onClick={() => onUpdateQuantity(item.produtoId, item.quantidade + 1)}
                    >
                      +
                    </button>
                    <button
                      className="px-2 py-1 text-red-500 hover:text-red-600"
                      onClick={() => onRemoveItem(item.produtoId)}
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
        disabled={cart.length === 0 || isProcessingSale}
        onClick={onCheckout}
      >
        {isProcessingSale ? 'Processando...' : 'Finalizar Venda'}
      </button>

      {/* Sale Status Message */}
      {saleStatus === 'success' && (
        <div className="mt-4 text-center">
          <button
            onClick={onViewLastSale}
            className="text-green-600 hover:text-green-700 font-medium cursor-pointer"
          >
            Venda realizada com sucesso! Clique para ver detalhes.
          </button>
        </div>
      )}
      {saleStatus === 'error' && (
        <div className="mt-4 text-center text-red-600">
          Erro ao realizar venda
        </div>
      )}
    </div>
  )
} 