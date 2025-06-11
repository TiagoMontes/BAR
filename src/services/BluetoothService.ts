import { BleClient, BleDevice } from '@capacitor-community/bluetooth-le';

export class BluetoothService {
  private static instance: BluetoothService;
  private isInitialized = false;
  private connectedDeviceId: string | null = null;
  private currentDevice: BleDevice | null = null;
  private writeServiceUuid: string | null = null;
  private writeCharacteristicUuid: string | null = null;
  
  // UUIDs comuns para impressoras térmicas
  private readonly COMMON_SERVICE_UUIDS = [
    '000018f0-0000-1000-8000-00805f9b34fb', // Padrão ESC/POS
    '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Alguns modelos
    '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART Service
    '0000fff0-0000-1000-8000-00805f9b34fb'  // Genérico
  ];
  
  private readonly COMMON_CHARACTERISTIC_UUIDS = [
    '00002af1-0000-1000-8000-00805f9b34fb', // Padrão ESC/POS
    '49535343-8841-43f4-a8d4-ecbe34729bb3', // Write
    '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // Nordic TX
    '0000fff2-0000-1000-8000-00805f9b34fb'  // Genérico Write
  ];

  private constructor() {}

  static getInstance(): BluetoothService {
    if (!BluetoothService.instance) {
      BluetoothService.instance = new BluetoothService();
    }
    return BluetoothService.instance;
  }

