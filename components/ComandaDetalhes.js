import { useState, useEffect } from 'react'
import { getComanda } from '../lib/api'
import { useAtendentes } from '../contexts/AtendentesContext'
import { BluetoothService } from '../services/BluetoothService'
import { useConfig } from '../hooks/useConfig'
import { removeAccents } from '../lib/utils'

// Comandos ESC/POS para impressoras RP
const ESC = '\x1B';
const DOUBLE_HEIGHT = `${ESC}!\x01`; // Double height
const DOUBLE_WIDTH = `${ESC}!\x20`; // Double width
const DOUBLE_SIZE = `${ESC}!\x21`; // Double height and width
const NORMAL_SIZE = `${ESC}!\x00`; // Normal size
const BOLD_ON = `${ESC}E\x01`; // Bold on
const BOLD_OFF = `${ESC}E\x00`; // Bold off
const ALIGN_CENTER = `${ESC}a\x01`; // Center alignment
const ALIGN_LEFT = `${ESC}a\x00`; // Left alignment

export default function ComandaDetalhes({ comanda, isOpen, onClose, highlightCupom }) {
  const [vendas, setVendas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [saleStatus, setSaleStatus] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const { atendentes } = useAtendentes()
  const { config } = useConfig()

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
  
    let receipt = `${ALIGN_CENTER}${dateStr}\n`;
    
    // Adicionar nome da sala se configurado
    if (config && config["nome sala"]) {
      receipt += `${ALIGN_CENTER}${removeAccents(config["nome sala"])}\n`;
    }
    
    receipt += `--------------------------------\n`;
    receipt += `${ALIGN_LEFT}Cliente: ${removeAccents(comanda.Cliente)}\n`;
    receipt += `Comanda: ${comanda.Numero} - Id Venda: ${cupomId}\n`;
    receipt += `--------------------------------\n`;
    receipt += `Codigo Descricao Produto\n`;
    receipt += `Vr Unit. x Qtde =Vr Total\n\n`;
  
    let totalQuantity = 0;
    let totalValue = 0;
  
    venda.items.forEach(item => {
      const itemTotal = item.preco * item.quantidade;
      totalQuantity += item.quantidade;
      totalValue += itemTotal;
  
      receipt += `${String(item.produtoId).padStart(3, '0')} `;
      receipt += `${DOUBLE_SIZE}${BOLD_ON}${removeAccents(item.descricao)}${BOLD_OFF}${NORMAL_SIZE}\n`;
      receipt += `${item.preco.toFixed(2)} x ${String(item.quantidade).padStart(3, '0')} = ${itemTotal.toFixed(2)}\n\n`;
    });
  
    receipt += `--------------------------------\n`;
    receipt += `Qtde. ${String(totalQuantity).padStart(3, '0')} `;
    receipt += `${DOUBLE_SIZE}${BOLD_ON}Total: ${totalValue.toFixed(2)}${BOLD_OFF}${NORMAL_SIZE}\n\n`;
    
    // Usar nome da casa da configuração ou TecBar como padrão
    const nomeCasa = config && config["nome sala"] ? removeAccents(config["nome sala"]) : "TecBar";
    const senhaDiaria = config && config["senha diaria"] ? removeAccents(config["senha diaria"]) : "";
    
    if (senhaDiaria) {
      receipt += `${ALIGN_CENTER}${nomeCasa} - ${senhaDiaria}\n\n\n\n`;
    } else {
      receipt += `${ALIGN_CENTER}${nomeCasa}\n\n\n\n`;
    }
  
    return receipt;
  };

  const formatAttendantReceipt = (attendente, commissionItems, comanda, cupomId) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR', { 
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  
    let receipt = `${ALIGN_CENTER}${dateStr}\n`;
    receipt += `================================\n`;
    receipt += `CUPOM DE COMISSAO\n`;
    receipt += `================================\n`;
    receipt += `${DOUBLE_SIZE}${BOLD_ON}${removeAccents(attendente.Apelido)} - ${attendente.id}${BOLD_OFF}${NORMAL_SIZE}\n`;
    receipt += `${ALIGN_LEFT}Cliente: ${removeAccents(comanda.Cliente)}\n`;
    receipt += `Comanda: ${comanda.Numero} - Id Venda: ${cupomId}\n`;
    receipt += `--------------------------------\n`;
    receipt += `Produtos com Comissao:\n\n`;
  
    let totalCommission = 0;
  
    commissionItems.forEach(({ item, produto, commissionPerAttendant }) => {
      const itemCommissionTotal = commissionPerAttendant * item.quantidade;
      totalCommission += itemCommissionTotal;
  
      receipt += `${String(produto.Id).padStart(3, '0')} ${removeAccents(produto.Descricao)}\n`;
      receipt += `Qtde: ${item.quantidade} - Comissao: R$ ${commissionPerAttendant.toFixed(2)}\n`;
      receipt += `Total: R$ ${itemCommissionTotal.toFixed(2)}\n\n`;
    });
  
    receipt += `--------------------------------\n`;
    receipt += `${DOUBLE_SIZE}${BOLD_ON}COMISSAO: R$ ${totalCommission.toFixed(2)}${BOLD_OFF}${NORMAL_SIZE}\n`;
    receipt += `================================\n`;
    
    // Usar nome da casa da configuração ou TecBar como padrão
    const nomeCasa = config && config["nome sala"] ? removeAccents(config["nome sala"]) : "TecBar";
    receipt += `${ALIGN_CENTER}${nomeCasa}\n\n\n\n`;
  
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
    const confirmacao = window.confirm(`Deseja reimprimir o cupom de venda & comissão #${venda.cupomId}?`)
    
    if (confirmacao) {
      try {
        setSaleStatus('loading')
        setErrorMessage('')

        // Verificar se a impressão está habilitada na configuração
        const imprimirHabilitado = config && config.imprimir === 1;
        
        if (imprimirHabilitado) {
          // Imprimir cupom de venda
          const receipt = formatReceipt(venda, comanda, venda.cupomId);
          await bluetoothService.initialize();
          await bluetoothService.sendData(receipt);

          // Verificar se a comissão está habilitada
          const comissaoHabilitada = config && config.comissao === 1;
          
          if (comissaoHabilitada) {
            // Imprimir cupons de comissão para cada atendente
            const atendentesComComissao = new Map();
            
            venda.items.forEach(item => {
              if (item.comissao > 0 && item.atendentes && item.atendentes.length > 0) {
                const comissaoPorAtendente = item.comissao / item.atendentes.length;
                
                item.atendentes.forEach(atendenteId => {
                  if (!atendentesComComissao.has(atendenteId)) {
                    atendentesComComissao.set(atendenteId, []);
                  }
                  atendentesComComissao.get(atendenteId).push({
                    item,
                    produto: { Id: item.produtoId, Descricao: item.descricao },
                    commissionPerAttendant: comissaoPorAtendente // Comissão dividida igualmente entre os atendentes
                  });
                });
              }
            });

            // Imprimir cupom de comissão para cada atendente
            for (const [atendenteId, commissionItems] of atendentesComComissao) {
              const atendente = atendentes.find(a => a.id === atendenteId);
              if (atendente) {
                const attendantReceipt = formatAttendantReceipt(atendente, commissionItems, comanda, venda.cupomId);
                await bluetoothService.sendData(attendantReceipt);
              }
            }
          }
        }

        setSaleStatus('success');
        setErrorMessage('');
      } catch (printErr) {
        console.error('Erro ao imprimir:', printErr);
        const printError = printErr.message || 'Erro desconhecido na impressão';
        setSaleStatus('warning');
        
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-100">Detalhes da Comanda</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {errorMessage && (
            <div className={`mb-4 p-3 rounded ${
              saleStatus === 'success' ? 'bg-green-900 text-green-200' : 
              saleStatus === 'warning' ? 'bg-yellow-900 text-yellow-200' : 
              'bg-red-900 text-red-200'
            }`}>
              {errorMessage}
            </div>
          )}

          <div className="border-b border-gray-600 pb-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Cliente</p>
                <p className="font-medium text-gray-100">{comanda.Cliente} - {comanda.Numero}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">ID</p>
                <p className="font-medium text-gray-100">{comanda.Idcomanda}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Data de Abertura</p>
                <p className="font-medium text-gray-100">{comanda.Entrada}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Gasto</p>
                <p className="font-medium text-blue-400">R$ {Number(comanda.saldo)?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-100">Histórico de Vendas</h3>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <p className="text-red-400 text-center py-4">{error}</p>
            ) : vendas.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Nenhuma venda registrada</p>
            ) : (
              <div className="space-y-4">
                {vendas.map((venda, index) => {
                  // Usar o cupomId que está sendo retornado diretamente pelo servidor
                  const isHighlighted = highlightCupom && String(venda.cupomId) === String(highlightCupom)
                  return (
                    <div 
                      key={index} 
                      className={`border rounded-lg p-4 transition-colors cursor-pointer hover:bg-gray-700 ${
                        isHighlighted ? 'bg-green-900 border-green-600 shadow-md' : 'border-gray-600'
                      }`}
                      onClick={() => handleVendaClick(venda)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm ${isHighlighted ? 'text-green-300 font-medium' : 'text-gray-400'}`}>
                          Cupom: {venda.cupomId}
                        </span>
                        <span className={`font-medium ${isHighlighted ? 'text-green-300' : 'text-gray-100'}`}>
                          R$ {Number(venda.total || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {venda.items?.length || 0} itens
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