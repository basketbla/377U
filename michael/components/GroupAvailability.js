import * as Device from 'expo-device';
import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform, StyleSheet, Pressable, Alert, ScrollView} from 'react-native';
import * as Linking from 'expo-linking';
import { COLORS } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext'
// import * as CalendarAvailability from "./addCalendarInfo.js";
import * as Calendar from 'expo-calendar';
import { getAvailability, getCalEvents} from '../utils/firebase';

export default function GroupAvailability({ route, navigation }) {
  const { group } = route.params;
  const [calendars, setCalendars] = useState([]);
  const [freeSlots, setFreeSlots] = useState([]);
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const { setIsNew } = useAuth();
  const [earliestTime, setEarliestTime] = useState(8); //earliest suggested time is 9am
  const [latestTime, setLatestTime] = useState(23); //latest is 11pm

  useEffect(() => {
    (async () => {
      console.log("hi");
      
      let interval = 0; //DEFAULT 7, 0 for one day
      let meetingInterval = 1; //how many hours do you want to meet for? or: min amount of time for a slot to show up?

      let freeSlots = await findCalendarSlots(interval, meetingInterval);
      
      setFreeSlots(freeSlots);
      setSuggestedSlots(pickFreeSlots(freeSlots));
      
      
      // } else {
        //tell users to enable cal permissions
      // }

    })();
  }, []);

  //PARAMS: {
  // interval = 0; DEFAULT 7, 0 for one day
  // meetingInterval = 1; how many hours do you want to meet for? or: min amount of time for a slot to show up?
  // }
  //finds all slots of the amt of time given in meetingInterval, from tomorrow to tomorrow + interval days
  async function findCalendarSlots(interval, meetingInterval) {
 
    let startInterval = new Date();
    startInterval.setDate(startInterval.getDate() + 1); //starting 'tomorrow'
    startInterval.setHours(0, 0 , 0);

    let endInterval = new Date();  
    endInterval.setDate(startInterval.getDate() + interval); 
    //default will look into all events after 'tomorrow' to a week later
    endInterval.setHours(23, 59 , 59);

    let events = await accessCalendars();
    return getAvailability(events, startInterval.toISOString(), endInterval.toISOString(), meetingInterval);
  }

  async function accessCalendars() {
    
    console.log("-----------------");
    let events = [];
    for (let user in group.users) {
      let userEvents = await getCalEvents(user);
      if (userEvents == null) continue;

      events = events.concat(userEvents);
      // console.log("FB CALENDAR OF ", user, " : ", userEvents);
    }

    setCalendars(events);

    events.sort(
      (objA, objB) => new Date(objA.startDate) - new Date(objB.startDate),
    );
    // console.log("RET: ", events);
    return events;
  }

  async function getAvailability(events, startInterval, endInterval, freeInterval) {
    /*
    startInterval and endInterval are all ISO date strings on the times you want to look for availability between
    freeInterval is the amt of time you want in order to consider a free interval (ex: 2 hours) 
    */

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
        while( freeStart.getHours() + freeHours + freeInterval >= 0) { // 11 + 4 + 2 >= 0
            if( freeHours >= freeInterval ) {
                temp.e = new Date(free.startDate);
                temp.e.setHours(temp.e.getHours()+freeHours);
                temp.s = new Date(free.startDate);
                temp.s.setHours(temp.s.getHours()+freeHours-freeInterval);

                if(temp.s.getHours() >= rootStart.getHours() && temp.e.getHours() <= rootEnd.getHours()) { 
                    if ((temp.s.getHours() >= earliestTime) && (temp.e.getHours() <= latestTime)) {
                      hourSlots.push({startDate:convertDate(temp.s), endDate: convertDate(temp.e)});
                      temp = {};
                    }
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
      <Text>Pick a time! According to your calendars, you are all free during these times!</Text>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {suggestedSlots.map((slot, i) =>
                       
              <Pressable key={i} style={[styles.buttonText]}>
                <Text>{beautifyDate(slot.startDate, true)} - {beautifyDate(slot.endDate, false)}</Text>
                
              </Pressable>
                      
            )}
          </ScrollView>  
          <Pressable
            on> 
            <Text>All Available Times: </Text>
          </Pressable>

          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {freeSlots.map((slot, i) =>
                       
              <Pressable key={i} style={[styles.buttonText]}>
                <Text>{beautifyDate(slot.startDate, true)} - {beautifyDate(slot.endDate, false)}</Text>
                
              </Pressable>
                      
            )}
          </ScrollView>  
    </View>
    
  )
}

function convertDate(date) {
  date = new Date(date);
  return date.toLocaleString();
}

function pickFreeSlots(freeSlots) {
  // let free = [];
  // for (let i = 0; i < 3; i++ ) {
  //   const random = Math.floor(Math.random() * freeSlots.length);

  // }
  const shuffled = freeSlots.sort(() => 0.5 - Math.random());
  // Get sub-array of first n elements after shuffled
  return shuffled.slice(0, 3);

}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  buttonText: {
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


function beautifyDate(date, isStart) {
  date = new Date(date);
  let min = date.getMinutes();
  if (min < 10) {
    min.toString();
    min = "0" + min;
  }

  let hour = date.getHours();
  let m = "AM";
  if (hour == 12) {
    m = "PM";
  } else if (hour > 12) 
  {
    hour -= 12;
    m = "PM";
  }

  if (!isStart) {
    return hour + ":" + min + " " + m;
  }
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const day = date.getDay();
  const month = date.getMonth();
  
  return days[day] + ", " + months[month] + " " + date.getDate() + " " + hour + ":" + min + " " + m;
}