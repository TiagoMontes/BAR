interface Navigator {
  bluetooth: {
    requestDevice(options: {
      acceptAllDevices?: boolean;
      optionalServices?: string[];
    }): Promise<BluetoothDevice>;
  };
}

interface BluetoothDevice {
  id: string;
  name?: string;
  gatt?: {
    connect(): Promise<BluetoothRemoteGATTServer>;
  };
}

interface BluetoothRemoteGATTServer {
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothRemoteGATTService {
  getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTCharacteristic {
  writeValue(value: BufferSource): Promise<void>;
} 