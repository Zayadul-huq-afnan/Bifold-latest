///------

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, ScrollView, Alert, Platform, PermissionsAndroid, Clipboard, TouchableOpacity, Linking } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import QRCodeScanner from './QRCodeScanner';
import { useNavigation } from '@react-navigation/native';

const SERVICE_UUID = '0000180F-0000-1000-8000-00805F9B34FB';
const CHARACTERISTIC_UUID = '00002A19-0000-1000-8000-00805F9B34FB';

const ReceiverScreen = () => {
  const navigation = useNavigation();
  const [manager] = useState(() => new BleManager());
  const [scanning, setScanning] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('Ready to scan QR');
  const [receivingData, setReceivingData] = useState(false);
  const [dataChunks, setDataChunks] = useState([]);
  const [expectedChunks, setExpectedChunks] = useState(0);
  const [messageChunks, setMessageChunks] = useState({});

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );
      }
      return true;
    };

    requestPermissions();

    return () => {
      manager.destroy();
    };
  }, [manager]);

  const startScanning = async (deviceInfo) => {
    try {
      setStatus('Starting scan...');
      setScanning(true);

      // Start scanning for BLE devices
      manager.startDeviceScan([deviceInfo.service], null, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          setStatus('Scan error: ' + error.message);
          return;
        }

        if (device && device.name === deviceInfo.name) {
          // Stop scanning once we find our device
          manager.stopDeviceScan();
          console.log('Found device:', device.name);
          
          // Connect to the device
          connectToDevice(device, deviceInfo);
        }
      });

      // Stop scan after 30 seconds
      setTimeout(() => {
        manager.stopDeviceScan();
        if (!connectedDevice) {
          setStatus('Credential Received Successfully');
          setScanning(false);
        }
      }, 30000);

    } catch (error) {
      console.error('Start scan error:', error);
      setStatus('Error: ' + error.message);
      setScanning(false);
    }
  };

  const connectToDevice = async (device, deviceInfo) => {
    try {
      setStatus('Connecting to device...');
      
      const connectedDevice = await device.connect();
      setStatus('Discovering services...');
      
      const deviceWithServices = await connectedDevice.discoverAllServicesAndCharacteristics();
      setConnectedDevice(deviceWithServices);
      setStatus('Connected');

      // Monitor for notifications
      deviceWithServices.monitorCharacteristicForService(
        deviceInfo.service,
        deviceInfo.characteristic,
        (error, characteristic) => {
          if (error) {
            console.error('Notification error:', error);
            return;
          }
          
          if (characteristic?.value) {
            handleReceivedData(characteristic.value);
          }
        }
      );

    } catch (error) {
      console.error('Connection error:', error);
      setStatus('Connection failed: ' + error.message);
    }
  };

  const handleReceivedData = (value: string) => {
    try {
      console.log('Raw value received:', value);
      
      // Convert base64 to bytes
      const bytes = Buffer.from(value, 'base64');
      console.log('Received bytes:', Array.from(bytes));

      // First 2 bytes are chunk index
      const chunkIndex = bytes.readUInt16BE(0);
      // Next 2 bytes are total chunks
      const totalChunks = bytes.readUInt16BE(2);
      // Rest is message data
      const messageBytes = bytes.slice(4);
      const chunkMessage = messageBytes.toString('utf8');

      console.log(`Received chunk ${chunkIndex + 1}/${totalChunks}:`, chunkMessage);

      // Store chunk
      setMessageChunks(prev => {
        const newChunks = {
          ...prev,
          [chunkIndex]: chunkMessage
        };

        // If we have all chunks, combine and display
        if (Object.keys(newChunks).length === totalChunks) {
          // Sort chunks by index and combine
          const completeMessage = Array.from({ length: totalChunks })
            .map((_, i) => newChunks[i] || '')
            .join('');

          console.log('Complete message before parsing:', completeMessage);
          
          try {
            // Try to parse as JSON
            const jsonMessage = JSON.parse(completeMessage);
            console.log('Successfully parsed JSON message:', jsonMessage);
            
            // Store the formatted JSON string for better display
            const formattedMessage = JSON.stringify(jsonMessage, null, 2);
            setMessages(prev => [...prev, formattedMessage]);
            setStatus('Credential received successfully');
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Failed to parse message:', completeMessage);
            setStatus('Error parsing JSON: ' + parseError.message);
          }
          
          // Clear chunks
          return {};
        }

        setStatus('Receiving Credential...');
        return newChunks;
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Data handling error:', error, 'Value was:', value);
      setStatus('Error receiving data: ' + errorMessage);
    }
  };

  const disconnect = async () => {
    if (connectedDevice) {
      await connectedDevice.cancelConnection();
      setConnectedDevice(null);
      setStatus('Disconnected');
    }
  };

  const handleQRCodeScanned = async (data: string) => {
    try {
      const scannedData = JSON.parse(data);
      console.log('Scanned QR data:', scannedData);
      
      if (!scannedData.service || !scannedData.characteristic) {
        throw new Error('Invalid QR code data');
      }

      setShowScanner(false);
      startScanning(scannedData);
    } catch (error) {
      console.error('QR scan error:', error);
      setStatus('Invalid QR code');
    }
  };

  const copyToClipboard = async (message) => {
    try {
      await Clipboard.setString(message);
      setStatus('Message copied to clipboard!');
      // Reset status after 2 seconds
      setTimeout(() => {
        setStatus('Connected and monitoring for messages');
      }, 2000);
    } catch (error) {
      console.error('Copy error:', error);
      setStatus('Failed to copy message');
    }
  };

  const sendViaSMS = async (message: string) => {
    try {
      const phoneNumber = '01724482999';
      // Using smsto: protocol which is specifically for SMS
      const smsUrl = `smsto:${phoneNumber}?body=${encodeURIComponent(message)}`;
      
      console.log('Attempting to open SMS app:', smsUrl);
      const canOpen = await Linking.canOpenURL(smsUrl);
      
      if (canOpen) {
        await Linking.openURL(smsUrl);
        setStatus('Opening SMS app...');
      } else {
        // Try with mms: protocol as fallback
        const mmsUrl = `mms:${phoneNumber}?body=${encodeURIComponent(message)}`;
        console.log('Trying mms: protocol:', mmsUrl);
        await Linking.openURL(mmsUrl);
        setStatus('Opening MMS app...');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setStatus('Error sending SMS: ' + errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{status}</Text>

      {!connectedDevice && !showScanner && (
        <Button
          title="Scan QR Code"
          onPress={() => setShowScanner(true)}
        />
      )}

      {showScanner && (
        <View style={styles.scannerContainer}>
          <QRCodeScanner onCodeScanned={handleQRCodeScanned} />
          <Button
            title="Cancel"
            onPress={() => setShowScanner(false)}
          />
        </View>
      )}

      {connectedDevice && (
        <TouchableOpacity 
          style={styles.button}
          onPress={disconnect}
        >
          <Text style={styles.buttonText}>Disconnect</Text>
        </TouchableOpacity>
      )}

      {messages.length > 0 && (
        <>
          <ScrollView style={styles.messagesContainer}>
            <Text style={styles.messageTitle}>Received Messages:</Text>
            {messages.map((message, index) => (
              <View key={index} style={styles.messageWrapper}>
                <View style={styles.messageBox}>
                  <Text style={styles.message}>{message}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(messages[messages.length - 1])}
            >
              <Text style={styles.buttonText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smsButton}
              onPress={() => sendViaSMS(messages[messages.length - 1])}
            >
              <Text style={styles.buttonText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  status: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scannerContainer: {
    flex: 1,
    marginVertical: 0,
    marginHorizontal: -20,
  },
  messagesContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 5,
    maxHeight: 300,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFFFFF',
  },
  messageWrapper: {
    marginBottom: 8,
  },
  messageBox: {
    backgroundColor: '#333333',
    padding: 12,
    borderRadius: 8,
  },
  message: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  copyButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  smsButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReceiverScreen; 