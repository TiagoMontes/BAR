import { useState, useEffect } from 'react'

export default function ProductGrid({ produtos, onAddToCart }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSetor, setSelectedSetor] = useState('todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Get unique sectors
  const setores = ['todos', ...new Set(produtos.map(p => p.Setor))]

  // Filter products based on search term and selected sector
  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.Descricao.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSetor = selectedSetor === 'todos' || produto.Setor === selectedSetor
    return matchesSearch && matchesSetor
  })

  // Calculate pagination
  const productsPerPage = isMobile ? 6 : 12
  const totalPages = Math.ceil(filteredProdutos.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const endIndex = startIndex + productsPerPage
  const currentProducts = filteredProdutos.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedSetor])

  return (
    <div>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {currentProducts.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Nenhum produto encontrado
          </div>
        ) : (
          currentProducts.map(produto => (
            <div
              key={produto.Id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
              onClick={() => onAddToCart(produto)}
            >
              <h3 className="font-semibold text-sm truncate">{produto.Descricao}</h3>
              <p className="text-gray-600 text-sm">R$ {Number(produto.Preco.toFixed(2))}</p>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 text-sm rounded bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &lt;
          </button>
          
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-sm rounded bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  )
} 