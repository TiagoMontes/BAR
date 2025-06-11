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
      setDebugInfo('Initializing Bluetooth...');
      await bluetoothService.initialize();
      setIsInitialized(true);
      setDebugInfo('Bluetooth initialized successfully');
      
      const defaultPrinter = await bluetoothService.getDefaultPrinter();
      if (defaultPrinter) {
        setSelectedDevice(defaultPrinter);
        await connectToDevice(defaultPrinter);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to initialize Bluetooth: ${errorMessage}`);
      setDebugInfo(`Initialization error: ${errorMessage}`);
      console.error('Initialization error:', err);
    }
  };

  const scanForDevices = async () => {
    if (!isInitialized) {
      setError('Bluetooth not initialized');
      return;
    }

    try {
      setIsScanning(true);
      setError(null);
      setDevices([]);
      setDebugInfo('Starting device scan...');
      
      const foundDevices = await bluetoothService.scanForDevices();
      setDevices(foundDevices);
      setDebugInfo(`Found ${foundDevices.length} devices`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to scan for devices: ${errorMessage}`);
      setDebugInfo(`Scan error: ${errorMessage}`);
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const connectToDevice = async (deviceId: string) => {
    if (!isInitialized) {
      setError('Bluetooth not initialized');
      return;
    }

    try {
      setError(null);
      setDebugInfo(`Connecting to device: ${deviceId}`);
      await bluetoothService.connectToDevice(deviceId);
      setIsConnected(true);
      setSelectedDevice(deviceId);
      setDebugInfo('Connected successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to connect to device: ${errorMessage}`);
      setDebugInfo(`Connection error: ${errorMessage}`);
      console.error('Connection error:', err);
    }
  };

  const disconnectFromDevice = async () => {
    if (!isInitialized) {
      setError('Bluetooth not initialized');
      return;
    }

    try {
      setError(null);
      setDebugInfo('Disconnecting from device...');
      await bluetoothService.disconnect();
      setIsConnected(false);
      setSelectedDevice(null);
      setDebugInfo('Disconnected successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to disconnect from device: ${errorMessage}`);
      setDebugInfo(`Disconnection error: ${errorMessage}`);
      console.error('Disconnection error:', err);
    }
  };

  const handlePrint = async () => {
    if (!isInitialized || !isConnected) {
      setError('Bluetooth not initialized or device not connected');
      return;
    }

    try {
      setIsPrinting(true);
      setError(null);
      setDebugInfo('Sending print job...');
      
      const printData = 'Teste de Impressao\n\nLinha 1\nLinha 2\n\nFim do teste\n\n\n';
      await bluetoothService.sendData(printData);
      
      setDebugInfo('Print job sent successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to print: ${errorMessage}`);
      setDebugInfo(`Print error: ${errorMessage}`);
      console.error('Print error:', err);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Bluetooth Printer</h2>
      
      {!isInitialized ? (
        <div className="text-red-500 text-center">Initializing Bluetooth...</div>
      ) : (
        <div className="space-y-6">
          {/* Scan Section */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Available Devices</h3>
              <button
                onClick={scanForDevices}
                disabled={isScanning}
                className={`px-4 py-2 rounded-lg text-white font-medium ${
                  isScanning 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isScanning ? 'Scanning...' : 'Scan for Devices'}
              </button>
            </div>

            {isScanning && (
              <div className="text-blue-500 text-center py-2">
                Searching for Bluetooth devices...
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
                      <span className="font-medium">{device.name || 'Unknown Device'}</span>
                      <span className="text-sm text-gray-500 block">
                        {device.deviceId}
                      </span>
                    </div>
                    <span className={`text-sm ${
                      selectedDevice === device.deviceId 
                        ? 'text-green-600 font-medium' 
                        : 'text-gray-500'
                    }`}>
                      {selectedDevice === device.deviceId ? 'Connected' : 'Click to connect'}
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
                  {isPrinting ? 'Printing...' : 'Print Text'}
                </button>
                <button
                  onClick={disconnectFromDevice}
                  disabled={isPrinting}
                  className={`w-full text-white px-6 py-3 rounded-lg font-medium transition-colors ${
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
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Debug Info:</h3>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        </div>
      )}
    </div>
  );
}; 