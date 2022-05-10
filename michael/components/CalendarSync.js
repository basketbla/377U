// import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications';
import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform, StyleSheet, Pressable, Alert} from 'react-native';
// import * as Linking from 'expo-linking';
import { COLORS } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext'
import * as Calendar from 'expo-calendar';


// I put the notifications stuff in this component but it has nothing to
// do with calendar. I may clean it up later.
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  nextLabel: {
    fontWeight: 'bold',
    color: 'white'
  },
})
