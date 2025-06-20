///---------

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform, PermissionsAndroid, ScrollView } from 'react-native';
import BLEPeripheral from 'react-native-ble-peripheral';
import QRCodeGenerator from './QRCodeGenerator';
import { Buffer } from 'buffer';
import { getCredentialList } from '../data/CredentialList';
import { useAgent } from '@credo-ts/react-hooks';

const SERVICE_UUID = '0000180F-0000-1000-8000-00805F9B34FB'; // Using standard Battery Service UUID
const CHARACTERISTIC_UUID = '00002A19-0000-1000-8000-00805F9B34FB'; // Battery Level Characteristic
const CHUNK_SIZE = 20; // BLE packet size limit

const SenderScreen = () => {
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [credentialList, setCredentialList] = useState([]);
  const { agent } = useAgent();

  useEffect(() => {
    requestPermissions();
    loadCredentials();
    return () => BLEPeripheral.stop();
  }, [agent]);

  const loadCredentials = async () => {
    if (agent) {
      try {
        const credentials = await getCredentialList(agent);
        setCredentialList(credentials);
        console.log('Loaded credentials:', credentials);
      } catch (error) {
        console.error('Error loading credentials:', error);
        setStatus('Error loading credentials');
      }
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      return Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    return true;
  };

  const setupAndStartAdvertising = async () => {
    try {
      setStatus('Setting up...');
      await BLEPeripheral.addService(SERVICE_UUID, true);
      await BLEPeripheral.addCharacteristicToService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        16 | 1, // Writable | Readable
        8 | 16  // Writable | Notify
      );
      await BLEPeripheral.setName('BLE_Sender');
      await BLEPeripheral.start();
      
      // Generate QR data
      const qrData = {
        service: SERVICE_UUID,
        characteristic: CHARACTERISTIC_UUID,
        name: 'BLE_Sender'
      };
      setDeviceInfo(JSON.stringify(qrData));
      
      setIsAdvertising(true);
      setStatus('Advertising');
    } catch (error) {
      console.error('Setup error:', error);
      setStatus('Error: ' + error.message);
    }
  };

  const sendCredential = async (credential) => {
    try {
      // Check if credential is already a string (JSON)
      let message;
      if (typeof credential === 'string') {
        message = credential;
      } else {
        // Convert the credential object to a string
        message = JSON.stringify(credential);
      }
      
      console.log('Original message to send:', message);

      // Convert string to bytes
      const messageBytes = Buffer.from(message, 'utf8');
      const totalChunks = Math.ceil(messageBytes.length / 15);
      console.log(`Total chunks to send: ${totalChunks}`);

      setStatus('Sending Credential...');

      // Send each chunk
      for (let i = 0; i < totalChunks; i++) {
        const start = i * 15;
        const end = Math.min(start + 15, messageBytes.length);
        const chunk = messageBytes.slice(start, end);
        
        // Create byte array with chunk info
        const chunkInfo = Buffer.alloc(4);
        chunkInfo.writeUInt16BE(i, 0); // Chunk index
        chunkInfo.writeUInt16BE(totalChunks, 2); // Total chunks
        
        // Combine chunk info with data
        const dataToSend = Buffer.concat([chunkInfo, chunk]);
        const base64Data = dataToSend.toString('base64');
        
        console.log(`Sending chunk ${i + 1}/${totalChunks}:`, base64Data);
        
        try {
          await BLEPeripheral.sendNotificationToDevices(
            SERVICE_UUID,
            CHARACTERISTIC_UUID,
            Array.from(dataToSend)
          );
          // Add delay between chunks
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (sendError) {
          console.error(`Error sending chunk ${i + 1}:`, sendError);
          throw new Error(`Failed to send chunk ${i + 1}: ${sendError.message}`);
        }
      }

      setStatus('Credential sent successfully');
    } catch (error) {
      console.error('Error sending credential:', error);
      setStatus('Error sending credential: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      {status && <Text style={styles.status}>{status}</Text>}

      {!isAdvertising ? (
        <TouchableOpacity 
          style={styles.button}
          onPress={setupAndStartAdvertising}
        >
          <Text style={styles.buttonText}>Start Advertising</Text>
        </TouchableOpacity>
      ) : (
        <>
          {deviceInfo && (
            <View style={styles.qrContainer}>
              <Text style={styles.instruction}>Scan this QR code with receiver device</Text>
              <QRCodeGenerator data={deviceInfo} />
            </View>
          )}
          <ScrollView style={styles.credentialList}>
            <Text style={styles.credentialTitle}>Available Credentials:</Text>
            {credentialList.map((credential, index) => {
              let credentialType = 'Unknown Type';
              let credentialName = 'Unknown';
              
              try {
                // Parse the credential if it's a string
                const parsedCredential = typeof credential === 'string' ? JSON.parse(credential) : credential;
                
                // Extract type and name from the parsed credential
                if (parsedCredential?.verifiableCredential?.type) {
                  const types = parsedCredential.verifiableCredential.type;
                  credentialType = types.find(type => type !== 'VerifiableCredential') || types[0] || 'Unknown Type';
                }
                
                if (parsedCredential?.verifiableCredential?.credentialSubject?.name) {
                  credentialName = parsedCredential.verifiableCredential.credentialSubject.name;
                }
              } catch (error) {
                console.error('Error parsing credential:', error);
              }
              
              return (
                <View key={index} style={styles.credentialItemContainer}>
                  <View style={styles.credentialItem}>
                    <Text style={styles.credentialType}>{credentialType}</Text>
                    <Text style={styles.credentialSubject}>
                      Name: {credentialName}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => sendCredential(credential)}
                  >
                    <Text style={styles.sendButtonText}>Send</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 2,
    backgroundColor: '#1a1a1a',
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 1,
    marginBottom: 1,
  },
  instruction: {
    fontSize: 16,
    marginBottom: 1,
    color: '#FFFFFF',
  },
  credentialList: {
    marginTop: 1,
    flex: 1,
  },
  credentialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFFFFF',
  },
  credentialItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  credentialItem: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  credentialType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  credentialSubject: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 5,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
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

export default SenderScreen; 