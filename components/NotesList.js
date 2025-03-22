import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Pressable, FlatList } from 'react-native';
import * as Location from 'expo-location';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, addDoc, GeoPoint } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const firestoreName = 'notes';

export default function NotesList({ navigation }) {
  const [notes, loading, error] = useCollection(collection(db, firestoreName));
  const [inputText, setInputText] = useState("");

  async function addNote(inputText) {
    if (inputText.trim() === "") return;
    const noteData = { text: inputText };

    const location = await getLocation();
    if (location) {
      const geoPoint = new GeoPoint(location.coords.latitude, location.coords.longitude);
      const address = await getAddress(geoPoint);

      noteData.locationGeoPoint = geoPoint;
      noteData.address = address;
    }

    try {
      await addDoc(collection(db, firestoreName), noteData);
      setInputText("");
    } catch (error) {
      console.log("Error adding note: ", error);
    }
  }

  async function getLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return null;
    }
    return await Location.getCurrentPositionAsync({});
  };

  async function getAddress(geoPoint) {
    try {
      const addressData = await Location.reverseGeocodeAsync({ latitude: geoPoint.latitude, longitude: geoPoint.longitude });
      if (addressData && addressData.length > 0) {
        return { city: addressData[0].city, street: addressData[0].street };
      }
    } catch (error) {
      console.log('Failed to get address', error);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput style={styles.textInput} onChangeText={setInputText} value={inputText} placeholder="Enter your note" />
      <Pressable style={styles.saveButton} onPress={() => addNote(inputText)}>
        <Text style={styles.saveButtonText}>Save</Text>
      </Pressable>
      <FlatList
        data={notes?.docs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate("NoteDetails", { noteId: item.id, noteData: item.data()})}>
            <View style={styles.noteItem}>
              <Text style={styles.noteText}>{item.data().text}</Text>
              {item.data().address && (
                <Text style={styles.locationText}>{item.data().address.city}, {item.data().address.street}</Text>
              )}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 50 },
  textInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10 },
  saveButton: { backgroundColor: 'blue', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  noteItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  noteText: { fontSize: 20 },
});