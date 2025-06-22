export default function AttendantSelector({ atendentes, selectedAtendentes, onSelectAttendant, onRemoveAttendant }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <h2 className="text-lg font-semibold mb-2 text-gray-100">Atendentes (Opcional)</h2>
      <div className="space-y-2">
        <select
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100"
          value=""
          onChange={(e) => {
            const atendenteId = Number(e.target.value)
            if (atendenteId) {
              const atendente = atendentes.find(a => a.id === atendenteId)
              if (atendente && !selectedAtendentes.find(a => a.id === atendenteId)) {
                onSelectAttendant(atendente)
              }
            }
          }}
        >
          <option value="" className="bg-gray-700 text-gray-100">Selecione um atendente</option>
          {atendentes
            .filter(atendente => !selectedAtendentes.find(a => a.id === atendente.id))
            .map(atendente => (
              <option key={atendente.id} value={atendente.id} className="bg-gray-700 text-gray-100">
                {atendente.Apelido}
              </option>
            ))}
        </select>
        
        {/* Selected Attendants List */}
        {selectedAtendentes.length > 0 && (
          <div className="mt-2 space-y-2">
            {selectedAtendentes.map(atendente => (
              <div key={atendente.id} className="flex items-center justify-between bg-gray-700 p-2 rounded border border-gray-600">
                <span className="text-gray-200">{atendente.Apelido}</span>
                <button
                  onClick={() => onRemoveAttendant(atendente.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 