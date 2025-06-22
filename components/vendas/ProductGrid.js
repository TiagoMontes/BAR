import { useState, useEffect, useMemo } from 'react'

export default function ProductGrid({ produtos, onAddToCart }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSetor, setSelectedSetor] = useState('todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  const itemsPerPage = 30

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
  const setores = useMemo(() => {
    const sectors = [...new Set(produtos.map(p => p.Setor).filter(Boolean))]
    return ['todos', ...sectors]
  }, [produtos])

  // Filter products based on search term and selected sector
  const filteredProducts = useMemo(() => {
    return produtos.filter(produto => {
      const matchesSearch = produto.Descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           String(produto.Id).includes(searchTerm)
      const matchesSector = selectedSetor === 'todos' || produto.Setor === selectedSetor
      return matchesSearch && matchesSector
    })
  }, [produtos, searchTerm, selectedSetor])

  // Paginate products
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredProducts, currentPage])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

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
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400"
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
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
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
          <div className="col-span-full text-center py-8 text-gray-400">
            Nenhum produto encontrado
          </div>
        ) : (
          currentProducts.map(produto => (
            <div
              key={produto.Id}
              className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors cursor-pointer flex flex-col justify-between hover:bg-gray-750"
              onClick={() => onAddToCart(produto)}
            >
              <h3 className="font-semibold text-sm truncate text-gray-100">{produto.Descricao}</h3>
              <p className="text-gray-300 text-sm">R$ {Number(produto.Preco.toFixed(2))}</p>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          
          <span className="px-3 py-2 text-gray-300">
            Página {currentPage} de {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
} 