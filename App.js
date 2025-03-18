import { StatusBar } from 'expo-status-bar';

import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useCollection } from 'react-firebase-hooks/firestore'
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig.js';

const Stack = createNativeStackNavigator();

const firestoreName = 'notes';

export default function App() {
  const [values, loading, error] = useCollection(collection(db, firestoreName));
  const [inputText, setInputText] = useState("");

  async function addNote(inputText) {
    try {
      await addDoc(collection(db, firestoreName), {
        text: inputText
      });
      setInputText("");
    } catch (error){
      console.log("Error adding note: ", error);
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
    </View>
)}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
