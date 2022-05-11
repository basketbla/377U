import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform, StyleSheet, Pressable, Alert} from 'react-native';
import * as Linking from 'expo-linking';
import { COLORS } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext'
// import * as CalendarAvailability from "./addCalendarInfo.js";
import * as Calendar from 'expo-calendar';
import { getAvailability } from '../utils/firebase';

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
  const [freeSlots, setFreeSlots] = useState([]);
  const { setIsNew } = useAuth();

  useEffect(() => {
    (async () => {
      //request permissions from calendar here
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        
        let interval = 0; //DEFAULT 7, 0 for one day
        let meetingInterval = 1; //how many hours do you want to meet for? or: min amount of time for a slot to show up?
        let freeSlots = await findCalendarSlots(interval, meetingInterval);
        setFreeSlots(freeSlots);
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

  //finds all slots of the amt of time given in meetingInterval, from tomorrow to tomorrow + interval days
  async function findCalendarSlots(interval, meetingInterval) {
    // interval = 0; DEFAULT 7, 0 for one day
    // meetingInterval = 1; how many hours do you want to meet for? or: min amount of time for a slot to show up?

    let startInterval = new Date();
    startInterval.setDate(startInterval.getDate() + 1); //starting 'tomorrow'
    startInterval.setHours(0, 0 , 0);

    let endInterval = new Date();  
    endInterval.setDate(startInterval.getDate() + interval); 
    //default will look into all events after 'tomorrow' to a week later
    endInterval.setHours(23, 59 , 59);

    let events = await accessCalendar(startInterval, endInterval);
    return getAvailability(events, startInterval.toISOString(), endInterval.toISOString(), meetingInterval);
  }

  async function accessCalendar(startInterval, endInterval) {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    // console.log('Here are all your calendars:');
    // console.log({ calendars });
    setCalendars(calendars);
    

    let calIDArray = [];
    for (let i = 0; i< calendars.length; i++) {
      let calendar= calendars[i];
      // console.log("CAL: ", {calendars[i]});
      calIDArray.push(calendar.id);
    }
    let events = await Calendar.getEventsAsync(calIDArray, startInterval, endInterval);
    console.log("events for today: ", {events});
    retEvents = []
    for (let i = 0; i < events.length; i++) {
      if (events[i].availability == "busy" && events[i].allDay == false) {
        retEvents.push({
          
          startDate: events[i].startDate,
          endDate: events[i].endDate,
          timeZone: events[i].timeZone,

          calendarID: events[i].calendarId,
          id:  events[i].id,
          title: events[i].title
        })
      }
    }

    retEvents.sort(
      (objA, objB) => new Date(objA.startDate) - new Date(objB.startDate),
    );
    console.log("RET: ", retEvents);
    return retEvents;
  }

  async function getAvailability(events, startInterval, endInterval, freeInterval) {
    /*
    startInterval and endInterval are all ISO date strings on the times you want to look for availability between
    freeInterval is the amt of time you want in order to consider a free interval (ex: 2 hours) */

    let rootStart = new Date(startInterval),
        rootEnd = new Date(endInterval);
    let freeSlots = []; 
    
    events.forEach((event, index) => { //calculate free from busy times

        if (index == 0 && startInterval < event.startDate) {
            freeSlots.push({
                startDate: startInterval, 
                endDate: event.startDate,
                start: convertDate(startInterval),
                end: convertDate(event.startDate)
              });
        }
        else if (index == 0) {
            startInterval = event.endDate;
        }
        else if (events[index - 1].endDate < event.startDate) {
          freeSlots.push({
            startDate: events[index - 1].endDate, 
            endDate: event.startDate,
            start: convertDate(events[index - 1].endDate),
            end: convertDate(event.startDate)
          });
        }

        if (events.length == (index + 1) && event.endDate < endInterval) {
          freeSlots.push({
            startDate: event.endDate, 
            endDate: endInterval,
            start: convertDate(event.endDate),
            end: convertDate(endInterval),
          });
        }
    });


    if (events.length == 0) {
        freeSlots.push({startDate: startInterval, endDate: endInterval});
    }
    console.log("FREE: ", freeSlots);

    var temp = {}, hourSlots = [];
    //breaks down the total free slots into chunks based on the interval set (1, 2, 3, hours, etc)
    freeSlots.forEach(function(free, index) {
        let freeHours = new Date(free.endDate).getHours() - new Date(free.startDate).getHours();
        let freeStart = new Date(free.startDate);
        let freeEnd = new Date(free.endDate);
        while( freeStart.getHours() + freeHours + freeInterval >= 0) { // 11 + 4 + 2 >= 0
            if( freeHours >= freeInterval ) {
                temp.e = new Date(free.startDate);
                temp.e.setHours(temp.e.getHours()+freeHours);
                temp.s = new Date(free.startDate);
                temp.s.setHours(temp.s.getHours()+freeHours-freeInterval);
                if(temp.s.getHours() >= rootStart.getHours() && temp.e.getHours() <= rootEnd.getHours()) {
                    hourSlots.push({startDate:convertDate(temp.s), endDate: convertDate(temp.e)});
                    temp = {};
                }
                //add another one for 11 to 11:59pm 
            }
            freeHours--;
        }
    })
    hourSlots.sort(
      (objA, objB) => new Date(objA.startDate) - new Date(objB.startDate),
    );
    console.log("HOURS:" , hourSlots)
    return hourSlots;
  }
  

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

function convertDate(date) {
  date = new Date(date)
  return date.toLocaleString()
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
