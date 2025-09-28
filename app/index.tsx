// app/camera.tsx
import { Link, Stack } from 'expo-router';
import React from 'react';
import { Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
//import MyCamera from '../components/Camera'; // Adjust if filename is different


const description = 'Small demo that uses camera';


const HomeScreen = () => {
  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1}}>
       <Stack.Screen options={{ title: 'Camera' }} />
       <Link href="./camera" asChild>
          <Button title="Go to Camera App" />
       </Link>
    </SafeAreaView>
  );
};
export default HomeScreen;
/*
export default function CameraScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MyCamera />
    </SafeAreaView>
  );
}
  */
