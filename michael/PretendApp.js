import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from './contexts/AuthContext';
import { COLORS } from './utils/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React, { 
  useEffect,
  useRef,
  useState
} from 'react';
import { registerForPushNotificationsAsync } from './utils/expo';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

import VerifyPhone from './components/VerifyPhone';
import SendTexts from './components/SendTexts';
import Username from './components/Username';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Onboarding from './components/Onboarding';
//import ContactsPage from './components/ContactsPage';
import CalendarSync from './components/CalendarSync';
import People from './components/People';
import Chat from './components/Chat';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import NewFriends from './components/NewFriends';
import OldFriends from './components/OldFriends';
import AddProfilePic from './components/AddProfilePic';
import SignUpWithPhone from './components/SignUpWithPhone';
import AllUsers from './components/AllUsers';
import CreateGroup from './components/CreateGroup';
import ChatDetails from './components/ChatDetails';
import EditName from './components/EditName';
import CalendarSyncBackup from './components/CalendarSyncBackup';
import ContactsPageNew from './components/ContactsPageNew';
import GroupAvailability from './components/GroupAvailability';
import AddCalendar from './components/AddCalendar';
import Welcome from './components/Welcome';
import { addUserPushToken } from './utils/firebase';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const matTab = createMaterialTopTabNavigator();


export default function PretendApp() {

  const { currentUser, setCurrentUser, isNew, setIsNew, userFirebaseDetails, setUserFirebaseDetails } = useAuth();

  const notificationListener = useRef();
  const responseListener = useRef();

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(async () => {
    // If user doesn't have a push notification token, make one.
    // This messes up if we move to a different device. Maybe store a list?
    if (!userFirebaseDetails) {
      return;
    }

    if (userFirebaseDetails.uid && !userFirebaseDetails.pushToken) {
      if (!Device.isDevice) {
        return
      }
      let token = await registerForPushNotificationsAsync();
      setUserFirebaseDetails({...userFirebaseDetails, pushToken: token})
      await addUserPushToken(userFirebaseDetails.uid, token);
    }

  }, [userFirebaseDetails])

  // Another use effect to actually listen for notifications
  useEffect(() => {

    // So it doesn't show notif when app is running
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // I don't know if we want to actually do anything with this?
      console.log(notification)
    });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Check async storage to see if user is signed in
  useEffect(async () => {
    // Need some kind of loading state...
    try {
      const value = await AsyncStorage.getItem('currentUser')
      if(value !== null) {
        setCurrentUser(JSON.parse(value));
        setIsNew(false)
      }
      setLoading(false);
    } catch(e) {
      // error reading value
      setLoading(false);
      setError(true);
    }
  }, [])

  // If we're loading, just display the splash screen
  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Image source={require('./assets/dindinsplash.png')} style={{width: '100%', height: '100%'}}/>
      </View>
    )
  }

  if (error) {
    // TODO: Make this error screen prettier
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>There was an error. Try reloading the app</Text>
      </View>
    );
  }

  // User is not signed in
  if (currentUser === null || isNew === null) {
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
        {/* Can I delete these sceenoptions in the outer thing? */}
        <Stack.Navigator screenOptions={{ animationEnabled: false, headerShown: false, gestureEnabled: 'false'}}>
          <Stack.Group screenOptions={{ presentation: 'modal', gestureEnabled: 'true' }}>
            <Stack.Screen name="LandingTab" component={LandingTab} />
            <Stack.Screen name="CreateGroup" component={CreateGroup} />
          </Stack.Group>
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
        <Stack.Screen name="Welcome" component={Welcome}/> 
        <Stack.Screen name="SignUpWithPhone" component={SignUpWithPhone}/>
        <Stack.Screen name="SignIn" component={SignIn}/>
        <Stack.Screen name="SignUp" component={SignUp}/> 
        <Stack.Screen name="VerifyPhone" component={VerifyPhone} />
        {/* <Stack.Screen name="CalendarSync" component={CalendarSync} /> */}
        <Stack.Screen name="SendTexts" component={SendTexts} />
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
        <Stack.Screen name="AddProfilePic" component={AddProfilePic} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="ContactsPage" component={ContactsPageNew} />
        {/* <Stack.Screen name="CalendarSyncBackup" component={CalendarSyncBackup} /> */}
        <Stack.Screen name="AddCalendar" component={AddCalendar} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function LandingTab() {

  return (
    <>
      <CalendarSync /> 
      {/* <AddCalendar />  */}
      <Tab.Navigator screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color }) => {
          let iconName;

          if (route.name === 'People') {
            iconName = 'people';
          } 
          else if (route.name === 'Profile') {
            iconName = 'person';
          }
          // else if (route.name === 'Chat') {
          //   iconName = 'chatbubbles';
          // }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={30} color={color}/>;
        },
        tabBarActiveTintColor: COLORS.yellow,
      // tabBarInactiveTintColor: COLORS.random,
      tabBarStyle: {
        paddingTop: 10,
        paddingBottom: 10,
        height: '10%'
      },
        })}
      >
        <Tab.Screen 
          name="People" 
          component={PeopleNav}
        />
        {/* <Tab.Screen 
          name="Chat" 
          component={Chat}
        /> */}
        <Tab.Screen 
          name="Profile" 
          component={ProfileNav} 
        />
      </Tab.Navigator>
    </>


    //     if (route.name === 'People') {
    //       iconName = 'people';
    //     } 
    //     else if (route.name === 'Profile') {
    //       iconName = 'person';
    //     }
    //     // else if (route.name === 'Chat') {
    //     //   iconName = 'chatbubbles';
    //     // }

    //     // You can return any component that you like here!
    //     return <Ionicons name={iconName} size={30} color={color}/>;
    //   },
    //   // tabBarActiveTintColor: COLORS.yellow,
    //   // tabBarInactiveTintColor: COLORS.random,
    //   // tabBarStyle: {
    //   //   backgroundColor: COLORS.grey,
    //   //   paddingBottom: 0,
    //   // },
    //   // tabBarShowLabel: true,
    //   })}
    // >
    //   <Tab.Screen 
    //     name="People" 
    //     component={PeopleNav}
    //   />
    //   {/* <Tab.Screen 
    //     name="Chat" 
    //     component={Chat}
    //   /> */}
    //   <Tab.Screen 
    //     name="Profile" 
    //     component={ProfileNav} 
    //   />
    // </Tab.Navigator>
  )
}

