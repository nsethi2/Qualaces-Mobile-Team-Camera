import { FontAwesome5 } from "@expo/vector-icons";
import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Camera,
  PhotoFile,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";

const CameraScreen = () => {
  const { hasPermission, requestPermission } = useCameraPermission();

  const device = useCameraDevice("front");
  const [isActive, setIsActive] = useState(false);
  const camera = useRef<Camera>(null);
  const [photo, setPhoto] = useState<PhotoFile>();

  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => {
        setIsActive(false);
      };
    }, [])
  );

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const onTakePicturePressed = async () => {
    const photo = await camera.current?.takePhoto();
    console.log(photo);
    setPhoto(photo);
  };

  if (!hasPermission) {
    return <ActivityIndicator />;
  }

  if (!device) {
    return <Text> Camera Not Found</Text>;
  }
  console.log("Active " + isActive);
  console.log(hasPermission);
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: true }} />

      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive && !photo}
        photo={true}
      />

      {photo ? (
        <>
          <Image source={{ uri: photo.path }} style={StyleSheet.absoluteFill} />
          <FontAwesome5
            onPress={() => setPhoto(undefined)}
            name="arrow-left"
            size={20}
            color="white"
            style={{ position: "absolute", top: 50, left: 30 }}
          />
        </>
      ) : (
        <>
          <Pressable
            onPress={onTakePicturePressed}
            style={{
              position: "absolute",
              alignSelf: "center",
              bottom: 70,
              width: 75,
              height: 70,
              backgroundColor: "white",
              borderRadius: 75,
            }}
          />
        </>
      )}
    </View>
  );
};
export default CameraScreen;
