import { View, Text, TextInput, StyleSheet, Modal, Button } from 'react-native';
import { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, addDoc, GeoPoint } from 'firebase/firestore';
import * as Location from 'expo-location';


import { db } from '../firebaseConfig';

const firestoreName = 'notes';

export default function MapScreen({ route }) {
    const { locationGeoPoint } = route.params || {};
    const [region, setRegion] = useState({
        latitude: 55.7,
        longitude: 12.6,
        latitudeDelta: 0.4,
        longitudeDelta: 0.4,
    });

    useEffect(() => {
        if (locationGeoPoint) {
            setRegion({
                latitude: locationGeoPoint.latitude,
                longitude: locationGeoPoint.longitude,
                latitudeDelta: 0.4,
                longitudeDelta: 0.4,
            });
        }
    }, [locationGeoPoint]);

    const [modalVisible, setModalVisible] = useState(false);
    const [inputText, setInputText] = useState("");
    const [inputLatitude, setInputLatitude] = useState(null);
    const [inputLongitude, setInputLongitude] = useState(null);
    const [notes, loading, error] = useCollection(collection(db, firestoreName));

    

    const handleLongPress = async (event) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setInputLatitude(latitude);
        setInputLongitude(longitude);
        setModalVisible(true);
    };

    const handleSaveNote = () => {
        addNote();
        setModalVisible(false);
        setInputText("");
      };

    async function addNote() {
        const noteData = {};

        const locationGeoPoint = new GeoPoint(inputLatitude, inputLongitude);
        const address = await getAddress(locationGeoPoint);

        noteData.text= inputText
        noteData.locationGeoPoint = locationGeoPoint;
        noteData.address = address;

        try {
            await addDoc(collection(db, 'notes'), noteData);
        } catch (error) {
            console.error('Error adding note: ', error);
        }
    }

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
            <MapView
                style={{ flex: 1, width: '100%', height: '100%' }}
                region={region}
                onLongPress={handleLongPress}
                key={notes?.docs.length}  // This forces a re-render when the number of docs changes
            >

                {notes?.docs?.map((doc) => {
                    const data = doc.data();
                    const geoPoint = data.locationGeoPoint;

                    if (!geoPoint) {
                        return null; // Skip notes without location
                    }

                    return (
                        <Marker
                            key={doc.id}
                            coordinate={{
                                latitude: geoPoint.latitude,
                                longitude: geoPoint.longitude
                            }}
                            title={data.text}
                        />
                    );
                })}
            </MapView>
            <Modal visible={modalVisible} animationType="slide">
                <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
                    <TextInput
                        placeholder="Enter note text"
                        value={inputText}
                        onChangeText={setInputText}
                        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
                    />
                    <Button title="Save Note" onPress={handleSaveNote} />
                    <Button title="Cancel" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>
        </View>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});