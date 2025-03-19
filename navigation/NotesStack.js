import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NotesList from '../components/NotesList';

const Stack = createNativeStackNavigator();

export default function NotesStack() {
  return (
    <Stack.Navigator initialRouteName="notesList">
      <Stack.Screen name="notesList" component={NotesList} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}