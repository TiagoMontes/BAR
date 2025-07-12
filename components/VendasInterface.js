import { useState, useEffect } from 'react'
import { getComandas, getProdutos, getAtendentes, registerSale, closeComanda } from '../lib/api'
import ComandaDetalhes from './ComandaDetalhes'
import ProductGrid from './vendas/ProductGrid'
import Cart from './vendas/Cart'
import ComandaSelector from './vendas/ComandaSelector'
import AttendantSelector from './vendas/AttendantSelector'
import PrinterModal from './PrinterModal'
import Link from 'next/link'
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

// Novo componente modal para cupom de atendente
const AttendantReceiptModal = ({ isOpen, attendant, commissionValue, receipt, onPrint, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-100">
            Imprimir cupom da atendente: {attendant?.Apelido || 'N/A'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-300 mb-2">
            Comissão total: R$ {commissionValue.toFixed(2)}
          </p>
          <div className="bg-gray-700 p-3 rounded text-xs font-mono whitespace-pre-line max-h-40 overflow-y-auto text-gray-100">
            {receipt}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 border border-gray-600 rounded hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={onPrint}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
  const { config, loading: configLoading } = useConfig();

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
    console.log('useEffect attendantModalQueue:', {
      queueLength: attendantModalQueue.length,
      currentModal: currentAttendantModal,
      queue: attendantModalQueue
    });
    
    if (attendantModalQueue.length > 0 && !currentAttendantModal) {
      const nextModal = attendantModalQueue[0];
      console.log('Abrindo próximo modal:', nextModal);
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
        quantidade: 1
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
    // Verificar se a comissão está habilitada na configuração
    const comissaoHabilitada = config && config.comissao === 1;
    if (!comissaoHabilitada) return false;
    
    return cart.some(item => {
      const produto = produtos.find(p => p.Id === item.produtoId)
      return produto && produto.Comissao > 0
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
    receipt += `Vr Unit. x Qtde Vr = Total\n\n`;

    let totalQuantity = 0;
    let totalValue = 0;

    saleData.items.forEach(item => {
      const produto = produtos.find(p => p.Id === item.produtoId);
      if (produto) {
        const itemTotal = produto.Preco * item.quantidade;
        totalQuantity += item.quantidade;
        totalValue += itemTotal;

        receipt += `${DOUBLE_SIZE}${BOLD_ON}${removeAccents(produto.Descricao)}${BOLD_OFF}${NORMAL_SIZE}\n`;
        receipt += `${produto.Preco.toFixed(2)} x ${String(item.quantidade).padStart(3, '0')} = ${itemTotal.toFixed(2)}\n\n`;
      }
    });

    receipt += `--------------------------------\n`;
    receipt += `${DOUBLE_SIZE}${BOLD_ON}Qtde.${String(totalQuantity).padStart(3, '0')} \nTotal: ${totalValue.toFixed(2)}${BOLD_OFF}${NORMAL_SIZE}\n\n`;
    
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

  // Nova função para formatar cupom de atendente
  const formatAttendantReceipt = (attendantCommission, cupomId) => {
    console.log('formatAttendantReceipt chamada com:', attendantCommission, 'cupomId:', cupomId);
    
    // Verificar se o attendant existe
    if (!attendantCommission || !attendantCommission.attendant) {
      console.error('Attendant é undefined ou null');
      return 'ERRO: Atendente não encontrado';
    }

    const { attendant, items, totalCommission } = attendantCommission;
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
    receipt += `${DOUBLE_SIZE}${BOLD_ON}${removeAccents(attendant.Apelido)} - ${attendant.id}${BOLD_OFF}${NORMAL_SIZE}\n`;
    receipt += `${ALIGN_LEFT}Cliente: ${removeAccents(selectedComanda?.Cliente || 'N/A')}\n`;
    receipt += `Comanda: ${selectedComanda?.Idcomanda || 'N/A'} - Id Venda: ${cupomId || 'N/A'}\n`;
    receipt += `--------------------------------\n`;
    receipt += `Produtos com Comissao:\n\n`;

    items.forEach(({ item, produto, commissionPerAttendant }) => {
      const itemCommissionTotal = commissionPerAttendant * item.quantidade;

      receipt += `${DOUBLE_SIZE}${BOLD_ON}${removeAccents(produto.Descricao)}${BOLD_OFF}${NORMAL_SIZE}\n`;
      receipt += `Qtde: ${item.quantidade} - Comissao: R$ ${commissionPerAttendant.toFixed(2)}\n`;
      receipt += `Total: R$ ${itemCommissionTotal.toFixed(2)}\n\n`;
    });

    receipt += `--------------------------------\n`;
    receipt += `${DOUBLE_SIZE}${BOLD_ON}COMISSAO:\nR$ ${totalCommission.toFixed(2)}${BOLD_OFF}${NORMAL_SIZE}\n`;
    receipt += `================================\n`;
    
    // Usar nome da casa da configuração ou TecBar como padrão
    const nomeCasa = config && config["nome sala"] ? removeAccents(config["nome sala"]) : "TecBar";
    receipt += `${ALIGN_CENTER}${nomeCasa}\n\n\n\n`;

    return receipt;
  };

  // Calcular comissões por atendente
  const calculateAttendantCommissions = () => {
    console.log('Calculando comissões...');
    console.log('Atendentes selecionados:', selectedAtendentes);
    console.log('Carrinho:', cart);
    
    const attendantCommissions = {};

    // Inicializar para cada atendente selecionado
    selectedAtendentes.forEach(atendente => {
      console.log('Inicializando comissão para atendente:', atendente);
      attendantCommissions[atendente.id] = {
        attendant: atendente, // Garantir que o objeto attendant está sendo passado
        items: [],
        totalCommission: 0
      };
    });

    // Processar itens do carrinho
    cart.forEach(item => {
      const produto = produtos.find(p => p.Id === item.produtoId);
      console.log(`Item ${produto?.Descricao}:`, {
        produtoId: item.produtoId,
        atendentes: item.atendentes,
        comissao: produto?.Comissao,
        quantidade: item.quantidade
      });
      
      if (produto && produto.Comissao > 0 && item.atendentes && item.atendentes.length > 0) {
        // Distribuir comissão entre os atendentes
        const atendentes = item.atendentes;
        const comissaoPorAtendente = produto.Comissao / atendentes.length;
        
        atendentes.forEach(atendenteId => {
          if (attendantCommissions[atendenteId]) {
            attendantCommissions[atendenteId].items.push({
              item,
              produto,
              commissionPerAttendant: comissaoPorAtendente
            });
            attendantCommissions[atendenteId].totalCommission += 
              comissaoPorAtendente * item.quantidade;
            
            console.log(`Comissão adicionada para atendente ${atendenteId}:`, {
              produto: produto.Descricao,
              comissao: comissaoPorAtendente,
              quantidade: item.quantidade,
              total: comissaoPorAtendente * item.quantidade
            });
          } else {
            console.warn(`Atendente ${atendenteId} não encontrado nas comissões`);
          }
        });
      }
    });

    const result = Object.values(attendantCommissions).filter(ac => ac.items.length > 0);
    console.log('Resultado final das comissões:', result);
    return result;
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
        comandaNumero: selectedComanda.Numero,
        operadorId: user["Id operador"],
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
      
      // Verificar se a impressão está habilitada na configuração
      const imprimirHabilitado = config && config.imprimir === 1;
      
      // Tenta imprimir o cupom principal apenas se habilitado
      let printSuccess = false;
      let printError = '';

      if (imprimirHabilitado) {
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
      } else {
        // Impressão desabilitada, apenas mostrar sucesso
        printSuccess = true;
        setSaleStatus('success');
        setErrorMessage('');
      }

      // Preparar cupons de atendente se houver produtos com comissão E comissão estiver habilitada
      const comissaoHabilitada = config && config.comissao === 1;
      if (selectedAtendentes.length > 0 && comissaoHabilitada) {
        const attendantCommissions = calculateAttendantCommissions();
        console.log('Comissões calculadas:', attendantCommissions);
        
        if (attendantCommissions.length > 0) {
          const modalsQueue = attendantCommissions.map(commission => {
            console.log('Criando modal para comissão:', commission);
            
            // Verificar se o attendant existe
            if (!commission.attendant) {
              console.error('Attendant não encontrado na comissão:', commission);
              return null;
            }
            
            return {
            attendant: commission.attendant,
            commissionValue: commission.totalCommission,
              receipt: formatAttendantReceipt(commission, response.cupomId)
            };
          }).filter(modal => modal !== null); // Remover modais inválidos
          
          console.log('Fila de modais criada:', modalsQueue);
          setAttendantModalQueue(modalsQueue);
        }
      }
      
      // Clear cart and selected attendants
      setCart([])
      setSelectedAtendentes([])
      setLastSaleCupom(response.cupomId)

      // Se a impressão falhou, oferece opções ao usuário
      if (!printSuccess && imprimirHabilitado) {
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

  const handleSelectAttendant = (atendente) => {
    console.log('Selecionando atendente:', atendente);
    setSelectedAtendentes([...selectedAtendentes, atendente])
    
    // Update cart items with commission to include the selected attendant
    setCart(prevCart => {
      const updatedCart = prevCart.map(item => {
        const produto = produtos.find(p => p.Id === item.produtoId)
        if (produto?.Comissao > 0) {
          // Se já tem atendentes, adicionar o novo. Se não tem, criar array com o novo
          const currentAtendentes = item.atendentes || [];
          if (!currentAtendentes.includes(atendente.id)) {
            console.log(`Atribuindo atendente ${atendente.id} ao produto ${produto.Descricao}`);
            return { ...item, atendentes: [...currentAtendentes, atendente.id] }
          }
        }
        return item
      })
      return updatedCart
    })
  }

  const handleRemoveAttendant = (atendenteId) => {
    console.log('Removendo atendente:', atendenteId);
    setSelectedAtendentes(selectedAtendentes.filter(a => a.id !== atendenteId))
    
    // Remove attendant from cart items
    setCart(prevCart => {
      const updatedCart = prevCart.map(item => {
        const produto = produtos.find(p => p.Id === item.produtoId)
        if (produto?.Comissao > 0 && item.atendentes) {
          const updatedAtendentes = item.atendentes.filter(id => id !== atendenteId);
          console.log(`Removendo atendente ${atendenteId} do produto ${produto.Descricao}`);
          return { ...item, atendentes: updatedAtendentes }
        }
        return item
      })
      return updatedCart
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen">
        <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg">
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
    <div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen">
      {/* Mensagens de status */}
      {errorMessage && (
        <div className={`mb-4 p-4 rounded-lg ${
          saleStatus === 'success' ? 'bg-green-900 border border-green-700 text-green-200' :
          saleStatus === 'warning' ? 'bg-yellow-900 border border-yellow-700 text-yellow-200' :
          'bg-red-900 border border-red-700 text-red-200'
        }`}>
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-32 lg:mb-0">
        <div className="rounded-lg lg:hidden flex flex-col gap-4">
          <div className="rounded-lg lg:hidden">
            <ComandaSelector
              comandas={comandas}
              selectedComanda={selectedComanda}
              onComandaSelect={setSelectedComanda}
              onShowDetails={setShowComandaDetalhes}
              onCloseComanda={handleCloseComanda}
            />
          </div>
          <Cart
            cart={cart}
            produtos={produtos}
            onRemoveFromCart={removeFromCart}
            onUpdateQuantity={updateQuantity}
            onSale={handleSale}
            isProcessingSale={isProcessingSale}
            selectedComanda={selectedComanda}
          />
          {hasCommissionProducts() && (
            <div className="rounded-lg lg:hidden">
              <AttendantSelector
                atendentes={atendentes}
                selectedAtendentes={selectedAtendentes}
                onSelectAttendant={handleSelectAttendant}
                onRemoveAttendant={handleRemoveAttendant}
              />
            </div>
          )}
        </div>

        {/* Grid de Produtos - Lado Esquerdo */}
        <div className="lg:col-span-7">
          <ProductGrid
            produtos={produtos}
            onAddToCart={addToCart}
          />
        </div>

        {/* Lado Direito - Comanda, Atendentes e Carrinho */}
        <div className="lg:col-span-5 space-y-6">
          {/* Seleção de Comanda */}
          <div className="rounded-lg hidden lg:block">
            <ComandaSelector
              comandas={comandas}
              selectedComanda={selectedComanda}
              onComandaSelect={setSelectedComanda}
              onShowDetails={setShowComandaDetalhes}
              onCloseComanda={handleCloseComanda}
            />
          </div>
          
          {/* Seleção de Atendentes */}
          {hasCommissionProducts() && (
            <div className="rounded-lg hidden lg:block">
              <AttendantSelector
                atendentes={atendentes}
                selectedAtendentes={selectedAtendentes}
                onSelectAttendant={handleSelectAttendant}
                onRemoveAttendant={handleRemoveAttendant}
              />
            </div>
          )}

          {/* Carrinho */}
          <div className="rounded-lg hidden lg:block">
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

          {/* Status da impressora */}
          {config && config.imprimir !== 0 && (
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  printerStatus.includes('conectada') ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-300">{printerStatus}</span>
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
          )}
        
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hidden lg:block"
            disabled={cart.length === 0 || isProcessingSale}
            onClick={handleSale}
          >
            {isProcessingSale ? 'Processando...' : 'Finalizar Venda'}
          </button>
            
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

      <div className="fixed bottom-0 z-10 left-0 right-0 bg-gray-800 p-4 pb-10 shadow-lg lg:hidden border-t border-gray-700">
        <button
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={cart.length === 0 || isProcessingSale}
          onClick={handleSale}
        >
          {isProcessingSale ? 'Processando...' : 'Finalizar Venda'}
        </button>
      </div>
    </div>
  )
}