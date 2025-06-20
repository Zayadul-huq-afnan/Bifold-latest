import React, { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

const QRCodeScanner = ({ onCodeScanned }) => {
  const [scanned, setScanned] = useState(false);
  const device = useCameraDevice('back');

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (scanned || !codes || codes.length === 0) return;
      
      const data = codes[0].value;
      setScanned(true);
      console.log(`QR code with data ${data} has been scanned!`);
      
      if (onCodeScanned) {
        onCodeScanned(data);
      }
    },
  });

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Camera not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.scanner}
        device={device}
        isActive={!scanned}
        codeScanner={codeScanner}
      >
        <View style={styles.overlay}>
          <Text style={styles.scannerText}>
            Point the camera at the sender's QR code
          </Text>
        </View>
      </Camera>
      
      {scanned && (
        <Button 
          title={'Tap to Scan Again'} 
          onPress={() => setScanned(false)} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    width : '100%',
    height : '80%',
  },
  scanner: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 8,
  },
});

export default QRCodeScanner; 



// import React, { useState, useEffect } from 'react';
// import { StyleSheet, Text, View, Button, Dimensions } from 'react-native';
// import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

// const { width, height } = Dimensions.get('window');
// const SCAN_AREA_SIZE = width * 0.7; // Size of the scanning area
// const SCAN_AREA_PADDING = (width - SCAN_AREA_SIZE) / 2;

// const QRCodeScanner = ({ onCodeScanned }) => {
//   const [scanned, setScanned] = useState(false);
//   const [hasPermission, setHasPermission] = useState(false);
//   const device = useCameraDevice('back');

//   useEffect(() => {
//     (async () => {
//       const status = await Camera.requestCameraPermission();
//       setHasPermission(status === 'granted');
//     })();
//   }, []);

//   const codeScanner = useCodeScanner({
//     codeTypes: ['qr'],
//     regionOfInterest: { 
//       x: SCAN_AREA_PADDING / width, 
//       y: (height - SCAN_AREA_SIZE) / 2 / height, 
//       width: SCAN_AREA_SIZE / width, 
//       height: SCAN_AREA_SIZE / height 
//     },
//     onCodeScanned: (codes) => {
//       if (scanned || !codes || codes.length === 0) return;
      
//       const code = codes.find(c => 
//         c.frame?.x >= SCAN_AREA_PADDING && 
//         c.frame?.x + c.frame?.width <= width - SCAN_AREA_PADDING &&
//         c.frame?.y >= (height - SCAN_AREA_SIZE) / 2 &&
//         c.frame?.y + c.frame?.height <= (height + SCAN_AREA_SIZE) / 2
//       );

//       if (!code) return;

//       const data = code.value;
//       setScanned(true);
//       console.log('Scanned QR code:', data);
      
//       if (onCodeScanned) {
//         onCodeScanned(data);
//       }
//     },
//   });

//   if (!device) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.errorText}>Camera not available</Text>
//       </View>
//     );
//   }

//   if (!hasPermission) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.errorText}>Camera permission not granted</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Camera
//         style={StyleSheet.absoluteFill}
//         device={device}
//         isActive={!scanned}
//         codeScanner={codeScanner}
//         audio={false}
//       />
      
//       {/* Scan area overlay */}
//       <View style={styles.overlay}>
//         <View style={styles.unfocusedArea} />
//         <View style={styles.focusedArea}>
//           <View style={[styles.corner, styles.topLeft]} />
//           <View style={[styles.corner, styles.topRight]} />
//           <View style={[styles.corner, styles.bottomLeft]} />
//           <View style={[styles.corner, styles.bottomRight]} />
//         </View>
//         <View style={styles.unfocusedArea} />
//       </View>
      
//       <Text style={styles.scannerText}>
//         Align QR code within the frame
//       </Text>
      
//       {scanned && (
//         <View style={styles.buttonContainer}>
//           <Button 
//             title="Scan Again" 
//             onPress={() => setScanned(false)}
//             color="#fff"
//           />
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   unfocusedArea: {
//     flex: 1,
//     width: '100%',
//     backgroundColor: 'rgba(0,0,0,0.6)',
//   },
//   focusedArea: {
//     width: SCAN_AREA_SIZE,
//     height: SCAN_AREA_SIZE,
//     borderColor: 'rgba(255,255,255,0.5)',
//     borderWidth: 1,
//     position: 'relative',
//   },
//   corner: {
//     position: 'absolute',
//     width: 30,
//     height: 30,
//     borderColor: '#fff',
//   },
//   topLeft: {
//     top: -1,
//     left: -1,
//     borderTopWidth: 4,
//     borderLeftWidth: 4,
//   },
//   topRight: {
//     top: -1,
//     right: -1,
//     borderTopWidth: 4,
//     borderRightWidth: 4,
//   },
//   bottomLeft: {
//     bottom: -1,
//     left: -1,
//     borderBottomWidth: 4,
//     borderLeftWidth: 4,
//   },
//   bottomRight: {
//     bottom: -1,
//     right: -1,
//     borderBottomWidth: 4,
//     borderRightWidth: 4,
//   },
//   scannerText: {
//     position: 'absolute',
//     bottom: 100,
//     alignSelf: 'center',
//     color: 'white',
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     padding: 15,
//     borderRadius: 8,
//     fontSize: 16,
//   },
//   buttonContainer: {
//     position: 'absolute',
//     bottom: 40,
//     alignSelf: 'center',
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     borderRadius: 8,
//     paddingHorizontal: 20,
//   },
//   errorText: {
//     color: 'white',
//     fontSize: 18,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     padding: 20,
//     borderRadius: 8,
//   },
// });

// export default QRCodeScanner;


