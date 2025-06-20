declare module 'react-native-ble-peripheral' {
  interface BLEPeripheral {
    addService(serviceUUID: string, primary: boolean): Promise<void>;
    addCharacteristicToService(
      serviceUUID: string,
      characteristicUUID: string,
      properties: number,
      permissions: number
    ): Promise<void>;
    setName(name: string): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    sendNotificationToDevices(
      serviceUUID: string,
      characteristicUUID: string,
      data: number[]
    ): Promise<void>;
  }

  const BLEPeripheral: BLEPeripheral;
  export default BLEPeripheral;
} 