import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from './contexts/AuthContext';
import { COLORS } from './utils/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

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
import NewFriends from './components/NewFriends';
import OldFriends from './components/OldFriends';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const matTab = createMaterialTopTabNavigator();

export default function PretendApp() {

  const { currentUser, isNew } = useAuth();

  // User is not signed in
  if (currentUser === null) {
    return (
      <SignInStack/>
    );
  }

  // User just signed up, do onboarding
  if (!!currentUser && isNew) {
    return (
      <OnboardingStack/>
    );
  }

  // User is signed in. I know it's bad logic I just want to see the things you know
  if (!!currentUser && !isNew) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ animationEnabled: false, headerShown: false, gestureEnabled: 'false'}}>
          <Stack.Screen name="LandingTab" component={LandingTab} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // This shouldn't ever happen, show error screen
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>There was an error. Try reloading the app</Text>
    </View>
  );
}

// Sign in and sign up screens
function SignInStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ animationEnabled: false, headerShown: false, gestureEnabled: 'false'}}>
        <Stack.Screen name="SignIn" component={SignIn}/>
        <Stack.Screen name="SignUp" component={SignUp}/>
        {/* <Stack.Screen name="VerifyPhone" component={VerifyPhone} /> */}
        {/* <Stack.Screen name="SendTexts" component={SendTexts} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Onboarding flow for users who just signed up
function OnboardingStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ animationEnabled: false, headerShown: false, gestureEnabled: 'false'}}>
        <Stack.Screen name="Username" component={Username} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="ContactsPage" component={ContactsPage} />
        <Stack.Screen name="CalendarSync" component={CalendarSync} />
      </Stack.Navigator>
    </NavigationContainer>
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
        component={PeopleNav}
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

function PeopleNav() {
  return (
    <Stack.Navigator screenOptions={{ animationEnabled: false }}>
      <Stack.Screen name="PeopleMain" component={People} options={{ headerShown: false }}/>
      <Stack.Screen name="FriendsTab" component={FriendsTab} 
        options={{
          headerTitle: props => <Text style={{fontWeight: 'bold', fontSize: 20}}>Friends</Text>,
        }}
      />
    </Stack.Navigator>
  )
}

function FriendsTab() {
  return (
    <matTab.Navigator screenOptions={({ route }) => ({
      tabBarLabelStyle: { fontSize: 20, textTransform: 'none' },
      tabBarLabel: () => {
        if (route.name === 'NewFriends') {
          return <Text style={{fontWeight: 'bold'}}>Add Friends</Text>;
        } 
        return <Text style={{fontWeight: 'bold'}}>My Friends</Text>;
      },
    })}
    >
      <matTab.Screen name="NewFriends" component={NewFriends}/>
      <matTab.Screen name="OldFriends" component={OldFriends}/>
    </matTab.Navigator>
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