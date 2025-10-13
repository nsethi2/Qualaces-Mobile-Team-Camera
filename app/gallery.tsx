import * as MediaLibrary from "expo-media-library";
import { useEffect, useState, useCallback } from "react";
import { View, FlatList, Image, Dimensions, TouchableOpacity, ActivityIndicator, Text, StyleSheet } from "react-native";
import { router } from "expo-router";

const APP_ALBUM = "React Camera App";

export default function GalleryScreen() {
  const [perm, requestPerm] = MediaLibrary.usePermissions();
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!perm || (!perm.granted && perm.canAskAgain)) {
        await requestPerm();
      }
      if (perm?.granted) {
        const album = await MediaLibrary.getAlbumAsync(APP_ALBUM);
        setAlbumId(album?.id ?? null);
      }
    })();
  }, [perm?.granted]);

  const loadPage = useCallback(async () => {
    if (loading || !hasNextPage || !albumId) return;
    setLoading(true);
    try {
      const page = await MediaLibrary.getAssetsAsync({
        album: albumId,
        first: 60,
        after: endCursor ?? undefined,
        mediaType: ["photo"],
        sortBy: [[MediaLibrary.SortBy.creationTime, false]], // newest first
      });
      setAssets(prev => [...prev, ...page.assets]);
      setEndCursor(page.endCursor ?? null);
      setHasNextPage(page.hasNextPage);
    } finally {
      setLoading(false);
    }
  }, [albumId, loading, hasNextPage, endCursor]);

  useEffect(() => {
    if (albumId) loadPage();
  }, [albumId]);

  if (!perm) return null;

  if (!perm.granted) {
    return (
      <View style={styles.center}>
        <Text>We need Photos permission to show your album.</Text>
        <TouchableOpacity onPress={requestPerm} style={styles.primary}>
          <Text style={styles.primaryText}>Grant Photos Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If the album doesn’t exist yet (no photos saved by the app), show an empty state
  if (albumId === null) {
    return (
      <View style={styles.center}>
        <Text>No photos yet. Take one with the camera!</Text>
      </View>
    );
  }

  const size = Dimensions.get("window").width / 3;

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <FlatList
        data={assets}
        keyExtractor={(a) => a.id}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push({ pathname: "/photo/[id]", params: { id: item.id } })}>
            <Image source={{ uri: item.uri }} style={{ width: size, height: size }} resizeMode="cover" />
          </TouchableOpacity>
        )}
        onEndReachedThreshold={0.2}
        onEndReached={() => hasNextPage && loadPage()}
        ListFooterComponent={loading ? <ActivityIndicator style={{ padding: 16 }} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 16 },
  primary: { backgroundColor: "black", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  primaryText: { color: "white", fontWeight: "600" },
});
