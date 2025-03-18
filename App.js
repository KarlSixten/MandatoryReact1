import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';

import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Pressable, FlatList } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useCollection } from 'react-firebase-hooks/firestore'
import { collection, addDoc, GeoPoint } from 'firebase/firestore';
import { db } from './firebaseConfig.js';

const Stack = createNativeStackNavigator();

const firestoreName = 'notes';

export default function App() {
  const [notes, loading, error] = useCollection(collection(db, firestoreName));
  const [inputText, setInputText] = useState("");

  async function addNote(inputText) {
    const noteData = { text: inputText };

    const location = await getLocation();
    if (location) {
      const geoPoint = new GeoPoint(location.coords.latitude, location.coords.longitude);
      const address = await getAddress(geoPoint);

      noteData.locationGeoPoint = geoPoint;
      noteData.address = address;
    }

    try {
      console.log(noteData)
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

    const location = await Location.getCurrentPositionAsync({});

    return location;
  };

  async function getAddress(geoPoint) {
    try {
      const addressFromGeoPoint = await Location.reverseGeocodeAsync({ latitude: geoPoint.latitude, longitude: geoPoint.longitude });

      if (addressFromGeoPoint && addressFromGeoPoint.length > 0) {
        const { city, street } = addressFromGeoPoint[0];
        const address = { city, street };
        return address;
      } else {
        console.log('No address found for the given coordinates');
        return undefined;
      }
    } catch (error) {
      console.log('Failed to get address', error)
    }
  }



  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        onChangeText={setInputText}
        value={inputText}
        placeholder="Enter your note"
      />

      <Pressable style={styles.saveButton} onPress={() => addNote(inputText)}>
        <Text style={styles.saveButtonText}>Save</Text>
      </Pressable>

      <FlatList
        data={notes?.docs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.noteItem}>
            <Text style={styles.noteText}>{item.data().text}</Text>
            {item.data().address && (
              <Text style={styles.locationText}>
                {item.data().address.city}, {item.data().address.street}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: 'blue',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    fontSize: 16,
  },
  noteText: {
    fontSize: 20
  }
});
