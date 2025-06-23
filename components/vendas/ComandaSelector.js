import { useState } from 'react'
import Link from 'next/link'

export default function ComandaSelector({ comandas, selectedComanda, onComandaSelect, onShowDetails, onCloseComanda }) {
  const [comandaSearchTerm, setComandaSearchTerm] = useState('')
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [isSelectOpen, setIsSelectOpen] = useState(false)

  // Filter comandas based on search term
  const filteredComandas = comandas.filter(comanda => 
    comanda.Cliente.toLowerCase().includes(comandaSearchTerm.toLowerCase()) ||
    String(comanda.Idcomanda).includes(comandaSearchTerm)
  )

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        {selectedComanda && (
          <p className="font-medium text-gray-100">{selectedComanda.Idcomanda} - {selectedComanda.Cliente}</p>
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
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Comanda Search */}
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Buscar comanda por nome ou ID..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400"
              value={comandaSearchTerm}
              onChange={(e) => {
                const searchValue = e.target.value
                setComandaSearchTerm(searchValue)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // Auto-select first matching comanda when pressing Enter
                  if (comandaSearchTerm.trim()) {
                    const matchingComanda = comandas.find(comanda => 
                      comanda.Cliente.toLowerCase().includes(comandaSearchTerm.toLowerCase()) ||
                      String(comanda.Idcomanda).includes(comandaSearchTerm)
                    )
                    
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
              <div className="max-h-40 overflow-y-auto bg-gray-800 border border-gray-600 rounded-lg mb-3">
                {filteredComandas
                  .filter(comanda => 
                    comanda.Cliente.toLowerCase().includes(comandaSearchTerm.toLowerCase()) ||
                    String(comanda.Idcomanda).includes(comandaSearchTerm)
                  )
                  .map(comanda => (
                    <div
                      key={comanda.Idcomanda}
                      className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-gray-100 border-b border-gray-600 last:border-b-0"
                      onClick={() => {
                        onComandaSelect(comanda)
                        setComandaSearchTerm('')
                      }}
                    >
                      {comanda.Cliente} (ID: {comanda.Idcomanda})
                    </div>
                  ))}
                {filteredComandas.filter(comanda => 
                  comanda.Cliente.toLowerCase().includes(comandaSearchTerm.toLowerCase()) ||
                  String(comanda.Idcomanda).includes(comandaSearchTerm)
                ).length === 0 && (
                  <div className="px-4 py-2 text-gray-400">
                    Nenhuma comanda encontrada
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
                placeholder="Buscar comanda por nome ou ID..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400 mb-3"
                value={comandaSearchTerm}
                onChange={(e) => {
                  const searchValue = e.target.value
                  setComandaSearchTerm(searchValue)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Auto-select first matching comanda when pressing Enter
                    if (comandaSearchTerm.trim()) {
                      const matchingComanda = comandas.find(comanda => 
                        comanda.Cliente.toLowerCase().includes(comandaSearchTerm.toLowerCase()) ||
                        String(comanda.Idcomanda).includes(comandaSearchTerm)
                      )
                      
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
                <div className="max-h-40 overflow-y-auto bg-gray-800 border border-gray-600 rounded-lg mb-3">
                  {filteredComandas
                    .filter(comanda => 
                      comanda.Cliente.toLowerCase().includes(comandaSearchTerm.toLowerCase()) ||
                      String(comanda.Idcomanda).includes(comandaSearchTerm)
                    )
                    .map(comanda => (
                      <div
                        key={comanda.Idcomanda}
                        className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-gray-100 border-b border-gray-600 last:border-b-0"
                        onClick={() => {
                          onComandaSelect(comanda)
                          setComandaSearchTerm('')
                          setIsSelectOpen(false)
                        }}
                      >
                        {comanda.Cliente} (ID: {comanda.Idcomanda})
                      </div>
                    ))}
                  {filteredComandas.filter(comanda => 
                    comanda.Cliente.toLowerCase().includes(comandaSearchTerm.toLowerCase()) ||
                    String(comanda.Idcomanda).includes(comandaSearchTerm)
                  ).length === 0 && (
                    <div className="px-4 py-2 text-gray-400">
                      Nenhuma comanda encontrada
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
    </div>
  )
} 