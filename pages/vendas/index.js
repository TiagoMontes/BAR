  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="md:col-span-2">
      <ProductGrid
        produtos={produtos}
        onAddToCart={handleAddToCart}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </div>
    <div className="md:col-span-1">
      <Cart
        cart={cart}
        produtos={produtos}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        isProcessingSale={isProcessingSale}
        error={error}
        saleStatus={saleStatus}
        onViewLastSale={handleViewLastSale}
      />
    </div>
  </div>

  {/* Checkout Button - Fixed at bottom on mobile */}
  <div className="fixed bottom-0 z-10 left-0 right-0 bg-white p-4 shadow-lg lg:hidden">
    <button
      className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={cart.length === 0 || isProcessingSale}
      onClick={handleCheckout}
    >
      {isProcessingSale ? 'Processando...' : 'Finalizar Venda'}
    </button>
  </div>

  {/* Sale Status Message */} 