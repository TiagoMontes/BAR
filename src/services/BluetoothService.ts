import { BleClient, numberToUUID } from '@capacitor-community/bluetooth-le';
import { Preferences } from '@capacitor/preferences';

export class BluetoothService {
  private static instance: BluetoothService;
  private isInitialized: boolean = false;
  private isScanning: boolean = false;
  private discoveredDevices: any[] = [];
  private scanTimeout: any = null;
  // Common UUIDs for thermal printers
  private readonly SERVICE_UUID = '49535343-fe7d-4ae5-8fa9-9fafd205e455';
  private readonly CHARACTERISTIC_UUID = '49535343-8841-43f4-a8d4-ecbe34729bb3';
  private connectedDeviceId: string | null = null;

  private constructor() {}

  static getInstance(): BluetoothService {
    if (!BluetoothService.instance) {
      BluetoothService.instance = new BluetoothService();
    }
    return BluetoothService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await BleClient.initialize();
      this.isInitialized = true;
      console.log('Bluetooth initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Bluetooth:', error);
      throw error;
    }
  }

  async scanForDevices(): Promise<any[]> {
    if (!this.isInitialized) {
      throw new Error('Bluetooth not initialized');
    }

    if (this.isScanning) {
      throw new Error('Scan already in progress');
    }

    try {
      this.isScanning = true;
      this.discoveredDevices = [];

      // Request permissions first
      await BleClient.requestLEScan(
        {
          services: [], // Empty array means scan for all services
          allowDuplicates: false,
        },
        (result) => {
          if (result.device) {
            console.log('Discovered device:', result.device);
            // Only add devices that haven't been discovered yet
            if (!this.discoveredDevices.some(d => d.deviceId === result.device.deviceId)) {
              this.discoveredDevices.push(result.device);
            }
          }
        }
      );

      // Set a timeout to stop scanning after 10 seconds
      this.scanTimeout = setTimeout(() => {
        this.stopScan();
      }, 10000);

      // Wait for the scan to complete
      await new Promise(resolve => setTimeout(resolve, 10000));

      return this.discoveredDevices;
    } catch (error) {
      console.error('Error scanning for devices:', error);
      throw error;
    } finally {
      this.stopScan();
    }
  }

  private stopScan(): void {
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = null;
    }
    if (this.isScanning) {
      BleClient.stopLEScan();
      this.isScanning = false;
    }
  }

  async connectToDevice(deviceId: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Bluetooth not initialized');
    }

    try {
      // Connect to the device
      await BleClient.connect(deviceId);
      console.log('Connected to device:', deviceId);
      this.connectedDeviceId = deviceId;

      // Save the connected device as default
      await Preferences.set({
        key: 'defaultPrinter',
        value: deviceId
      });
    } catch (error) {
      console.error('Failed to connect to device:', error);
      this.connectedDeviceId = null;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Bluetooth not initialized');
    }

    try {
      if (this.connectedDeviceId) {
        await BleClient.disconnect(this.connectedDeviceId);
        this.connectedDeviceId = null;
        console.log('Disconnected from device');
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
      throw error;
    }
  }

  async sendData(data: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Bluetooth not initialized');
    }

    if (!this.connectedDeviceId) {
      throw new Error('No device connected');
    }

    try {
      console.log('Preparing to send data to device:', this.connectedDeviceId);
      console.log('Using service UUID:', this.SERVICE_UUID);
      console.log('Using characteristic UUID:', this.CHARACTERISTIC_UUID);

      // Convert string to DataView
      const encoder = new TextEncoder();
      const dataArray = encoder.encode(data);
      const dataView = new DataView(dataArray.buffer);

      console.log('Sending data:', data);
      console.log('Data length:', dataArray.length);

      // Write data to the characteristic
      await BleClient.write(
        this.connectedDeviceId,
        this.SERVICE_UUID,
        this.CHARACTERISTIC_UUID,
        dataView
      );
      console.log('Data sent successfully');
    } catch (error) {
      console.error('Failed to send data:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to send data: ${error.message}`);
      }
      throw error;
    }
  }

  async getDefaultPrinter(): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key: 'defaultPrinter' });
      return value;
    } catch (error) {
      console.error('Failed to get default printer:', error);
      return null;
    }
  }
} 