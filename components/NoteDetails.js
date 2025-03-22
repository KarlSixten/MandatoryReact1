import { View, StyleSheet, Text } from "react-native";


export default function NoteDetails({ route }) {
    const { noteData } = route.params || {};

    return (
        <View style={styles.container}>
            <Text style={styles.noteText}>{noteData?.text || "No content available"}</Text>

            {noteData?.address && (
                <View style={styles.addressContainer}>
                    <Text style={styles.addressTitle}>Location:</Text>
                    <Text style={styles.addressText}>{noteData.address.street}, {noteData.address.city}</Text>
                </View>
            )}
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
});