import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import * as MediaLibrary from "expo-media-library";
import React,{ useEffect, useRef, useState} from 'react';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing'
import TextRecognition from 'react-native-text-recognition';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
// Assuming 'expo-router' is used, though not strictly necessary for camera functionality
import { router } from "expo-router" 

const APP_ALBUM = "React Camera App"

// A simple reusable button component
function Primary({
    onPress,
    label,
}: {
    onPress?: () => void;
    label: string;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                backgroundColor: "black",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
            }}
        >
            <Text style={{ color: "white", fontWeight: "600" }}>{label}</Text>
        </TouchableOpacity>
    );
}

export default function App() {

    // Camera permission hook from react-native-vision-camera
    const {hasPermission, requestPermission} = useCameraPermission();

    const FS = require('expo-file-system');

    // Media Library permission hook from expo-media-library
    const [libPerm, requestLibPerm] = MediaLibrary.usePermissions();

    const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back');

    const device = useCameraDevice(cameraPosition);

    const toggleCamera = () => {
      setCameraPosition(prevPosition =>
        prevPosition == 'back' ? 'front' : 'back'
      );
    }

    // Camera reference for calling native methods like takePhoto()
    const cameraRef = useRef<Camera>(null);

    // --- EFFECT TO REQUEST MEDIA LIBRARY PERMISSION ON LOAD ---
    useEffect(() => {
        if (libPerm === null || libPerm.status !== 'granted') {
            requestLibPerm();
        }
    }, [libPerm]);

    // --- PHOTO CAPTURE FUNCTIONALITY ---
 const takePhoto = async () => {
    // 1. Check if the camera reference is available
    if (!cameraRef.current || !libPerm || !libPerm.granted) {
        Alert.alert("Permission Required", "Please ensure camera and photo library access are granted.");
        return;
    }

    try {
        // 2. Take the photo and save the asset to the library/album
        const photo = await cameraRef.current.takePhoto({
            flash: 'off',
            enableShutterSound: true,
        });
        
        const asset = await MediaLibrary.createAssetAsync(photo.path);
    
        let album = await MediaLibrary.getAlbumAsync(APP_ALBUM);
        if (album == null) {
            album = await MediaLibrary.createAlbumAsync(APP_ALBUM, asset, false);
        } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
        }

        // 3. Perform OCR
        const recognizedText = await TextRecognition.recognize(photo.path);
        
        if (recognizedText && recognizedText.length > 0) {
            const ocrResult = recognizedText.join('\n'); 
                        
            setTimeout(() => {
            router.push({
                pathname: "/preview", // Target the new preview screen
                params: { recognizedText: ocrResult }, // Pass the text result
            });
            }, 0); 
            } else {
            Alert.alert("OCR Result", "No text found in the image. Photo saved.");
            setTimeout(() => {
                router.push('/gallery'); 
            }, 0);
        }
        
        // Remove the old success alert for photo saving, as the navigation will handle user feedback
        // Alert.alert("Success", "Photo saved to your device's photo library!"); 

    } catch (error) {
        console.error("Failed to take or process photo:", error);
        Alert.alert("Error", "Could not capture, save, or process photo.");
    }
};
    
    // --- RENDER PERMISSION STATUS VIEWS ---
    if (!hasPermission) {
        return (
            <View style={styles.permissionContainer}>
                <Text>Camera permission is required.</Text>
                <TouchableOpacity onPress={requestPermission}>
                    <Text style={{ color: 'blue', marginTop: 10}}>Grant Camera Permission</Text>
                </TouchableOpacity>
                <Text style={{marginTop: 20}}>
                    {libPerm?.status !== 'granted' ? "Media Library permission is also required." : ""}
                </Text>
            </View>
        );
    }
    
    if (device == null) {
        return (
            <View style={styles.center}>
                <Text>Loading camera...</Text>
            </View>
        );
    }

    // --- MAIN CAMERA VIEW ---
    return (
        <View style={styles.container}>
            <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                photo={true} // Enable photo capture
            />

            {/* Camera Controls */}
            <View style={styles.controls}>
                <Primary onPress={toggleCamera} label={cameraPosition === 'back' ? "Front" : "Back"} />
                <TouchableOpacity onPress={takePhoto} style={styles.shutter} />
                
                {/* Router/Navigation button (if needed) */}
                <Primary onPress={() => router.push('/gallery')} label="Gallery" />
            </View>
        </View>
    );
}


App.options = {
    headerTitle: 'Camera',
}
// --- STYLES ---
const styles = StyleSheet.create({
    center: {
        flex: 1, alignItems: "center", justifyContent: "center", gap: 12
    },
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    controls: {
        position: "absolute", 
        bottom: 40, 
        left: 0, 
        right: 0,
        flexDirection: "row", 
        justifyContent: "space-evenly", 
        alignItems: "center"
    },
    shutter: { 
        width: 70, 
        height: 70, 
        borderRadius: 35, 
        backgroundColor: "white", 
        borderWidth: 4, 
        borderColor: "black" 
    }
});