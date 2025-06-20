import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const QRCodeGenerator = ({ data }) => {
  if (!data) {
    return (
      <View style={styles.container}>
        <Text>Waiting for device ID...</Text>
      </View>
    );
  }

  console.log('Generating QR code with data:', data); // Debug log

  return (
    <View style={styles.container}>
      <QRCode
        value={data}
        size={200}
        backgroundColor='white'
        color='black'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
  }
});

export default QRCodeGenerator; 