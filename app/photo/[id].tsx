import * as MediaLibrary from "expo-media-library";
import React, {FunctionComponent, useEffect, useState, useCallback} from  'react';
import * as FileSystem from "expo-file-system";
// ✅ NEW IMPORT: useNavigation
import { useLocalSearchParams, router, useNavigation } from "expo-router"; 
import { View, ActivityIndicator, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { Image } from "expo-image";
import TextRecognition from 'react-native-text-recognition';

const FS = require('expo-file-system');


// --- Main Component Definition ---
const PhotoDetail: FunctionComponent = () => {
    // 💡 REMOVE deleteAction and ocrAction from local params
    const { id, uri: initialUri } = useLocalSearchParams(); 
    const assetId = Array.isArray(id) ? id[0] : (id as string);

    const [displayUri, setDisplayUri] = useState<string | undefined>(initialUri as string);
    // ✅ NEW HOOK: Get navigation object
    const navigation = useNavigation();

    // --- OCR Handler (Same logic) ---
    const handleOCR = useCallback(async () => {
        if (!displayUri) return;

        try {
            const recognizedText = await TextRecognition.recognize(displayUri);
            
            if (recognizedText && recognizedText.length > 0) {
                const ocrResult = recognizedText.join('\n'); 
                
                setTimeout(() => {
                    router.push({
                        pathname: "/preview", 
                        params: { recognizedText: ocrResult }, 
                    });
                }, 0);

            } else {
                Alert.alert("OCR Result", "No text found in this image.");
            }
        } catch (error) {
            console.error("OCR failed:", error);
            Alert.alert("Error", "Text recognition failed to run.");
        }
    }, [displayUri]);


    // --- Delete Handler (Same logic) ---
    const handleDelete = useCallback(async () => {
        Alert.alert(
            "Confirm Deletion",
            "Are you sure you want to permanently delete this photo?",
            [
                {text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try{
                            await MediaLibrary.deleteAssetsAsync([assetId]);
                            Alert.alert("Deleted", "Photo removed from device.")
                            router.replace('/gallery');
                        }catch (error) {
                            console.error("Deletion failed:", error);
                            Alert.alert("Error", "Failed to delete photo.")
                        }
                    }
                }
            ]
        )
    }, [assetId]);
    
    // ✅ NEW EFFECT: Dynamically set header options
    // This runs after mount and whenever handleOCR or handleDelete changes (which they don't, 
    // so it only runs once and then updates when displayUri is ready).
    useEffect(() => {
        // Only set options once we have the handlers
        if (!handleOCR || !handleDelete) return;

        navigation.setOptions({
            headerTitle: "Photo Detail",
            headerTitleAlign:"center",
            headerRight: () => (
                <View style={{ flexDirection: 'row', marginRight: 10 }}>
                    
                    {/* Delete Button */}
                    <TouchableOpacity 
                        onPress={handleDelete} // Call handler directly
                    >
                        <Text 
                            style={{ color: 'red', fontWeight: 'bold' }}
                        >
                            Delete
                        </Text>
                    </TouchableOpacity>
                </View>
            ),
        });
        
    }, [navigation, handleOCR, handleDelete, displayUri]); // Depend on handlers and navigation object


    // 3. Load Asset URI (Existing Logic)
    useEffect(() => {
        (async () => {
            if (!assetId) return;
            // ... (MediaLibrary.getAssetInfoAsync logic remains the same) ...
             try {
                const assetInfo = await MediaLibrary.getAssetInfoAsync(assetId, {
                    shouldDownloadFromNetwork: true,
                } as any);

                let resolvedUri = assetInfo.localUri;

                if (resolvedUri) {
                    setDisplayUri(resolvedUri);
                } else if (assetInfo.uri && assetInfo.uri.startsWith("ph://")) {
                    const filename = assetInfo.filename ?? `${assetId}.jpg`; 
                    const cachePath = FS.cacheDirectory + filename; 

                    await FileSystem.copyAsync({
                        from: assetInfo.uri,
                        to: cachePath,
                    });

                    setDisplayUri(cachePath);
                } else if (assetInfo.uri) {
                    setDisplayUri(assetInfo.uri);
                } else {
                    throw new Error("No valid URI found for asset.");
                }

            } catch (err) {
                console.error("Failed to resolve image:", err);
                Alert.alert("Error", "Could not load image from photo library.");
            }
        })();
    }, [assetId]);


    if (!displayUri) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#000" }}>
            <Image
                source={{ uri : displayUri as string }}
                style={{ flex: 1 }}
                contentFit="contain"
            />
            <View style={styles.controls}>
                <TouchableOpacity
                    onPress={handleOCR}
                    style = {[
                        styles.bottomButton, 
                        {backgroundColor: displayUri ? 'teal' : 'gray'}
                    ]} 
                    disabled = {!displayUri}
                >
                    <Text style = {styles.buttonText}>
                        Analyze Text
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
        );
}; 

// ❌ DELETE: Remove the static options block completely
/*
(PhotoDetail as any).options = {
    // ... all the old header logic ...
};
*/

// --- Export ---
export default PhotoDetail as any;

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  controls: {
    position: "absolute", 
    bottom: 100, 
    left: 0, 
    right: 0,
    flexDirection: "row", 
    justifyContent: "space-around", // Use space-around if you add another button
    alignItems: "center",
    paddingHorizontal: 20, // Add padding for appearance
  },
  bottomButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    // Adjust width as needed
    width: 150, 
    alignItems: 'center',
  },
  buttonText: { 
    color: "white", 
    fontWeight: "600" 
  }
});