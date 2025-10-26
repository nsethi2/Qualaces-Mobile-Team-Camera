import * as MediaLibrary from "expo-media-library";
import React, {FunctionComponent, useEffect, useState, useCallback} from  'react';
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, router } from "expo-router";
import { View, ActivityIndicator, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { Image } from "expo-image";

// Define the runtime alias for FileSystem (to avoid TS error for cacheDirectory)
const FS = require('expo-file-system');


// --- Main Component Definition ---
const PhotoDetail: FunctionComponent = () => {
    const { id, uri: initialUri, deleteAction } = useLocalSearchParams(); // Pulled deleteAction here
    const assetId = Array.isArray(id) ? id[0] : (id as string);

    const [displayUri, setDisplayUri] = useState<string | undefined>(initialUri as string);

    // Memoize handleDelete
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

    // 1. Monitor the deleteAction parameter set by the static header button
    useEffect(() => {
        if (deleteAction) {
            handleDelete();
            // Clear the param to allow the button to be pressed again
            router.setParams({ deleteAction: undefined });
        }
    }, [deleteAction, handleDelete]);


    // 2. Load Asset URI
    useEffect(() => {
        (async () => {
            if (!assetId) return;

            try {
                const assetInfo = await MediaLibrary.getAssetInfoAsync(assetId, {
                    shouldDownloadFromNetwork: true,
                } as any);

                let resolvedUri = assetInfo.localUri;

                if (resolvedUri) {
                    setDisplayUri(resolvedUri);
                } else if (assetInfo.uri && assetInfo.uri.startsWith("ph://")) {
                    console.log("Using FileSystem fallback for ph:// URI");
                    // Use assetId in the filename generation
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
        </View>
    );
}; // <--- Component function body ends here

// --- Static Options Definition (Outside the function body) ---
// This is the correct place to define static properties like 'options' on the constant

const triggerDelete = () => router.setParams({ deleteAction: Date.now().toString() });

(PhotoDetail as any).options = {
headerRight: () => (
        <TouchableOpacity 
            onPress={() => router.setParams({ deleteAction: Date.now().toString() })} 
            style={{ marginRight: 10 }} // Style for positioning
        >
            <Text 
                // ✅ FIX: Add the styles to make the text red and bold
                style={{ color: 'red', fontWeight: 'bold' }}
            >
                Delete Photo
            </Text>
        </TouchableOpacity>
    ),
};

// --- Export ---
export default PhotoDetail as any;

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});