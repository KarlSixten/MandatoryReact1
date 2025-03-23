import { View, Text, TextInput, StyleSheet, Modal, Button, Image, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import MapView, { Callout, Marker } from 'react-native-maps';
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

        noteData.text = inputText
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
                        >
                            <Callout tooltip>
                                <View style={styles.calloutContainer}>
                                    <Text style={styles.calloutTitle}>{data.text.length > 25 ? data.text.slice(0, 25) + "..." : data.text}</Text>
                                    {data.imageUrl && (
                                        <Image
                                            source={{ uri: data.imageUrl }}
                                            style={styles.calloutImage}
                                        />
                                    )}
                                </View>
                            </Callout>
                        </Marker>
                    );
                })}
            </MapView>
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Add Note</Text>
                        <TextInput
                            placeholder="Enter note text"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            style={styles.textInput}
                        />
                        <View style={styles.buttonContainer}>
                            <Pressable style={styles.saveButton} onPress={handleSaveNote}>
                                <Text style={styles.buttonText}>Save Note</Text>
                            </Pressable>
                            <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    calloutContainer: {
        backgroundColor: 'white',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 12,
        width: 160,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 5,
        textAlign: 'center',
    },
    calloutImage: {
        width: 120,
        height: 120,
        borderRadius: 10,
        marginBottom: 5,
        resizeMode: 'cover',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "85%",
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    textInput: {
        width: "100%",
        height: 100,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        textAlignVertical: "top",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 20,
        paddingHorizontal: 15,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 5,
        alignItems: "center",
        marginHorizontal: 5,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: 'bold',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        borderRadius: 5,
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#D32F2F',
        paddingVertical: 12,
        borderRadius: 5,
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
});