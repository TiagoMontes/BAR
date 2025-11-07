import { useState } from 'react'
import Link from 'next/link'
import ComandaForm from '../ComandaForm'

export default function ComandaSelector({ comandas, selectedComanda, onComandaSelect, onShowDetails, onCloseComanda, onComandaCreated }) {
  const [comandaSearchTerm, setComandaSearchTerm] = useState('')
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Filter and sort comandas based on search term
  const filteredComandas = comandas
    .filter(comanda =>
      comanda.Cliente.toLowerCase().includes(comandaSearchTerm.toLowerCase()) ||
      String(comanda.Idcomanda).includes(comandaSearchTerm) ||
      String(comanda.Numero).includes(comandaSearchTerm)
    )
    .sort((a, b) => {
      const searchLower = comandaSearchTerm.toLowerCase()
      const searchStr = comandaSearchTerm

      // Check for exact matches
      const aExactNumero = String(a.Numero) === searchStr
      const bExactNumero = String(b.Numero) === searchStr
      const aExactId = String(a.Idcomanda) === searchStr
      const bExactId = String(b.Idcomanda) === searchStr
      const aExactCliente = a.Cliente.toLowerCase() === searchLower
      const bExactCliente = b.Cliente.toLowerCase() === searchLower

      // Exact matches come first
      if (aExactNumero && !bExactNumero) return -1
      if (!aExactNumero && bExactNumero) return 1
      if (aExactId && !bExactId) return -1
      if (!aExactId && bExactId) return 1
      if (aExactCliente && !bExactCliente) return -1
      if (!aExactCliente && bExactCliente) return 1

      // Then starts with
      const aStartsNumero = String(a.Numero).startsWith(searchStr)
      const bStartsNumero = String(b.Numero).startsWith(searchStr)
      const aStartsCliente = a.Cliente.toLowerCase().startsWith(searchLower)
      const bStartsCliente = b.Cliente.toLowerCase().startsWith(searchLower)

      if (aStartsNumero && !bStartsNumero) return -1
      if (!aStartsNumero && bStartsNumero) return 1
      if (aStartsCliente && !bStartsCliente) return -1
      if (!aStartsCliente && bStartsCliente) return 1

      return 0
    })

  // Check if there's an exact match
  const hasExactMatch = (comanda) => {
    const searchLower = comandaSearchTerm.toLowerCase()
    const searchStr = comandaSearchTerm
    return String(comanda.Numero) === searchStr ||
           String(comanda.Idcomanda) === searchStr ||
           comanda.Cliente.toLowerCase() === searchLower
  }

  const handleCreateComanda = async (newComanda) => {
    onComandaSelect(newComanda)
    setIsCreateModalOpen(false)
    setComandaSearchTerm('')
    if (onComandaCreated) {
      onComandaCreated()
    }
  }

  const handleComandaCreatedRefresh = () => {
    if (onComandaCreated) {
      onComandaCreated()
    }
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        {selectedComanda && (
          <p className="font-medium text-gray-100">{selectedComanda.Numero} - {selectedComanda.Cliente}</p>
        )}
        <Link
          href="/comandas"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Gerenciar Comandas
        </Link>
      </div>
      
      {selectedComanda ? (
        <div className="space-y-2">
          <div className="flex space-x-4">
            <button
              onClick={() => setIsSelectOpen(true)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Trocar
            </button>
            <button
              onClick={() => onShowDetails(true)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Detalhes
            </button>
            <button
              onClick={() => onComandaSelect(null)}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Comanda Search */}
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Buscar comanda por nome, ID ou número..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400"
              value={comandaSearchTerm}
              onChange={(e) => {
                const searchValue = e.target.value
                setComandaSearchTerm(searchValue)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // Auto-select matching comanda when pressing Enter
                  if (comandaSearchTerm.trim()) {
                    const searchLower = comandaSearchTerm.toLowerCase()
                    const searchStr = comandaSearchTerm

                    // First try to find exact match
                    let matchingComanda = comandas.find(comanda =>
                      String(comanda.Numero) === searchStr ||
                      String(comanda.Idcomanda) === searchStr ||
                      comanda.Cliente.toLowerCase() === searchLower
                    )

                    // If no exact match, get first from filtered results
                    if (!matchingComanda && filteredComandas.length > 0) {
                      matchingComanda = filteredComandas[0]
                    }

                    if (matchingComanda) {
                      onComandaSelect(matchingComanda)
                      setComandaSearchTerm('')
                    }
                  }
                }
              }}
            />
            {/* Show filtered results as clickable options */}
            {comandaSearchTerm.trim() && (
              <div className="max-h-60 overflow-y-auto bg-gray-800 border border-gray-600 rounded-lg mb-3">
                {filteredComandas.map(comanda => {
                  const isExact = hasExactMatch(comanda)
                  return (
                    <div
                      key={comanda.Idcomanda}
                      className={`px-5 py-4 hover:bg-gray-700 cursor-pointer border-b border-gray-600 last:border-b-0 text-base ${
                        isExact
                          ? 'bg-blue-900 text-blue-100 font-semibold border-l-4 border-l-blue-500'
                          : 'text-gray-100'
                      }`}
                      onClick={() => {
                        onComandaSelect(comanda)
                        setComandaSearchTerm('')
                      }}
                    >
                      {isExact && <span className="text-blue-400 mr-2 text-lg">✓</span>}
                      {comanda.Cliente} - {comanda.Numero} (ID: {comanda.Idcomanda})
                    </div>
                  )
                })}
                {filteredComandas.length === 0 && (
                  <div className="px-5 py-4">
                    <div className="text-gray-400 mb-3 text-base">Nenhuma comanda encontrada</div>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="w-full bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors text-base font-medium"
                    >
                      Criar Nova Comanda
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal para trocar comanda quando já há uma selecionada */}
      {isSelectOpen && selectedComanda && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Trocar Comanda</h3>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar comanda por nome, ID ou número..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400 mb-3"
                value={comandaSearchTerm}
                onChange={(e) => {
                  const searchValue = e.target.value
                  setComandaSearchTerm(searchValue)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Auto-select matching comanda when pressing Enter
                    if (comandaSearchTerm.trim()) {
                      const searchLower = comandaSearchTerm.toLowerCase()
                      const searchStr = comandaSearchTerm

                      // First try to find exact match
                      let matchingComanda = comandas.find(comanda =>
                        String(comanda.Numero) === searchStr ||
                        String(comanda.Idcomanda) === searchStr ||
                        comanda.Cliente.toLowerCase() === searchLower
                      )

                      // If no exact match, get first from filtered results
                      if (!matchingComanda && filteredComandas.length > 0) {
                        matchingComanda = filteredComandas[0]
                      }

                      if (matchingComanda) {
                        onComandaSelect(matchingComanda)
                        setComandaSearchTerm('')
                        setIsSelectOpen(false)
                      }
                    }
                  }
                }}
              />
              {/* Show filtered results as clickable options */}
              {comandaSearchTerm.trim() && (
                <div className="max-h-60 overflow-y-auto bg-gray-800 border border-gray-600 rounded-lg mb-3">
                  {filteredComandas.map(comanda => {
                    const isExact = hasExactMatch(comanda)
                    return (
                      <div
                        key={comanda.Idcomanda}
                        className={`px-5 py-4 hover:bg-gray-700 cursor-pointer border-b border-gray-600 last:border-b-0 text-base ${
                          isExact
                            ? 'bg-blue-900 text-blue-100 font-semibold border-l-4 border-l-blue-500'
                            : 'text-gray-100'
                        }`}
                        onClick={() => {
                          onComandaSelect(comanda)
                          setComandaSearchTerm('')
                          setIsSelectOpen(false)
                        }}
                      >
                        {isExact && <span className="text-blue-400 mr-2 text-lg">✓</span>}
                        {comanda.Cliente} - {comanda.Numero} (ID: {comanda.Idcomanda})
                      </div>
                    )
                  })}
                  {filteredComandas.length === 0 && (
                    <div className="px-5 py-4">
                      <div className="text-gray-400 mb-3 text-base">Nenhuma comanda encontrada</div>
                      <button
                        onClick={() => {
                          setIsSelectOpen(false)
                          setIsCreateModalOpen(true)
                        }}
                        className="w-full bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors text-base font-medium"
                      >
                        Criar Nova Comanda
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsSelectOpen(false)}
                className="px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {isCloseModalOpen && selectedComanda && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Quer mesmo fechar a comanda?</h3>
            <p className="text-gray-300 mb-6">
              A comanda de <span className="font-bold text-gray-100">{selectedComanda.Cliente}</span> será fechada e o seu saldo será zerado. Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsCloseModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (onCloseComanda) {
                    onCloseComanda(selectedComanda.Idcomanda)
                  }
                  setIsCloseModalOpen(false)
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de criação rápida de comanda */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <ComandaForm
            onComandaSelect={handleCreateComanda}
            onCancel={() => {
              setIsCreateModalOpen(false)
              setComandaSearchTerm('')
            }}
            onComandaCreated={handleComandaCreatedRefresh}
            initialCliente={comandaSearchTerm}
            initialNumero={comandaSearchTerm}
          />
        </div>
      )}
    </div>
  )
} 