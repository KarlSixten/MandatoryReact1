import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NotesList from '../components/NotesList';
import NoteDetails from '../components/NoteDetails';

const Stack = createNativeStackNavigator();

export default function NotesStack() {
  return (
    <Stack.Navigator initialRouteName="NotesList">
      <Stack.Screen name="NotesList" component={NotesList} options={{ title: ' Notes List', headerShown: false }} />
      <Stack.Screen name="NoteDetails" component={NoteDetails} options={{ title: 'Note Details' }} />
    </Stack.Navigator>
  );
}