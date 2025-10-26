import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const FS = require('expo-file-system');

export default function PreviewScreen(){
    const { ocrText } = useLocalSearchParams();

    const [editableText, setEditableText] = useState(ocrText as string || ``);

    const saveAsTxt = async () => {
        try {
            const fileName = `ocr_edit_${Date.now()}.txt`;
            // Using the stable cache directory
            const fileUri = FS.cacheDirectory + fileName;

            await FS.writeAsStringAsync(fileUri, editableText, {
                encoding: FS.EncodingType.UTF8,
            });
            
            Alert.alert("Saved!", `Text saved to: ${fileName}`);
        } catch (error) {
            console.error("Failed to save TXT:", error);
            Alert.alert("Error", "Could not save text file.");
        }
    };

    const shareAsPdf = async () => {
        try {
            const htmlContent = `
                <html>
                    <body style="padding: 20px; font-family: sans-serif;">
                        <h1>Edited OCR Result</h1>
                        <hr/>
                        <pre style="white-space: pre-wrap; word-wrap: break-word;">${editableText}</pre>
                    </body>
                </html>
            `;
            
            const pdfFile = await Print.printToFileAsync({ html: htmlContent });
            
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(pdfFile.uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Share Edited OCR PDF',
                });
            } else {
                Alert.alert("Error", "Sharing not available.");
            }
        } catch (error) {
            console.error("Failed to share PDF:", error);
            Alert.alert("Error", "Could not generate or share PDF.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Edit and Confirm Text</Text>
            <TextInput
                style={styles.textInput}
                multiline
                value={editableText}
                onChangeText={setEditableText}
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={saveAsTxt}>
                    <Text style={styles.buttonText}>Save as TXT</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={shareAsPdf}>
                    <Text style={styles.buttonText}>Print/Share PDF</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    header: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        textAlignVertical: 'top',
        fontSize: 16,
        marginBottom: 20,
    },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around' },
    button: {
        backgroundColor: 'black',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: { color: 'white', fontWeight: '600' },
});