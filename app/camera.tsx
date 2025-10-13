import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from "expo-media-library";
import { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { router } from "expo-router"

const APP_ALBUM = "React Camera App"

export default function App() {

  const cameraRef = useRef<CameraView>(null);

  //Camera permission hook
  const [camPerm, requestPermission] = useCameraPermissions();

  const [libPerm, requestLibPerm] = MediaLibrary.usePermissions();

  const [facing, setFacing] = useState<CameraType>("back");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
    if(camPerm && !camPerm.granted && camPerm.canAskAgain){
        await requestPermission();
    }
    if(libPerm && !libPerm.granted && libPerm.canAskAgain){
        await requestLibPerm();
    }
    })();
  }, [camPerm,libPerm]);

  if(!camPerm || !libPerm) return null;

  if(!camPerm.granted) {
    return (
        <Centered>
            <Text>We need your permission to use the camera.</Text>
            <Primary onPress={requestPermission} label = "Grant Camera Permission" />
        </Centered>
    );
  }

const takeAndSave = async () => {
  try {
    setBusy(true);

    // Ensure Photos permission before capture
    if (!libPerm.granted) {
      const res = await requestLibPerm();
      if (!res.granted) {
        Alert.alert("Permission needed", "Enable Photos access to save pictures.");
        return;
      }
    }

    const photo = await cameraRef.current?.takePictureAsync({ quality: 1, skipProcessing: false });
    if (!photo?.uri) return;

    // 1) Create an asset for the file
    const asset = await MediaLibrary.createAssetAsync(photo.uri);

    // 2) Find or create the album, then add the asset there
    let album = await MediaLibrary.getAlbumAsync(APP_ALBUM);
    if (!album) {
      album = await MediaLibrary.createAlbumAsync(APP_ALBUM, asset, false);
    } else {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    }

    Alert.alert("Saved", `Photo saved to album: ${APP_ALBUM}`);
  } catch (e) {
    console.error(e);
    Alert.alert("Error", "Could not capture or save photo.");
  } finally {
    setBusy(false);
  }
};
  return (
    <View style = {{flex: 1}}>
        <CameraView ref={cameraRef} style={{flex: 1}} facing={facing} />
        <View style={styles.buttonContainer}>
            <Pill onPress={() => setFacing((p) => (p === "back" ? "front" : "back"))} label="Flip" />
            <TouchableOpacity onPress={() => router.push("/gallery")}>
              <Text style = {{ color: "white"}}>Gallery</Text>
            </TouchableOpacity>
            <Shutter onPress = {busy ? undefined : takeAndSave} disabled={busy}></Shutter>
        </View>
    </View>
  )

function Pill({onPress, label}: {onPress: () => void; label: string}){
    return (
        <TouchableOpacity onPress={onPress} style={styles.pill}>
            <Text style={styles.pillText}>{label}</Text>
        </TouchableOpacity>
    )
}

function Shutter({onPress, disabled}: { onPress?: () => void; disabled?: boolean}){
    return(
        <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.shutter, disabled && {opacity: 0.5}]} />
    )
}

function Centered({children}: {children: React.ReactNode}){
    return (<View style={styles.center}>{children}</View>);
}
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
}}

  const styles = StyleSheet.create({
    center: {
        flex: 1, alignItems: "center", justifyContent: "center", gap: 12
    },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    paddingHorizontal: 64,
  },
  button: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  pill: {
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 10, 
    backgroundColor: "black", 
    opacity: 0.6
  },
  pillText: { color: "white", fontWeight: "600" },
  controls: {
    position: "absolute", 
    bottom: 40, 
    left: 0, 
    right: 0,
    flexDirection: "row", justifyContent: "space-evenly", alignItems: "center"
  },
  shutter: { width: 70, height: 70, borderRadius: 35, backgroundColor: "white", borderWidth: 4, borderColor: "black" }
});