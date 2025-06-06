import { BluetoothPrinter } from "../src/components/BluetoothPrinter";


export default function PrinterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Bluetooth Printer Test</h1>
      <BluetoothPrinter />
    </div>
  );
} 