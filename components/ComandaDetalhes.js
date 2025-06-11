import { useState, useEffect } from 'react'
import { getComanda } from '../lib/api'
import { useAtendentes } from '../contexts/AtendentesContext'
import { BluetoothService } from '../src/services/BluetoothService'

export default function ComandaDetalhes({ comanda, isOpen, onClose, highlightCupom }) {
  const [vendas, setVendas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [saleStatus, setSaleStatus] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const { atendentes } = useAtendentes()

  const bluetoothService = BluetoothService.getInstance();

  const formatReceipt = (venda, comanda, cupomId) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR', { 
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  
    let receipt = `${dateStr}\n`;
    receipt += `--------------------------------\n`;
    receipt += `Cliente: ${comanda.Cliente}\n`;
    receipt += `Comanda: ${comanda.Idcomanda} - Id Venda: ${cupomId}\n`;
    receipt += `--------------------------------\n`;
    receipt += `Código Descricao Produto\n`;
    receipt += `Vr Unit. Qtde Vr Total\n\n`;
  
    let totalQuantity = 0;
    let totalValue = 0;
  
    venda.items.forEach(item => {
      const itemTotal = item.preco * item.quantidade;
      totalQuantity += item.quantidade;
      totalValue += itemTotal;
  
      receipt += `# ${String(item.produtoId).padStart(3, '0')} ${item.descricao}\n`;
      receipt += `## ${item.preco.toFixed(2)} ${String(item.quantidade).padStart(3, '0')} ${itemTotal.toFixed(2)}\n\n`;
    });
  
    receipt += `--------------------------------\n`;
    receipt += `# Qtde. ${String(totalQuantity).padStart(3, '0')} Total: ${totalValue.toFixed(2)}\n\n`;
    receipt += `TecBar\n\n\n\n`;
  
    return receipt;
  };

  useEffect(() => {
    const loadVendas = async () => {
      if (!comanda) return

      try {
        setIsLoading(true)
        const vendasData = await getComanda(comanda.Idcomanda)
        setVendas(vendasData.reverse())
      } catch (err) {
        console.error('Error loading sales:', err)
        setError(err.message || 'Erro ao carregar histórico de vendas')
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      loadVendas()
    }
  }, [comanda, isOpen])

  const handleVendaClick = async (venda) => {
    const cupomId = venda.fileName.split('-')[2].split('.')[0]
    const confirmacao = window.confirm(`Deseja reimprimir o cupom de venda & comissão #${cupomId}?`)
    
    if (confirmacao) {
      try {
        setSaleStatus('loading')
        setErrorMessage('')

        const receipt = formatReceipt(venda, comanda, cupomId);

        console.log('Iniciando processo de impressão...');
        await bluetoothService.initialize();
        console.log('Bluetooth inicializado, enviando dados...');
        await bluetoothService.sendData(receipt);
        console.log('Dados enviados com sucesso!');
        setSaleStatus('success');
        setErrorMessage('');
      } catch (printErr) {
        console.error('Erro ao imprimir:', printErr);
        const printError = printErr.message || 'Erro desconhecido na impressão';
        setSaleStatus('warning');
        
        // Mensagens de erro mais específicas
        if (printError.includes('not initialized') || printError.includes('not connected')) {
          setErrorMessage(`Venda realizada com sucesso! Porém, a impressora não está conectada. Clique em "Configurar Impressora" para conectar.`);
        } else if (printError.includes('No device')) {
          setErrorMessage(`Venda realizada com sucesso! Porém, nenhuma impressora foi encontrada. Verifique se a impressora está ligada e pareada.`);
        } else if (printError.includes('writing characteristic failed')) {
          setErrorMessage(`Venda realizada com sucesso! Porém, falha na comunicação com a impressora. Tente reconectar a impressora.`);
        } else {
          setErrorMessage(`Venda realizada com sucesso! Porém, erro na impressão: ${printError}. Verifique a conexão da impressora.`);
        }
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Detalhes da Comanda</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {errorMessage && (
            <div className={`mb-4 p-3 rounded ${
              saleStatus === 'success' ? 'bg-green-50 text-green-700' : 
              saleStatus === 'warning' ? 'bg-yellow-50 text-yellow-700' : 
              'bg-red-50 text-red-700'
            }`}>
              {errorMessage}
            </div>
          )}

          <div className="border-b pb-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-medium">{comanda.Cliente}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ID</p>
                <p className="font-medium">{comanda.Idcomanda}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data de Abertura</p>
                <p className="font-medium">{comanda.Entrada}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Gasto</p>
                <p className="font-medium text-primary">R$ {Number(comanda.saldo)?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Histórico de Vendas</h3>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <p className="text-red-500 text-center py-4">{error}</p>
            ) : vendas.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma venda registrada</p>
            ) : (
              <div className="space-y-4">
                {vendas.map((venda, index) => {
                  const cupomId = venda.fileName.split('-')[2].split('.')[0]
                  const isHighlighted = highlightCupom && String(cupomId) === String(highlightCupom)
                  return (
                    <div 
                      key={index} 
                      className={`border rounded-lg p-4 transition-colors cursor-pointer hover:bg-gray-50 ${
                        isHighlighted ? 'bg-green-50 border-green-200 shadow-md' : ''
                      }`}
                      onClick={() => handleVendaClick(venda)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm ${isHighlighted ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                          Cupom: {cupomId}
                        </span>
                        <span className={`font-medium ${isHighlighted ? 'text-green-700' : ''}`}>
                          R$ {Number(venda.total || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {venda.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex justify-between text-sm">
                            <div>
                              <span>{item.descricao} x {item.quantidade}</span>
                              {item.atendentes && item.atendentes.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Atendentes: {item.atendentes.map(id => {
                                    const atendente = atendentes.find(a => a.id === id)
                                    return atendente ? atendente.Apelido : id
                                  }).join(', ')}
                                </div>
                              )}
                            </div>
                            <span className="text-gray-600">
                              R$ {Number((item.quantidade * item.preco) || 0).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 