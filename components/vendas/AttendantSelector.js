export default function AttendantSelector({ atendentes, selectedAtendentes, onSelectAttendant, onRemoveAttendant }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">Atendentes (Opcional)</h2>
      <div className="space-y-2">
        <select
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
          <option value="">Selecione um atendente</option>
          {atendentes
            .filter(atendente => !selectedAtendentes.find(a => a.id === atendente.id))
            .map(atendente => (
              <option key={atendente.id} value={atendente.id}>
                {atendente.Apelido}
              </option>
            ))}
        </select>
        
        {/* Selected Attendants List */}
        {selectedAtendentes.length > 0 && (
          <div className="mt-2 space-y-2">
            {selectedAtendentes.map(atendente => (
              <div key={atendente.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span>{atendente.Apelido}</span>
                <button
                  onClick={() => onRemoveAttendant(atendente.id)}
                  className="text-red-500 hover:text-red-600"
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