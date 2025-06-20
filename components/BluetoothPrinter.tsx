import React, { useEffect, useState } from 'react';
import { BluetoothService } from '../services/BluetoothService';

export const BluetoothPrinter: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState(false);

  const bluetoothService = BluetoothService.getInstance();

  useEffect(() => {
    initializeBluetooth();
    return () => {
      if (isConnected) {
        disconnectFromDevice();
      }
    };
  }, []);

  const initializeBluetooth = async () => {
    try {
      setDebugInfo('Iniciando Bluetooth...');
      await bluetoothService.initialize();
      setIsInitialized(true);
      setDebugInfo('Bluetooth inicializado com sucesso');
      
      const defaultPrinter = await bluetoothService.getDefaultPrinter();
      if (defaultPrinter) {
        setSelectedDevice(defaultPrinter);
        await connectToDevice(defaultPrinter);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Falha ao inicializar Bluetooth: ${errorMessage}`);
      setDebugInfo(`Erro ao inicializar Bluetooth: ${errorMessage}`);
      console.error('Erro ao inicializar Bluetooth:', err);
    }
  };

  const scanForDevices = async () => {
    if (!isInitialized) {
      setError('Bluetooth não inicializado');
      return;
    }

    try {
      setIsScanning(true);
      setError(null);
      setDevices([]);
      setDebugInfo('Iniciando busca de dispositivos...');
      
      const foundDevices = await bluetoothService.scanForDevices();
      setDevices(foundDevices);
      setDebugInfo(`Encontrado ${foundDevices.length} dispositivos`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Falha ao buscar dispositivos: ${errorMessage}`);
      setDebugInfo(`Erro ao buscar dispositivos: ${errorMessage}`);
      console.error('Erro ao buscar dispositivos:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const connectToDevice = async (deviceId: string) => {
    if (!isInitialized) {
      setError('Bluetooth não inicializado');
      return;
    }

    try {
      setError(null);
      setDebugInfo(`Conectando ao dispositivo: ${deviceId}`);
      await bluetoothService.connectToDevice(deviceId);
      setIsConnected(true);
      setSelectedDevice(deviceId);
      setDebugInfo('Conectado com sucesso');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Falha ao conectar ao dispositivo: ${errorMessage}`);
      setDebugInfo(`Erro ao conectar ao dispositivo: ${errorMessage}`);
      console.error('Erro ao conectar ao dispositivo:', err);
    }
  };

  const disconnectFromDevice = async () => {
    if (!isInitialized) {
      setError('Bluetooth não inicializado');
      return;
    }

    try {
      setError(null);
      setDebugInfo('Desconectando do dispositivo...');
      await bluetoothService.disconnect();
      setIsConnected(false);
      setSelectedDevice(null);
      setDebugInfo('Desconectado com sucesso');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Falha ao desconectar do dispositivo: ${errorMessage}`);
      setDebugInfo(`Erro ao desconectar do dispositivo: ${errorMessage}`);
      console.error('Erro ao desconectar do dispositivo:', err);
    }
  };

  const handlePrint = async () => {
    if (!isInitialized || !isConnected) {
      setError('Bluetooth não inicializado ou dispositivo não conectado');
      return;
    }

    try {
      setIsPrinting(true);
      setError(null);
      setDebugInfo('Enviando impressão...');
      
      const printData = 'Teste de Impressao\n\nLinha 1\nLinha 2\n\nFim do teste\n\n\n';
      await bluetoothService.sendData(printData);
      
      setDebugInfo('Impressão enviada com sucesso');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Falha ao imprimir: ${errorMessage}`);
      setDebugInfo(`Erro ao imprimir: ${errorMessage}`);
      console.error('Erro ao imprimir:', err);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {!isInitialized ? (
        <div className="text-red-500 text-center">Inicializando Bluetooth...</div>
      ) : (
        <div className="space-y-6">
          {/* Scan Section */}
          <div className="bg-white p-4 rounded-lg border border-gray-400">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-lg font-semibold">Dispositivos Disponíveis</h3>
              <button
                onClick={scanForDevices}
                disabled={isScanning}
                className={`px-4 py-2 w-full lg:w-auto rounded-lg text-white font-medium transition-colors ${
                  isScanning 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isScanning ? 'Procurando...' : 'Procurar'}
              </button>
            </div>

            {isScanning && (
              <div className="text-blue-500 text-center py-2">
                Procurando dispositivos Bluetooth...
              </div>
            )}

            {devices.length > 0 && (
              <div className="space-y-2">
                {devices.map((device) => (
                  <div
                    key={device.deviceId}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDevice === device.deviceId 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => connectToDevice(device.deviceId)}
                  >
                    <div>
                      <span className="font-medium">{device.name || 'Dispositivo Desconhecido'}</span>
                      <span className="text-sm text-gray-500 block">
                        {device.deviceId}
                      </span>
                    </div>
                    <span className={`text-sm ${
                      selectedDevice === device.deviceId 
                        ? 'text-green-600 font-medium' 
                        : 'text-gray-500'
                    }`}>
                      {selectedDevice === device.deviceId ? 'Conectado' : 'Clique para conectar'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Print Section */}
          {isConnected && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Print Text</h3>
              <div className="space-y-4">
                <button
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className={`w-full text-white px-6 py-3 rounded-lg font-medium transition-colors ${
                    isPrinting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-black hover:bg-green-600'
                  }`}
                >
                  {isPrinting ? 'Imprimindo...' : 'Imprimir'}
                </button>
                <button
                  onClick={disconnectFromDevice}
                  disabled={isPrinting}
                  className={`w-full text-white bg-black px-6 py-3 rounded-lg font-medium transition-colors ${
                    isPrinting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Debug Information */}
          <div className="bg-gray-50 p-4 rounded-lg w-full border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Informações de Debug:</h3>
            <p className="text-sm text-gray-600 ">{debugInfo}</p>
          </div>
        </div>
      )}
    </div>
  );
}; 