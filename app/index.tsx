import { Link } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camera Demo</Text>
      <Link href="/camera" asChild>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Open Camera</Text>
      </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        marginBottom: 30,
    },
    button:{
        backgroundColor: "#007AFF",
        paddingVertical: 14,
        paddingHorizontal: 28, 
        borderRadius: 10,
    },
    buttonText: {
        color:"white", 
        fontWeight: "600",
        fontSize: 16,
    }
});