// app/preview.tsx

import React from 'react';
import * as Print from 'expo-print';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

export default function PreviewScreen() {
    // Get the recognized text passed from the Camera/OCR screen
    const { recognizedText } = useLocalSearchParams(); 
    
    // Ensure the text is a string
    const textToDisplay = Array.isArray(recognizedText) 
        ? recognizedText[0] || "No text found." 
        : recognizedText || "No text found.";

    // --- Action Handlers ---

    const handleSave = () => {
        // Implement logic to save the text to a file or database here
        Alert.alert("Saved!", "Text saved to device.");
        router.back(); // Go back to the camera or gallery
    };

    const handlePrint = async () => { // Make function async
        try {
            // 1. Convert plain text into basic printable HTML
            const htmlContent = `
                <html>
                    <body style="padding: 20px; font-family: sans-serif;">
                        <h1>OCR Text Result</h1>
                        <hr/>
                        <pre style="white-space: pre-wrap; word-wrap: break-word;">${textToDisplay}</pre>
                    </body>
                </html>
            `;
            
            // 2. Call the Print API
            await Print.printAsync({
                html: htmlContent,
            });

            // Optional: Show success if printing dialog was completed/dismissed
            // Alert.alert("Print Initiated", "Check your device's print queue.");
            
        } catch (error) {
            console.error("Printing failed:", error);
            Alert.alert("Error", "Could not initiate printing.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Text Preview</Text>
            </View>
            
            <ScrollView style={styles.textContainer}>
                <Text style={styles.previewText}>{textToDisplay}</Text>
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleSave} style={[styles.button, styles.saveButton]}>
                    <Text style={styles.buttonText}>Save to Phone</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={handlePrint} style={[styles.button, styles.printButton]}>
                    <Text style={styles.buttonText}>Print</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// --- Static Options for Header ---
PreviewScreen.options = {
    headerTitle: 'Preview',
    // You might want to remove the back button or customize it
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    title: { fontSize: 20, fontWeight: 'bold' },
    textContainer: { flex: 1, padding: 15 },
    previewText: { fontSize: 16, lineHeight: 24, color: '#333' },
    buttonContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        padding: 15, 
        borderTopWidth: 1, 
        borderTopColor: '#eee' 
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        width: '45%',
        alignItems: 'center',
    },
    saveButton: { backgroundColor: 'blue' },
    printButton: { backgroundColor: 'green' },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});