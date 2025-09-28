/*import { Camera, CameraType, useCameraPermissions } from 'expo-camera';
import React, { useRef } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function MyCamera() {
  const cameraRef = useRef<any>(null);

  // Use the new hook to get permission status and request method
  const [permission, requestPermission] = useCameraPermissions();
  const camType = CameraType.back;

  if (!permission) {
    // Permission is still loading
    return (
      <View style={styles.center}>
        <Text>Loading permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Permission not granted yet
    return (
      <View style={styles.center}>
        <Text>We need your permission to use the camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  // Permission granted, render camera
  return (
    <Camera style={styles.camera} type={CameraType.back} ref={cameraRef} />
  );
}

const styles = StyleSheet.create({
  camera: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
*/