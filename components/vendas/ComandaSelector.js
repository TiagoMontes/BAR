import { useState } from 'react'
import Link from 'next/link'

export default function ComandaSelector({ comandas, selectedComanda, onComandaSelect, onShowDetails, onCloseComanda }) {
  const [comandaSearchTerm, setComandaSearchTerm] = useState('')
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)

  // Filter comandas based on search term
  const filteredComandas = comandas.filter(comanda => 
    comanda.Cliente.toLowerCase().includes(comandaSearchTerm.toLowerCase()) ||
    String(comanda.Idcomanda).includes(comandaSearchTerm)
  )

  return (
    <div className="bg-white p-4 rounded-lg shadow">
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
            ID: {selectedComanda.Idcomanda} | Saldo: R$ {selectedComanda.saldo.toFixed(2)}
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => onComandaSelect(null)}
              className="text-sm text-red-600 hover:text-red-700"
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
          <div className="max-h-48 overflow-y-auto">
            {filteredComandas.length === 0 ? (
              <p className="text-gray-500 text-center py-2">Nenhuma comanda encontrada</p>
            ) : (
              filteredComandas.map(comanda => (
                <div
                  key={comanda.Idcomanda}
                  onClick={() => onComandaSelect(comanda)}
                  className="p-2 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{comanda.Cliente}</span>
                    <span className="text-sm text-gray-600">
                      ID: {comanda.Idcomanda}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Saldo: R$ {comanda.saldo.toFixed(2)}
                  </div>
                </div>
              ))
            )}
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