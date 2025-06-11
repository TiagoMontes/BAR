import { useState, useEffect } from 'react'
import { getComandas, getProdutos, getAtendentes, registerSale, closeComanda } from '../lib/api'
import ComandaDetalhes from './ComandaDetalhes'
import ProductGrid from './vendas/ProductGrid'
import Cart from './vendas/Cart'
import ComandaSelector from './vendas/ComandaSelector'
import AttendantSelector from './vendas/AttendantSelector'
import PrinterModal from './PrinterModal'
import Link from 'next/link'
import { BluetoothService } from '../src/services/BluetoothService'

// Novo componente modal para cupom de atendente
const AttendantReceiptModal = ({ isOpen, attendant, commissionValue, receipt, onPrint, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Imprimir cupom da atendente: {attendant?.Apelido || 'N/A'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Comissão total: R$ {commissionValue.toFixed(2)}
          </p>
          <div className="bg-gray-50 p-3 rounded text-xs font-mono whitespace-pre-line max-h-40 overflow-y-auto">
            {receipt}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Fechar
          </button>
          <button
            onClick={onPrint}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default function VendasInterface({ user }) {
  const [comandas, setComandas] = useState([])
  const [produtos, setProdutos] = useState([])
  const [atendentes, setAtendentes] = useState([])
  const [selectedComanda, setSelectedComanda] = useState(null)
  const [selectedAtendentes, setSelectedAtendentes] = useState([])
  const [cart, setCart] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isProcessingSale, setIsProcessingSale] = useState(false)
  const [showComandaDetalhes, setShowComandaDetalhes] = useState(false)
  const [saleStatus, setSaleStatus] = useState(null)
  const [lastSaleCupom, setLastSaleCupom] = useState(null)
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState()
  const [printerStatus, setPrinterStatus] = useState('')
  
  // Novos estados para cupom de atendente
  const [attendantModalQueue, setAttendantModalQueue] = useState([])
  const [currentAttendantModal, setCurrentAttendantModal] = useState(null)

  const bluetoothService = BluetoothService.getInstance();

  const handleCloseComanda = async (comandaId) => {
    try {
      setError('');
      await closeComanda(comandaId);
      
      // Atualiza a lista de comandas localmente
      const updatedComandas = await getComandas();
      setComandas(updatedComandas);

      // Limpa a comanda selecionada
      setSelectedComanda(null);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro desconhecido ao fechar a comanda';
      setError(errorMessage);
      console.error('Erro ao fechar comanda:', err);
    }
  };

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        const [comandasData, produtosData, atendentesData] = await Promise.all([
          getComandas().catch(err => {
            console.error('Erro ao carregar comandas:', err)
            throw new Error(`Erro ao carregar comandas: ${err.message}`)
          }),
          getProdutos().catch(err => {
            console.error('Erro ao carregar produtos:', err)
            throw new Error(`Erro ao carregar produtos: ${err.message}`)
          }),
          getAtendentes().catch(err => {
            console.error('Erro ao carregar atendentes:', err)
            throw new Error(`Erro ao carregar atendentes: ${err.message}`)
          })
        ])

        setComandas(comandasData)
        setProdutos(produtosData)
        setAtendentes(atendentesData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar dados'
        console.error('Erro detalhado:', err)
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Update comanda data when it changes
  useEffect(() => {
    if (selectedComanda) {
      const updatedComanda = comandas.find(c => c.Idcomanda === selectedComanda.Idcomanda)
      if (updatedComanda) {
        setSelectedComanda(updatedComanda)
      }
    }
  }, [comandas, selectedComanda])

  // Check printer status periodically
  useEffect(() => {
    const checkPrinterStatus = () => {
      const status = bluetoothService.getConnectionStatus();
      if (status.isConnected) {
        setPrinterStatus(`Impressora conectada: ${status.deviceName || 'Dispositivo'}`);
      } else {
        setPrinterStatus('Impressora não conectada');
      }
    };

    checkPrinterStatus();
    const interval = setInterval(checkPrinterStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Gerenciar fila de modais de atendente
  useEffect(() => {
    if (attendantModalQueue.length > 0 && !currentAttendantModal) {
      const nextModal = attendantModalQueue[0];
      setCurrentAttendantModal(nextModal);
      setAttendantModalQueue(prev => prev.slice(1));
    }
  }, [attendantModalQueue, currentAttendantModal]);

  const addToCart = (produto) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.produtoId === produto.Id)
      if (existingItem) {
        return prevCart.map(item =>
          item.produtoId === produto.Id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      }
      return [...prevCart, { 
        produtoId: produto.Id, 
        quantidade: 1, 
        atendenteId: produto.Comissao > 0 ? selectedAtendentes[0]?.id || null : null
      }]
    })
  }

  const removeFromCart = (produtoId) => {
    setCart(prevCart => prevCart.filter(item => item.produtoId !== produtoId))
  }

  const updateQuantity = (produtoId, quantidade) => {
    if (quantidade < 1) {
      removeFromCart(produtoId)
      return
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.produtoId === produtoId
          ? { ...item, quantidade }
          : item
      )
    )
  }

  const hasCommissionProducts = () => {
    return cart.some(item => {
      const produto = produtos.find(p => p.Id === item.produtoId)
      return produto?.Comissao > 0
    })
  }

  const formatReceipt = (saleData, comanda, cupomId) => {
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

    saleData.items.forEach(item => {
      const produto = produtos.find(p => p.Id === item.produtoId);
      if (produto) {
        const itemTotal = produto.Preco * item.quantidade;
        totalQuantity += item.quantidade;
        totalValue += itemTotal;

        receipt += `# ${String(produto.Id).padStart(3, '0')} ${produto.Descricao}\n`;
        receipt += `## ${produto.Preco.toFixed(2)} ${String(item.quantidade).padStart(3, '0')} ${itemTotal.toFixed(2)}\n\n`;
      }
    });

    receipt += `--------------------------------\n`;
    receipt += `# Qtde. ${String(totalQuantity).padStart(3, '0')} Total: ${totalValue.toFixed(2)}\n\n`;
    receipt += `TecBar\n\n\n\n`;

    return receipt;
  };

  // Nova função para formatar cupom de atendente
  const formatAttendantReceipt = (attendant, commissionItems, comanda, cupomId) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR', { 
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');

    let receipt = `${dateStr}\n`;
    receipt += `================================\n`;
    receipt += `CUPOM DE COMISSAO\n`;
    receipt += `================================\n`;
    receipt += `Atendente: ${attendant.Apelido} - ${attendant.id}\n`;
    receipt += `Cliente: ${comanda.Cliente}\n`;
    receipt += `Comanda: ${comanda.Idcomanda} - Id Venda: ${cupomId}\n`;
    receipt += `--------------------------------\n`;
    receipt += `Produtos com Comissao:\n\n`;

    let totalCommission = 0;

    commissionItems.forEach(({ item, produto, commissionPerAttendant }) => {
      const itemCommissionTotal = commissionPerAttendant * item.quantidade;
      totalCommission += itemCommissionTotal;

      receipt += `# ${String(produto.Id).padStart(3, '0')} ${produto.Descricao}\n`;
      receipt += `## Qtde: ${item.quantidade} - Comissao: R$ ${commissionPerAttendant.toFixed(2)}\n`;
      receipt += `## Total: R$ ${itemCommissionTotal.toFixed(2)}\n\n`;
    });

    receipt += `--------------------------------\n`;
    receipt += `TOTAL COMISSAO: R$ ${totalCommission.toFixed(2)}\n`;
    receipt += `================================\n`;
    receipt += `TecBar\n\n\n\n`;

    return receipt;
  };

  // Calcular comissões por atendente
  const calculateAttendantCommissions = () => {
    const attendantCommissions = {};

    // Inicializar para cada atendente selecionado
    selectedAtendentes.forEach(attendant => {
      attendantCommissions[attendant.id] = {
        attendant,
        items: [],
        totalCommission: 0
      };
    });

    // Processar itens do carrinho
    cart.forEach(item => {
      const produto = produtos.find(p => p.Id === item.produtoId);
      if (produto && produto.Comissao > 0) {
        const commissionPerAttendant = produto.Comissao / selectedAtendentes.length;
        
        selectedAtendentes.forEach(attendant => {
          if (attendantCommissions[attendant.id]) {
            attendantCommissions[attendant.id].items.push({
              item,
              produto,
              commissionPerAttendant
            });
            attendantCommissions[attendant.id].totalCommission += 
              commissionPerAttendant * item.quantidade;
          }
        });
      }
    });

    return Object.values(attendantCommissions).filter(ac => ac.items.length > 0);
  };

  const handlePrinterSetup = () => {
    setIsPrinterModalOpen(true);
  };

  const handleSale = async () => {
    if (!selectedComanda || cart.length === 0) {
      setError('Selecione uma comanda e adicione itens ao carrinho')
      return
    }

    try {
      setIsProcessingSale(true)
      setSaleStatus(null)
      setErrorMessage('')

      // Registra a venda primeiro
      const response = await registerSale({
        comandaId: selectedComanda.Idcomanda,
        operadorId: user.Nivel,
        items: cart,
        atendentes: selectedAtendentes.map(a => a.id)
      })
      
      // Update comandas data
      const updatedComandas = await getComandas()
      setComandas(updatedComandas)
      
      // Format receipt
      const receipt = formatReceipt(
        { items: cart },
        selectedComanda,
        response.cupomId
      );
      
      // Tenta imprimir o cupom principal
      let printSuccess = false;
      let printError = '';

      try {
        console.log('Iniciando processo de impressão...');
        await bluetoothService.initialize();
        console.log('Bluetooth inicializado, enviando dados...');
        await bluetoothService.sendData(receipt);
        console.log('Dados enviados com sucesso!');
        printSuccess = true;
        setSaleStatus('success');
        setErrorMessage('');
      } catch (printErr) {
        console.error('Erro ao imprimir:', printErr);
        printError = printErr.message || 'Erro desconhecido na impressão';
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

      // Preparar cupons de atendente se houver produtos com comissão
      if (selectedAtendentes.length > 0) {
        const attendantCommissions = calculateAttendantCommissions();
        
        if (attendantCommissions.length > 0) {
          const modalsQueue = attendantCommissions.map(commission => ({
            attendant: commission.attendant,
            commissionValue: commission.totalCommission,
            receipt: formatAttendantReceipt(
              commission.attendant,
              commission.items,
              selectedComanda,
              response.cupomId
            )
          }));
          
          setAttendantModalQueue(modalsQueue);
        }
      }
      
      // Clear cart and selected attendants
      setCart([])
      setSelectedAtendentes([])
      setLastSaleCupom(response.cupomId)

      // Se a impressão falhou, oferece opções ao usuário
      if (!printSuccess) {
        setTimeout(() => {
          const shouldRetry = window.confirm(
            'Venda realizada com sucesso, mas houve erro na impressão.\n\n' +
            'Deseja tentar imprimir novamente?'
          );
          
          if (shouldRetry) {
            handleRetryPrint(receipt);
          }
        }, 2000);
      }

    } catch (err) {
      console.error('Erro ao registrar venda:', err);
      setErrorMessage('Erro ao registrar venda: ' + (err.message || 'Erro desconhecido'))
      setSaleStatus('error')
    } finally {
      setIsProcessingSale(false)
    }
  }

  const handleRetryPrint = async (receipt) => {
    try {
      setErrorMessage('Tentando imprimir novamente...');
      await bluetoothService.initialize();
      await bluetoothService.sendData(receipt);
      setErrorMessage('Cupom impresso com sucesso!');
      setSaleStatus('success');
    } catch (retryError) {
      console.error('Erro ao tentar imprimir novamente:', retryError);
      setErrorMessage(`Erro ao imprimir: ${retryError.message || 'Erro desconhecido'}. Verifique a conexão da impressora.`);
    }
  };

  // Função para imprimir cupom de atendente
  const handlePrintAttendantReceipt = async (receipt) => {
    try {
      await bluetoothService.initialize();
      await bluetoothService.sendData(receipt);
      console.log('Cupom de atendente impresso com sucesso!');
    } catch (error) {
      console.error('Erro ao imprimir cupom de atendente:', error);
      alert(`Erro ao imprimir cupom de atendente: ${error.message}`);
    }
  };

  const handleViewLastSale = () => {
    setShowComandaDetalhes(true)
    setLastSaleCupom(lastSaleCupom)
  }

  const handleSelectAttendant = (atendente) => {
    setSelectedAtendentes([...selectedAtendentes, atendente])
    // Update cart items with commission to include the selected attendant
    setCart(prevCart => 
      prevCart.map(item => {
        const produto = produtos.find(p => p.Id === item.produtoId)
        return produto?.Comissao > 0 
          ? { ...item, atendenteId: atendente.id }
          : item
      })
    )
  }

  const handleRemoveAttendant = (atendenteId) => {
    setSelectedAtendentes(selectedAtendentes.filter(a => a.id !== atendenteId))
    // Remove attendant from cart items
    setCart(prevCart => 
      prevCart.map(item => {
        const produto = produtos.find(p => p.Id === item.produtoId)
        return produto?.Comissao > 0 
          ? { ...item, atendenteId: null }
          : item
      })
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Erro ao carregar dados</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Status da impressora */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            printerStatus.includes('conectada') ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-gray-600">{printerStatus}</span>
        </div>
        <button
          onClick={handlePrinterSetup}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
          title="Configurar Impressora"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
        </button>
      </div>

      {/* Mensagens de status */}
      {errorMessage && (
        <div className={`mb-4 p-4 rounded-lg ${
          saleStatus === 'success' ? 'bg-green-50 border border-green-200 text-green-600' :
          saleStatus === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-600' :
          'bg-red-50 border border-red-200 text-red-600'
        }`}>
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seleção de Comanda */}
        <div className="lg:col-span-1">
        <ComandaSelector
          comandas={comandas}
          selectedComanda={selectedComanda}
          onComandaSelect={setSelectedComanda}
          onShowDetails={setShowComandaDetalhes}
          onCloseComanda={handleCloseComanda}
        />
          
          {/* Seleção de Atendentes */}
          {hasCommissionProducts() && (
            <div className="mt-6">
              <AttendantSelector
                atendentes={atendentes}
                selectedAtendentes={selectedAtendentes}
                onSelectAttendant={handleSelectAttendant}
                onRemoveAttendant={handleRemoveAttendant}
              />
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
            <Cart
              cart={cart}
              produtos={produtos}
              onRemoveFromCart={removeFromCart}
              onUpdateQuantity={updateQuantity}
              onSale={handleSale}
              isProcessingSale={isProcessingSale}
              selectedComanda={selectedComanda}
            />
          </div>

        {/* Grid de Produtos */}
        <div className="lg:col-span-1 pb-32">
          <ProductGrid
            produtos={produtos}
            onAddToCart={addToCart}
          />
        </div>
      </div>

      {/* Modals */}
      {showComandaDetalhes && selectedComanda && (
        <ComandaDetalhes
          comanda={selectedComanda}
          isOpen={showComandaDetalhes}
          onClose={() => setShowComandaDetalhes(false)}
          highlightCupom={lastSaleCupom}
        />
      )}

      {isPrinterModalOpen && (
        <PrinterModal
          isOpen={isPrinterModalOpen}
          onClose={() => setIsPrinterModalOpen(false)}
          bluetoothService={bluetoothService}
        />
      )}

      {/* Modal para cupom de atendente */}
      <AttendantReceiptModal
        isOpen={!!currentAttendantModal}
        attendant={currentAttendantModal?.attendant}
        commissionValue={currentAttendantModal?.commissionValue || 0}
        receipt={currentAttendantModal?.receipt || ''}
        onPrint={async () => {
          await handlePrintAttendantReceipt(currentAttendantModal.receipt);
          setCurrentAttendantModal(null);
        }}
        onClose={() => setCurrentAttendantModal(null)}
      />

      <div className="fixed bottom-0 z-10 left-0 right-0 bg-white p-4 shadow-lg lg:hidden">
        <button
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={cart.length === 0 || isProcessingSale}
          onClick={handleSale}
        >
          {isProcessingSale ? 'Processando...' : 'Finalizar Venda'}
        </button>
      </div>
    </div>
  )
}