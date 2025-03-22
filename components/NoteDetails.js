import { View, StyleSheet, Text, Pressable, Alert, Image } from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from '../firebaseConfig';




export default function NoteDetails({ route, navigation }) {
    const { noteId, noteData } = route.params || {};
    const [imageUri, setImageUri] = useState(noteData?.imageUri || null);

    const chooseImageSource = () => {
        Alert.alert(
            "Select Image Source",
            "Where would you like to pick your image from?",
            [
                { text: "Camera", onPress: () => pickImage("camera") },
                { text: "Gallery", onPress: () => pickImage("gallery") },
                { text: "Cancel", style: "cancel" },
            ]
        );
    };

    const pickImage = async (source) => {
        let result;

        if (source === "camera") {
            result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
        } else {
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
        }

        if (!result.canceled) {
            const localUri = result.assets[0].uri;
            await uploadImage(localUri);
        }
    };

    // Function to upload image to Firebase Storage
    const uploadImage = async (uri) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();

            const imageRef = ref(storage, noteId); // Unique filename
            await uploadBytes(imageRef, blob);

            // Get download URL
            const downloadUrl = await getDownloadURL(imageRef);

            // Save download URL to Firestore
            const noteRef = doc(db, "notes", noteId);
            await updateDoc(noteRef, { imageUrl: downloadUrl });

            // Refetch the note data from Firestore
            const noteSnapshot = await getDoc(noteRef);
            const updatedNoteData = noteSnapshot.data();

            // Update the note data in the route parameters
            navigation.setParams({ noteData: updatedNoteData });

            console.log("Image URI updated: ", downloadUrl);
        } catch (error) {
            Alert.alert("Upload Failed", "Could not upload the image.");
            console.log(error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.noteText}>{noteData?.text || "No content available"}</Text>

            {noteData?.address && (
                <View style={styles.addressContainer}>
                    <Text style={styles.addressTitle}>Location:</Text>
                    <Text style={styles.addressText}>{noteData.address.street}, {noteData.address.city}</Text>
                </View>
            )}

            {noteData.imageUrl ? (
                <Image style={styles.image} src={noteData.imageUrl} />
            ) : (
                <Text style={styles.noImageText}>No image uploaded</Text>
            )}

            <Pressable style={styles.button} onPress={chooseImageSource}>
                <Text style={styles.buttonText}>{noteData.imageUrl ? "Change Image" : "Add Image"}</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f8f8",
        padding: 20,
    },
    noteText: {
        fontSize: 18,
        backgroundColor: "white",
        padding: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
    },
    addressContainer: {
        marginTop: 10,
        padding: 15,
        backgroundColor: "#e0f7fa",
        borderRadius: 10,
    },
    addressTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    addressText: {
        fontSize: 16,
    },
    button: {
        backgroundColor: "#007AFF",
        padding: 10,
        borderRadius: 10,
        marginTop: 20,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#ddd",
        marginTop: 20,
        alignSelf: "center",
    },
    noImageText: {
        fontSize: 18,
        color: "#888",
        textAlign: "center",
        marginTop: 20,
        fontStyle: "italic"
    }
});