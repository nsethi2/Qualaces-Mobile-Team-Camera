import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View, Text, Pressable, Image } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Home() {
    // ask for camera permission when the app first loads
    const [permission, requestPermission] = useCameraPermissions();

    // reference to the camera so we can call takePictureAsync
    const cameraRef = useRef<CameraView | null>(null);

    // stores the photo that was just taken
    const [photoUri, setPhotoUri] = useState<string | null>(null);

    // keeps track of which camera lens is being used
    const [facing, setFacing] = useState<"front" | "back">(Platform.OS === "web" ? "front" : "front");

    // automatically ask for permission if it hasn’t been granted yet
    useEffect(() => { if (!permission) requestPermission(); }, [permission]);

    // show a loading screen while checking permissions
    if (!permission) return <View style={styles.center}><Text>Checking camera permission…</Text></View>;

    // if permission is denied, show a button to allow it
    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.msg}>We need your permission to use the camera.</Text>
                <Pressable style={styles.btn} onPress={requestPermission}>
                    <Text style={styles.btnText}>Grant Permission</Text>
                </Pressable>
            </View>
        );
    }

    // function to take a photo and save it in state
    const takePhoto = async () => {
        if (!cameraRef.current) return;
        const opts: any = { mirrorImage: false, quality: 1 };
        if (Platform.OS === "android") opts.skipProcessing = true; // helps Android emulator
        const p = await (cameraRef.current as any).takePictureAsync(opts);
        setPhotoUri(p?.uri ?? null);
    };

    // flag to check if we are running on the web
    const isWeb = Platform.OS === "web";

    return (
        <View style={styles.container}>
            {/* if there is no photo yet, show the camera */}
            {!photoUri ? (
                <>
                    {/* live camera preview */}
                    <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

                    {/* control buttons */}
                    <View style={styles.controls}>
                        {isWeb ? (
                            // Web: shows only the capture button
                            <Pressable onPress={takePhoto} style={styles.captureWeb}>
                                <MaterialCommunityIcons name="camera" size={20} color="#fff" />
                                <Text style={styles.captureWebText}>Capture</Text>
                            </Pressable>
                        ) : (
                            // iOS and Android: show flip and capture buttons
                            <View style={styles.row}>
                                {/* flip between front and back camera */}
                                <Pressable
                                    onPress={() => setFacing(facing === "back" ? "front" : "back")}
                                    style={styles.iconBtn}
                                >
                                    <MaterialCommunityIcons name="camera-switch" size={22} color="#0b66ff" />
                                </Pressable>

                                {/* capture button (big white circle) */}
                                <Pressable onPress={takePhoto} style={styles.captureNative}>
                                    <View style={styles.ring}><View style={styles.dot} /></View>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </>
            ) : (
                // if a photo has been taken, show the preview
                <View style={styles.previewWrap}>
                    <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="contain" />
                    <Pressable onPress={() => setPhotoUri(null)} style={styles.btn}>
                        <Text style={styles.btnText}>Retake</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    // general container and camera setup
    container: {
        flex: 1,
        backgroundColor: "#000"
    },
    camera: {
        flex: 1
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24
    },
    msg: {
        color: "#fff",
        textAlign: "center"
    },

    // buttons for the web version
    // this is the blue capture button that shows on web
    captureWeb: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: "#0b66ff"
    },
    captureWebText: {
        color: "#fff",
        fontWeight: "700"
    },

    // controls for iOS and Android
    // includes both the flip and capture buttons
    controls: {
        position: "absolute",
        bottom: 28,
        left: 0,
        right: 0,
        alignItems: "center"
    },
    row: {
        flexDirection: "row",
        gap: 18,
        alignItems: "center",
        justifyContent: "center"
    },
    iconBtn: {
        height: 48,
        width: 48,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.9)",
        alignItems: "center",
        justifyContent: "center"
    },
    captureNative: {
        height: 84,
        width: 84,
        alignItems: "center",
        justifyContent: "center"
    },
    ring: {
        height: 84,
        width: 84,
        borderRadius: 42,
        borderWidth: 3,
        borderColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    },
    dot: {
        height: 56,
        width: 56,
        borderRadius: 28,
        backgroundColor: "#fff"
    },

    // shared button style used for Retake and permission requests
    btn: {
        marginTop: 14,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: "#0b66ff"
    },
    btnText: {
        color: "#fff",
        fontWeight: "700"
    },

    // preview screen after a photo is captured
    previewWrap: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#000"
    },
    preview: {
        width: "92%",
        height: "70%",
        borderRadius: 12
    }
});
