import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import SenderScreen from './SenderScreen';
import ReceiverScreen from './ReceiverScreen';

type Mode = 'sender' | 'receiver' | null;

const App = () => {
  const [mode, setMode] = useState<Mode>(null);

  if (!mode) {
    return (
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => setMode('sender')}
          >
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => setMode('receiver')}
          >
            <Text style={styles.buttonText}>Receive</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {mode === 'sender' ? <SenderScreen /> : <ReceiverScreen />}
      <View style={styles.backButton}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setMode(null)}
        >
          <Text style={styles.buttonText}>Back to Selection</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});

export default App; 