function ProfileNav() {
  return (
    <Stack.Navigator screenOptions={{ animationEnabled: false }}>
      <Stack.Screen name="ProfileMain" component={Profile} options={{ headerShown: false }}/>
      <Stack.Screen name="EditProfile" component={EditProfile} 
        options={{
          headerTitle: props => <Text style={{fontWeight: 'bold', fontSize: 20}}>Edit Profile</Text>,
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
      {/* I think it's just easier to make my own header */}
      <Stack.Screen name="Chat" component={Chat}/>
      <Stack.Screen name="ChatDetails" component={ChatDetails} options={{ title: 'Group details' }}/>
      <Stack.Screen name="GroupAvailability" component={GroupAvailability} options={{ title: 'Group Availability' }}/>
      <Stack.Group screenOptions={{ presentation: 'modal', gestureEnabled: 'true' }}>
        <Stack.Screen name="EditName" component={EditName} options={{ 
          title: 'Edit Name',
        }}/>
      </Stack.Group>
    </Stack.Navigator>
  )
}

function FriendsTab() {
  return (
    <matTab.Navigator screenOptions={({ route }) => ({
      tabBarLabelStyle: { fontSize: 20, textTransform: 'none' },
      tabBarLabel: () => {
        if (route.name === 'ContactsFriends') {
          return <Text style={{fontWeight: 'bold'}}>Contacts</Text>;
        } 
        if (route.name === 'AllUsers') {
          return <Text style={{fontWeight: 'bold'}}>All Users</Text>;
        } 
        return <Text style={{fontWeight: 'bold'}}>My Friends</Text>;
      },
    })}
    >
      <matTab.Screen name="ContactsFriends" component={NewFriends}/>
      <matTab.Screen name="AllUsers" component={AllUsers}/>
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