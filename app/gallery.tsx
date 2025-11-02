import * as MediaLibrary from "expo-media-library";
import { useEffect, useState, useCallback } from "react";
import { View, FlatList, Dimensions, TouchableOpacity, ActivityIndicator, Text, StyleSheet, Alert } from "react-native";
// ✅ IMPORT FIX: Add useNavigation
import { router, useNavigation } from "expo-router"; 
import { Image } from "expo-image";

const APP_ALBUM = "React Camera App";

export default function GalleryScreen() {
  // --- Existing States ---
  const [perm, requestPerm] = MediaLibrary.usePermissions();
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  
  // ✅ FIX: Get the navigation object for dynamic header updates
  const navigation = useNavigation(); 

  // --- Initial Album Load ---
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

  // --- Bulk Delete Handlers ---

  const toggleAssetSelection = useCallback((assetId: string) => {
    setSelectedAssets(prevSelected => {
      if (prevSelected.includes(assetId)){
        return prevSelected.filter(id => id !== assetId);
      }
      else{
        return [...prevSelected, assetId];
      }
    })
  }, []);

  const toggleSelectionMode = useCallback((mode: boolean) => {
      setSelectionMode(mode);
      if (!mode) setSelectedAssets([]);
  }, []);
  
  const bulkDelete = useCallback(async () => {
    if(selectedAssets.length === 0){
      Alert.alert("No photos selected", "Please select photos to delete.");
      return;
    }
    Alert.alert(
      "Confirm Deletion:",
      `Are you sure you want to delete ${selectedAssets.length} photo(s)?`,
      [
        {text: "Cancel", style: "cancel"},
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
              if (!perm || !perm.granted) {
                  Alert.alert("Permission Error", "Media Library write access is required.");
                  return;
              }

              try {
                  await MediaLibrary.deleteAssetsAsync(selectedAssets);
                  Alert.alert("Success", `${selectedAssets.length} photo(s) deleted.`);
                  
                  setAssets(prevAssets => 
                      prevAssets.filter(asset => !selectedAssets.includes(asset.id))
                  );
                  setSelectedAssets([]);
                  setSelectionMode(false);

              } catch (error) {
                  console.error("Failed to delete assets: ", error);
                  Alert.alert("Error", "Could not complete bulk deletion.");
              }
          }
      }
      ]
    );
  }, [selectedAssets, perm]); // Depend on selectedAssets and perm


  // ✅ FIX: Use navigation.setOptions in useEffect to update the header
  // This accesses state directly and avoids the non-serializable warning.
  useEffect(() => {
      // Define the options object dynamically here
      const dynamicOptions = {
          headerTitle: 'Gallery', 
          
          // Header LEFT: Delete/Cancel Button (Uses bulkDelete and selectedAssets directly)
          headerLeft: () => {
              if (selectionMode) {
                  return (
                      <TouchableOpacity onPress={bulkDelete} style={{ marginLeft: 10 }}>
                          <Text style={{ 
                              color: 'red', 
                              fontWeight: 'bold' 
                          }}>
                              Delete ({selectedAssets.length})
                          </Text>
                      </TouchableOpacity>
                  );
              }
              return null;
          },
          
          // Header RIGHT: Select/Done Button (Uses toggleSelectionMode directly)
          headerRight: () => (
              <TouchableOpacity onPress={() => toggleSelectionMode(!selectionMode)} style={{ marginRight: 10 }}>
                  <Text style={{ color: 'blue', fontWeight: 'bold' }}>
                      {selectionMode ? 'Done' : 'Select'}
                  </Text>
              </TouchableOpacity>
          ),
      };
      
      // Apply the options to the header
      navigation.setOptions(dynamicOptions);

  // Dependencies ensure the header updates whenever selection state changes.
  }, [navigation, bulkDelete, toggleSelectionMode, selectionMode, selectedAssets.length]); 

  // --- Load Page Logic ---
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
  
  if (!perm || !perm.granted) {
    // ... (Permission UI)
  }
  if (albumId === null) {
    // ... (Empty State UI)
  }

  const size = Dimensions.get("window").width / 3;

return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
        <FlatList
            data={assets}
            keyExtractor={(a) => a.id}
            numColumns={3}
            renderItem={({ item }) => {
                const isSelected = selectedAssets.includes(item.id);

          return (
              <TouchableOpacity 
                  onPress={() => selectionMode ? toggleAssetSelection(item.id) : 
                      router.push({ pathname: "/photo/[id]", params: { id: item.id } })
                  }
              >
                  <Image 
                      source={{ uri: item.uri }} 
                      style={{ 
                          width: size, 
                          height: size,
                          opacity: isSelected ? 0.6 : 1, // Dim selected image
                      }} 
                      resizeMode="cover" 
                  />
                  {isSelected && (
                      <View style={styles.selectionOverlay}>
                          <Text style={styles.checkMark}>✓</Text>
                      </View>
                  )}
              </TouchableOpacity>
                );
            }}
            onEndReachedThreshold={0.2}
            onEndReached={() => hasNextPage && loadPage()}
            ListFooterComponent={loading ? <ActivityIndicator style={{ padding: 16 }} /> : null}
            />
        </View>
    );
}

// ❌ DELETE: Remove the static options block completely
/*
GalleryScreen.options = ({ route } : {route : any}) => {
    // ...
};
*/

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 16 },
  primary: { backgroundColor: "black", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  primaryText: { color: "white", fontWeight: "600" },
  selectionOverlay: {position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'white',},

    checkMark: {
    color: 'white',
    fontSize: 14,
    lineHeight: 18,
  }
});