  async initialize(): Promise<void> {
    try {
      console.log('Iniciando inicialização do Bluetooth...');
      
      // Inicializa o BLE Client apenas uma vez
      if (!this.isInitialized) {
        await BleClient.initialize();
        console.log('BLE Client inicializado');
      }

      // Se já tem um dispositivo conectado, verifica se ainda está ativo
      if (this.connectedDeviceId) {
        const isStillConnected = await this.checkConnection();
        if (isStillConnected) {
          console.log('Dispositivo já conectado e ativo');
          this.isInitialized = true;
          return;
        } else {
          console.log('Dispositivo desconectado, limpando referências');
          this.cleanup();
        }
      }

      // Tenta conectar com impressora padrão salva
      const defaultPrinter = await this.getDefaultPrinter();
      if (defaultPrinter) {
        try {
          console.log('Tentando conectar com impressora padrão:', defaultPrinter);
          await this.connectToDevice(defaultPrinter);
          console.log('Conectado com impressora padrão');
          this.isInitialized = true;
          return;
        } catch (error) {
          console.log('Falha ao conectar com impressora padrão:', error);
          // Remove impressora padrão inválida
          this.removeDefaultPrinter();
        }
      }

      this.isInitialized = true;
      console.log('Bluetooth inicializado, aguardando seleção manual de impressora');
      
    } catch (error) {
      console.error('Erro na inicialização:', error);
      this.isInitialized = false;
      throw new Error(`Falha ao inicializar Bluetooth: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private async checkConnection(): Promise<boolean> {
    if (!this.connectedDeviceId) return false;
    
    try {
      await BleClient.getServices(this.connectedDeviceId);
      return true;
    } catch (error) {
      console.log('Dispositivo não está mais conectado:', error);
      return false;
    }
  }

  async scanForDevices(): Promise<BleDevice[]> {
    try {
      console.log('Iniciando scan de dispositivos...');
      
      // Garante que o BLE está inicializado
      if (!this.isInitialized) {
        await BleClient.initialize();
      }

      const devices: BleDevice[] = [];
      let scanTimeout: NodeJS.Timeout;

      const scanPromise = new Promise<BleDevice[]>((resolve, reject) => {
        // Timeout de 8 segundos para o scan
        scanTimeout = setTimeout(() => {
          BleClient.stopLEScan().catch(console.error);
          resolve(devices);
        }, 8000);

        BleClient.requestLEScan(
          { 
            allowDuplicates: false,
            scanMode: 1 // SCAN_MODE_LOW_LATENCY
          },
          (result) => {
            const device = result.device;
            
            // Adiciona todos os dispositivos, não apenas impressoras
            if (!devices.find(d => d.deviceId === device.deviceId)) {
              devices.push(device);
              console.log('Dispositivo encontrado:', device.name || device.deviceId);
            }
          }
        ).catch(reject);
      });

      const foundDevices = await scanPromise;
      
      try {
        await BleClient.stopLEScan();
      } catch (error) {
        console.log('Erro ao parar scan:', error);
      }

      console.log(`Scan concluído. Encontrados ${foundDevices.length} dispositivos`);
      return foundDevices;
      
    } catch (error) {
      console.error('Erro no scan:', error);
      throw new Error(`Erro ao escanear dispositivos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async connectToDevice(deviceId: string): Promise<void> {
    try {
      console.log('Conectando com dispositivo:', deviceId);
      
      // Desconecta do dispositivo atual se houver
      if (this.connectedDeviceId && this.connectedDeviceId !== deviceId) {
        await this.disconnect();
      }

      // Conecta com o novo dispositivo
      await BleClient.connect(deviceId, (disconnectedDeviceId) => {
        console.log(`Dispositivo desconectado: ${disconnectedDeviceId}`);
        this.handleDisconnection();
      });
      
      console.log('Conectado, descobrindo serviços...');
      
      // Descobre serviços e características
      const services = await BleClient.getServices(deviceId);
      const writeChar = await this.findWriteCharacteristic(deviceId, services);
      
      if (!writeChar) {
        await BleClient.disconnect(deviceId);
        throw new Error('Nenhuma característica de escrita encontrada neste dispositivo');
      }

      // Salva informações da conexão
      this.connectedDeviceId = deviceId;
      this.writeServiceUuid = writeChar.serviceUuid;
      this.writeCharacteristicUuid = writeChar.characteristicUuid;
      
      // Busca nome do dispositivo
      const deviceName = services.length > 0 ? `Dispositivo ${deviceId.substring(0, 8)}...` : 'Dispositivo Desconhecido';
      this.currentDevice = { deviceId, name: deviceName };
      
      // Salva como impressora padrão
      this.saveDefaultPrinter(deviceId);
      
      console.log('Conexão estabelecida com sucesso');
      
    } catch (error) {
      console.error('Erro ao conectar:', error);
      this.cleanup();
      throw new Error(`Erro ao conectar com o dispositivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private async findWriteCharacteristic(deviceId: string, services: any[]): Promise<{serviceUuid: string, characteristicUuid: string} | null> {
    console.log('Procurando características de escrita...');
    
    for (const service of services) {
      console.log('Analisando serviço:', service.uuid);
      
      for (const characteristic of service.characteristics) {
        console.log('Característica:', characteristic.uuid, 'Properties:', characteristic.properties);
        
        // Verifica se suporta escrita
        if (characteristic.properties.write || characteristic.properties.writeWithoutResponse) {
          console.log('Característica de escrita encontrada:', characteristic.uuid);
          return {
            serviceUuid: service.uuid,
            characteristicUuid: characteristic.uuid
          };
        }
      }
    }
    
    console.log('Nenhuma característica de escrita encontrada');
    return null;
  }

  async sendData(data: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Bluetooth not initialized');
    }
    
    if (!this.connectedDeviceId) {
      throw new Error('No device connected');
    }
    
    if (!this.writeServiceUuid || !this.writeCharacteristicUuid) {
      throw new Error('Write characteristic not found');
    }

    try {
      console.log('Enviando dados para impressora...');
      
      // Verifica se ainda está conectado
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        throw new Error('Device is no longer connected');
      }

      // Divide dados em chunks menores para evitar overflow
      const chunks = this.chunkData(data, 18); // 18 bytes por chunk para ser mais conservador
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`Enviando chunk ${i + 1}/${chunks.length} (${chunk.length} bytes)`);
        
        const encoder = new TextEncoder();
        const dataArray = encoder.encode(chunk);
        const dataView = new DataView(dataArray.buffer);
        
        await BleClient.write(
          this.connectedDeviceId,
          this.writeServiceUuid,
          this.writeCharacteristicUuid,
          dataView
        );
        
        // Pausa entre chunks para evitar sobrecarga
        if (i < chunks.length - 1) {
          await this.delay(100);
        }
      }
      
      console.log('Dados enviados com sucesso');
      
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      
      // Tenta reconectar uma vez em caso de erro de conexão
      if (error instanceof Error && 
          (error.message.includes('not connected') || 
           error.message.includes('characteristic failed') ||
           error.message.includes('GATT operation failed'))) {
        
        try {
          console.log('Tentando reconectar...');
          await this.reconnect();
          
          // Tenta enviar novamente
          const chunks = this.chunkData(data, 18);
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const encoder = new TextEncoder();
            const dataArray = encoder.encode(chunk);
            const dataView = new DataView(dataArray.buffer);
            
            await BleClient.write(
              this.connectedDeviceId!,
              this.writeServiceUuid!,
              this.writeCharacteristicUuid!,
              dataView
            );
            
            if (i < chunks.length - 1) {
              await this.delay(100);
            }
          }
          
          console.log('Dados enviados após reconexão');
          
        } catch (reconnectError) {
          console.error('Falha na reconexão:', reconnectError);
          throw new Error(`Failed to send data: ${error.message}. Reconnection also failed.`);
        }
      } else {
        throw new Error(`Failed to send data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async reconnect(): Promise<void> {
    if (!this.currentDevice) {
      throw new Error('No device to reconnect to');
    }
    
    // Limpa conexão atual
    try {
      if (this.connectedDeviceId) {
        await BleClient.disconnect(this.connectedDeviceId);
      }
    } catch (error) {
      console.log('Erro ao desconectar para reconexão:', error);
    }
    
    // Reconecta
    await this.connectToDevice(this.currentDevice.deviceId);
  }

  private chunkData(data: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.substring(i, i + chunkSize));
    }
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleDisconnection(): void {
    console.log('Manipulando desconexão...');
    this.cleanup();
  }

  private cleanup(): void {
    this.connectedDeviceId = null;
    this.currentDevice = null;
    this.writeServiceUuid = null;
    this.writeCharacteristicUuid = null;
  }

  async disconnect(): Promise<void> {
    try {
      if (this.connectedDeviceId) {
        console.log('Desconectando dispositivo...');
        await BleClient.disconnect(this.connectedDeviceId);
      }
    } catch (error) {
      console.log('Erro ao desconectar:', error);
    } finally {
      this.cleanup();
      console.log('Dispositivo desconectado');
    }
  }

  async getDefaultPrinter(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('defaultPrinter');
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private saveDefaultPrinter(deviceId: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('defaultPrinter', deviceId);
        console.log('Impressora padrão salva:', deviceId);
      }
    } catch (error) {
      console.log('Não foi possível salvar impressora padrão:', error);
    }
  }

  private removeDefaultPrinter(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('defaultPrinter');
        console.log('Impressora padrão removida');
      }
    } catch (error) {
      console.log('Erro ao remover impressora padrão:', error);
    }
  }

  getConnectionStatus(): { isConnected: boolean, deviceName?: string } {
    return {
      isConnected: this.isInitialized && !!this.connectedDeviceId,
      deviceName: this.currentDevice?.name || this.currentDevice?.deviceId
    };
  }

  // Método para forçar reconexão manual
  async forceReconnect(): Promise<void> {
    console.log('Forçando reconexão...');
    
    if (this.currentDevice) {
      await this.connectToDevice(this.currentDevice.deviceId);
    } else {
      throw new Error('Nenhum dispositivo para reconectar. Selecione uma impressora primeiro.');
    }
  }
}