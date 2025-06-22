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
    <div className="bg-white p-4 rounded-lg border border-gray-300">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Comanda</h2>
        <Link
          href="/comandas"
          className="text-sm text-primary hover:text-primary-dark"
        >
          Gerenciar Comandas
        </Link>
      </div>
      
      {selectedComanda ? (
        <div className="space-y-2">
          <p className="font-medium">{selectedComanda.Cliente}</p>
          <p className="text-sm text-gray-600">
            ID: {selectedComanda.Idcomanda} | Saldo: R$ {Number(selectedComanda.saldo).toFixed(2)}
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsSelectOpen(true)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Trocar Comanda
            </button>
            <button
              onClick={() => onShowDetails(true)}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Detalhes
            </button>
            <button
              onClick={() => setIsCloseModalOpen(true)}
              className="text-sm text-yellow-600 hover:text-yellow-700"
            >
              Fechar Comanda
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Comanda Search */}
          <div className="mb-2">
            <input
              type="text"
              placeholder="Buscar comanda por nome ou ID..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={comandaSearchTerm}
              onChange={(e) => setComandaSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Select Dropdown */}
          <div className="relative">
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white"
              onChange={(e) => {
                const selectedId = parseInt(e.target.value)
                const comanda = comandas.find(c => c.Idcomanda === selectedId)
                if (comanda) {
                  onComandaSelect(comanda)
                }
              }}
              value=""
            >
              <option value="">Selecione uma comanda...</option>
              {filteredComandas.map(comanda => (
                <option key={comanda.Idcomanda} value={comanda.Idcomanda}>
                  {comanda.Cliente} (ID: {comanda.Idcomanda})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Modal para trocar comanda quando já há uma selecionada */}
      {isSelectOpen && selectedComanda && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Trocar Comanda</h3>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar comanda por nome ou ID..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-3"
                value={comandaSearchTerm}
                onChange={(e) => setComandaSearchTerm(e.target.value)}
              />
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                onChange={(e) => {
                  const selectedId = parseInt(e.target.value)
                  const comanda = comandas.find(c => c.Idcomanda === selectedId)
                  if (comanda) {
                    onComandaSelect(comanda)
                    setIsSelectOpen(false)
                  }
                }}
                value=""
              >
                <option value="">Selecione uma nova comanda...</option>
                {filteredComandas
                  .filter(comanda => comanda.Idcomanda !== selectedComanda.Idcomanda)
                  .map(comanda => (
                    <option key={comanda.Idcomanda} value={comanda.Idcomanda}>
                      {comanda.Cliente} (ID: {comanda.Idcomanda})
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsSelectOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {isCloseModalOpen && selectedComanda && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Quer mesmo fechar a comanda?</h3>
            <p className="text-gray-600 mb-6">
              A comanda de <span className="font-bold">{selectedComanda.Cliente}</span> será fechada e o seu saldo será zerado. Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsCloseModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
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
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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