import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider } from './contexts/AuthContext';
import { COLORS } from './utils/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';

import VerifyPhone from './components/VerifyPhone';
import SendTexts from './components/SendTexts';
import Username from './components/Username';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Onboarding from './components/Onboarding';
import ContactsPage from './components/ContactsPage';
import CalendarSync from './components/CalendarSync';
import People from './components/People';
import Chat from './components/Chat';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ animationEnabled: false, headerShown: false, gestureEnabled: 'false'}}>
          <Stack.Screen name="LandingTab" component={LandingTab} />
          <Stack.Screen name="ContactsPage" component={ContactsPage} />
          <Stack.Screen name="SignUp" component={SignUp}/>
          <Stack.Screen name="Onboarding" component={Onboarding} />
          <Stack.Screen name="CalendarSync" component={CalendarSync} />
          <Stack.Screen name="SignIn" component={SignIn}/>
          <Stack.Screen name="Username" component={Username} />
          <Stack.Screen name="VerifyPhone" component={VerifyPhone} />
          <Stack.Screen name="SendTexts" component={SendTexts} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

function LandingTab() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color }) => {
        let iconName;

        if (route.name === 'People') {
          iconName = 'people';
        } 
        else if (route.name === 'Chat') {
          iconName = 'chatbubbles';
        }
        else if (route.name === 'Profile') {
          iconName = 'person';
        }

        // You can return any component that you like here!
        return <Ionicons name={iconName} size={30} color={color}/>;
      },
      // tabBarActiveTintColor: COLORS.blue,
      // tabBarInactiveTintColor: COLORS.random,
      // tabBarStyle: {
      //   backgroundColor: COLORS.grey,
      //   paddingBottom: 0,
      // },
      // tabBarShowLabel: true,
      })}
    >
      <Tab.Screen 
        name="People" 
        component={People}
      />
      <Tab.Screen 
        name="Chat" 
        component={Chat}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileNav} 
      />
    </Tab.Navigator>
  )
}

function ProfileNav() {
  return (
    <Stack.Navigator screenOptions={{ animationEnabled: false }}>
      <Stack.Screen name="ProfileMain" component={Profile} options={{ headerShown: false }}/>
      <Stack.Screen name="EditProfile" component={EditProfile} 
        options={{
          headerTitle: props => <Text>Edit Profile</Text>,
        }}
      />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
