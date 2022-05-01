import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './contexts/AuthContext';
import VerifyPhone from './components/VerifyPhone';
import SendTexts from './components/SendTexts';
import Username from './components/Username';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Onboarding from './components/Onboarding';
import ContactsPage from './components/ContactsPage';
import CalendarSync from './components/CalendarSync';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ animationEnabled: false, headerShown: false, gestureEnabled: 'false'}}>
          <Stack.Screen name="Onboarding" component={Onboarding} />
          <Stack.Screen name="ContactsPage" component={ContactsPage} />
          <Stack.Screen name="CalendarSync" component={CalendarSync} />
          <Stack.Screen name="SignUp" component={SignUp}/>
          <Stack.Screen name="SignIn" component={SignIn}/>
          <Stack.Screen name="Username" component={Username} />
          <Stack.Screen name="VerifyPhone" component={VerifyPhone} />
          <Stack.Screen name="SendTexts" component={SendTexts} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
