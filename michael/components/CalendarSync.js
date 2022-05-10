import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform, StyleSheet, Pressable, Alert} from 'react-native';
import * as Linking from 'expo-linking';
import { COLORS } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext'
import * as CalendarAvailability from "./addCalendarInfo.js";

// I put the notifications stuff in this component but it has nothing to
// do with calendar. I may clean it up later.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function CalendarSync({ navigation }) {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const [calendars, setCalendars] = useState([]);
  const { setIsNew } = useAuth();

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        console.log('Here are all your calendars:');
        // console.log({ calendars });
        setCalendars(calendars);

        let nextDay = new Date();
        console.log("today: ", Date.now())
        
        nextDay.setDate(nextDay.getDate() + 1) //change for 31st
        console.log("next: ", nextDay)

        // console.log(calendars)
        console.log("--------")
        for (let i = 0; i< calendars.length; i++) {//let calendar in calendars) {
          let calendar= calendars[i]
          // console.log("CAL: ", {calendars[i]});
          let events = await Calendar.getEventsAsync([calendar.id], Date.now(), nextDay);
          console.log("events for today ", calendar.title, ": ", {events})
        }

      }

      // Need to save this in some kind 
      registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Welcome to Din Din!",
          body: 'Thanks for signing up for notifications :)',
          data: { data: 'goes here' },
        },
        trigger: { seconds: 2 },
      });

      return () => {
        Notifications.removeNotificationSubscription(notificationListener.current);
        Notifications.removeNotificationSubscription(responseListener.current);
      };
    })();
  }, []);
  // useEffect(async () => {
    // Need to save this in some kind 
    // registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    // notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
    //   setNotification(notification);
    // });

    // responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
    //   console.log(response);
    // });

    // await Notifications.scheduleNotificationAsync({
    //   content: {
    //     title: "Welcome to Din Din!",
    //     body: 'Thanks for signing up for notifications :)',
    //     data: { data: 'goes here' },
    //   },
    //   trigger: { seconds: 2 },
    // });

    // return () => {
    //   Notifications.removeNotificationSubscription(notificationListener.current);
    //   Notifications.removeNotificationSubscription(responseListener.current);
    // };
    
  // }, []);

  return (
    <View style={styles.container}>
      <Text>CalendarSync</Text>
      {calendars.map((calendar, i) =>
                  
                  calendar.allowsModifications ? (
                      <Text key={i} style={[styles.defaultText]}>
                        {calendar.title}
                      </Text>
                  ) : null,
                )}
  
    </View>
    
  )
}

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Welcome to Din Din!",
      body: 'Thanks for signing up for notifications :)',
      data: { data: 'goes here' },
    },
    trigger: { seconds: 2 },
  });
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert(
        "Enable Notifications",
        "'Please go to settings and enable push notifications!'",
        [
          { text: "Settings", onPress: () => Linking.openURL('app-settings:')}
        ]
      );
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  nextButton: {
    width: '80%',
    backgroundColor: COLORS.blue,
    height: 50,
    borderRadius: 5,
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  nextLabel: {
    fontWeight: 'bold',
    color: 'white'
  },
})
