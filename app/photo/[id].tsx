import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { Image } from "expo-image";

export default function PhotoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;

      try {
        // ✅ Get detailed asset info (will include localUri for iCloud-based photos)
        const assetInfo = await MediaLibrary.getAssetInfoAsync(id, {
          shouldDownloadFromNetwork: true,
        } as any);

        let resolvedUri = assetInfo.localUri ?? assetInfo.uri;

        // ⚠️ If still ph://, copy to cache for a file:// path React Native can use
        if (resolvedUri?.startsWith("ph://")) {
          const filename = assetInfo.filename ?? `${id}.jpg`;
          const cacheDirectory = (FileSystem as any).cacheDirectory as string;
          const cachePath = (FileSystem as any).cacheDirectory + filename;


          await FileSystem.copyAsync({
            from: assetInfo.uri,
            to: cachePath,
          });

          resolvedUri = cachePath;
        }

        setUri(resolvedUri ?? null);
      } catch (err) {
        console.error("Failed to resolve image:", err);
        Alert.alert("Error", "Could not load image from photo library.");
      }
    })();
  }, [id]);

  if (!uri) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Image
        source={{ uri: "ph://" }}   // can be ph:// or file://
        style={{ flex: 1 }}
        contentFit="contain"                // expo-image prop
        />
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backText: { color: "white", fontWeight: "600" },
});
