import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform, StyleSheet, Pressable, Alert, ScrollView} from 'react-native';
import * as Linking from 'expo-linking';
import { COLORS } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext'
// import * as CalendarAvailability from "./addCalendarInfo.js";
import * as Calendar from 'expo-calendar';
import { setAvailability, setCalEvents, getDBEventListener, setDBEventListener} from '../utils/firebase';


//use to update availiabitliy
export default function CalendarSync({ navigation }) {
  const { currentUser } = useAuth();
  const [calendars, setCalendars] = useState([]);
  const [isFree, setIsFree] = useState(); //DONT USE A STATE!!
  const { userFirebaseDetails, setUserFirebaseDetails} = useAuth();
  

  useEffect(() => {
    (async () => {
      // onChildChanged(ref_db(database, `dbFlag`), snapshot => {
      //   // I can't think of a better way to do this
      //   // console.log(messages.map(message => message.text));
      //   // console.log(snapshot.val());
      //   // if (!messages.map(message => message._id).includes(snapshot.key)) {
      //   //   let newMessage = snapshot.val();
      //   //   newMessage = {...newMessage, _id: snapshot.key, createdAt: JSON.parse(newMessage.createdAt)};
      //   //   setMessages([...messages, newMessage]);
      //   // }
      //   // console.log(snapshot.val())
        
      //   let newMessage = snapshot.val();
      //   newMessage = {...newMessage, _id: snapshot.key, createdAt: JSON.parse(newMessage.createdAt)};
  
      //   // Okay still so confused on what this is doing but it works so whatever
      //   setMessages((previousMessages) =>
      //     GiftedChat.append(previousMessages, newMessage)
      //   );
      // })
      //request permissions from calendar here
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        
        let interval = 7; //DEFAULT 7, 0 for one day
        let freeSlots = await findEvents(interval);

      }
      // } else {
        //tell users to enable cal permissions
      // }
      console.log("calendarSync");
      let listener = await getDBEventListener();
      // listener += 1;
      listener = parseInt(listener, 10);
      listener  = listener + 1;
      console.log("LISTE : ", listener);
      // :( sadge


      // Need to save this in some kind 
      /*
      for every friend user has
      flag and change flags

      cal sync listens to every group's
      */
      
    })();
  }, []);

  //finds all slots of the amt of time given in meetingInterval, from tomorrow to tomorrow + interval days
  async function findEvents(interval) {
    // interval = 0; DEFAULT 7, 0 for one day
    // meetingInterval = 1; how many hours do you want to meet for? or: min amount of time for a slot to show up?

    let startInterval = new Date();
    startInterval.setDate(startInterval.getDate() + 1); //starting 'tomorrow'
    startInterval.setHours(0, 0 , 0);

    let endInterval = new Date();  
    endInterval.setDate(startInterval.getDate() + interval); 
    //default will look into all events after 'tomorrow' to a week later
    endInterval.setHours(23, 59 , 59);

    let events =  await accessCalendar(startInterval, endInterval);
    setCalEvents(currentUser.uid, events);

    let currStart = new Date();
    currStart.setDate(currStart.getDate() -2 ); //get essentially yesterday at 11:59 to tomorrow at 12:00
    currStart.setHours(23, 59 , 59);

    let currEnd = new Date();
    currEnd.setDate(currEnd.getDate() + 2); 
    currEnd.setHours(0, 0 , 0);
    
    // console.log("start: ", convertDate(currStart))
    // console.log("date: ", convertDate(new Date()))
    // console.log("start: ", convertDate(currEnd))
    let todayEvents = await accessCalendar(currStart, currEnd);

    let avail  = checkCurrAvailability(todayEvents);
    setCurrAvailability(avail);
   
  }

  function checkCurrAvailability(events) {
    let time = Date.now();
    for (let i = 0; i < events.length; i++) {
      if (new Date(events[i].startDate) < time && new Date(events[i].endDate) > time ) {
        return false; 
      }
    }
    return true;
  }

  async function setCurrAvailability(avail) {
    setIsFree(avail);
    await setAvailability(currentUser.uid, avail);
    setUserFirebaseDetails({...userFirebaseDetails, isFree: avail})
    // console.log("AVAIL: ", avail);
  }

  async function accessCalendar(startInterval, endInterval) {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    // console.log('Here are all your calendars:');
    // console.log({ calendars });
    // setCalendars(calendars);
    

    let calIDArray = [];
    for (let i = 0; i < calendars.length; i++) {
      let calendar= calendars[i];
      // console.log("CAL: ", calendar);
      calIDArray.push(calendar.id);
    }
    let events = await Calendar.getEventsAsync(calIDArray, startInterval, endInterval);
    // console.log("SYNC LOGIN events for today: ", {events});
    retEvents = [];
    // console.log("EVENTS FOR RET: ", events)
    
    for (let i = 0; i < events.length; i++) {
      if (events[i].availability == "busy" && events[i].allDay == false) {
        retEvents.push({
          
          startDate: events[i].startDate,
          endDate: events[i].endDate,
        
          //TODO: ONLY FOR DEBUGGING, REMOVE FOR PRIVACY
          userID: currentUser.uid,
          username: currentUser.displayName,
          calendarID: events[i].calendarId,
          timeZone: events[i].timeZone,
          id:  events[i].id, //remove??
          title: events[i].title //REMOVE!!!!
        })
      }
    }

    // retEvents.sort(
    //   (objA, objB) => new Date(objA.startDate) - new Date(objB.startDate),
    // );
    // console.log("RET: ", retEvents)
    // console.log("RET SYNC: ", typeof retEvents, retEvents);
    // console.log("UID: ", currentUser);
    
    
    return retEvents;
  }
    return null;


// {/*
//   return (
//     <>
//       {/* <Text>CALENDARSYNC signinnnnn</Text> */}
//     </>
//       )*/}


}

function convertDate(date) {
  date = new Date(date);
  return date.toLocaleString();
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  nextButton: {
    width: '80%',
    backgroundColor: COLORS.yellow,
    height: 50,
    borderRadius: 10,
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
