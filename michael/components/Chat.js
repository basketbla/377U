import { StyleSheet, Text, View, Pressable } from 'react-native'
import React, { useState, useCallback, useEffect } from "react";
import { GiftedChat, InputToolbar, Send } from "react-native-gifted-chat";
import firebase from "@firebase/app";
import { addMessageByObj, getCurrentUser, getGroup } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import { onChildAdded, ref as ref_db} from "firebase/database";
import { database } from '../utils/firebase';
import { COLORS, NOTIFICATION_TYPES } from '../utils/constants';
import { beautifyDate } from './GroupAvailability.js'
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';


export default function Chat({ navigation, route }) {
  
  const { group, chosenSlot } = route.params;
  const { userFirebaseDetails } = useAuth();
  const [messages, setMessages] = useState([]);
  const [groupTokens, setGroupTokens] = useState([]);

  useEffect(() => {
    const unsubscribe = onChildAdded(ref_db(database, `messages/${group.id}`), (snapshot, previousMessages) => {

      let newMessage = snapshot.val();
      newMessage = {...newMessage, _id: snapshot.key, createdAt: JSON.parse(newMessage.createdAt)};

      // Okay still so confused on what this is doing but it works so whatever
      setMessages((prevMessages) =>
        GiftedChat.append(prevMessages, newMessage)
      );
    })

    navigation.setOptions({ headerTitle: route.params.group.name, headerRight: () => (
      <View style={{flexDirection: 'row'}} > 

    
      <Pressable onPress={() => navigation.navigate('ChatDetails', { group: group })} style={styles.headerButtonRight}>
          <Ionicons name="information-circle" size={30} color={COLORS.yellow}/>
        </Pressable>

       <Pressable onPress={() => navigation.navigate('GroupAvailability', { group: group })} style={styles.headerButtonRight}>
          <Ionicons name="calendar" size={30} color={COLORS.yellow}/>
      </Pressable>
          </View> 


    ), });


    return unsubscribe;
  }, []);

  useEffect(async () => {
    // Super inefficient way of doing this. Will fix when I clean up firebase
    let userTokens = [];
    for (let id of Object.keys(group.users)) {
      if (id === userFirebaseDetails.uid) {
        continue;
      }
      let token = (await getCurrentUser(id)).val().pushToken;
      if (token) {
        userTokens.push(token);
      }
    }
    // console.log("userTokens: ", userTokens);
    setGroupTokens(userTokens);

    if (route.params.sendNotif) {
      sendPushNotifications(route.params.sendNotif, userTokens);
    }
  }, [])

  // Could redo this to use the function from expo.js...
  const sendPushNotifications = async (messageBody, userTokens) => {
    let tokens = groupTokens;
    if (userTokens) {
      tokens = userTokens;
    }
    for (let expoPushToken of tokens) {
      // Some existing users don't have tokens. Dont mess with it.
      if (!expoPushToken) {
        return
      }
  
      const message = {
        to: expoPushToken,
        sound: 'default',
        title: userFirebaseDetails.name,
        body: messageBody,
        data: { group: group, type: NOTIFICATION_TYPES.message },
      };
    
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    }

  }

  // firebase onsend or non-firebase onsend
  const onSend = useCallback((messages = []) => {
    addMessageByObj(group.id, messages[0]);
  }, []);


 function renderSend(props) {
    return (
      <Send {...props}>
        <View style={styles.sendButton}>
            <Ionicons name="arrow-up-outline" size={23} color='white'/>
        </View>
      </Send>
    );
  }

 // <View style={styles.header}>
 //        <Pressable style={styles.headerButtonLeft} onPress={() => navigation.goBack()}>
 //          <Text style={styles.backButtonText}>{'< Back'}</Text>
 //        </Pressable>
 //        <Text style={styles.headerTitle} numberOfLines={1}>{route.params.group.name}</Text>
 //        <Pressable onPress={() => navigation.navigate('ChatDetails', { group: group })} style={styles.headerButtonRight}>
 //          <Ionicons name="information-circle-outline" size={30} color={COLORS.yellow}/>
 //        </Pressable>
 //      </View>

  return (
    <View style={styles.container}>
      {chosenSlot ? 
        <>
        <Text style={styles.headerText}> You're on for: </Text>
        <Pressable 
          onPress={() => navigation.navigate('GroupAvailability', { group: group })} 
          style={[styles.buttonText]}>
          <Text>{beautifyDate(chosenSlot.startDate, chosenSlot.endDate)}</Text>
      
        </Pressable>
        </>
        :
        <></>
      }
      
      {/*<Pressable onPress={() => navigation.navigate('GroupAvailability', { group: group })} style={styles.header}>
          <Text style={styles.headerTitle}>See when everyone's free</Text>
      </Pressable>*/}
      <GiftedChat
        // renderInputToolbar={props => customtInputToolbar(props)}
        bottomOffset={80} // This is probably bad but can't worry about right now
        messages={messages}
        onSend={messages => {onSend(messages); sendPushNotifications(messages[0].text)}}
        user={{
            _id: userFirebaseDetails.uid,
            name: userFirebaseDetails.name,
            avatar: userFirebaseDetails.profilePic,
        }}
        inverted={true}
        showUserAvatar={true}
        renderUsernameOnMessage={true}
        alwaysShowSend
        placeholder="Send a message!"
        renderSend={renderSend}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcfcfc',
  },
  header: {
    width: '100%',
    alignItems: 'center',
   // justifyContent: 'center',
    height: 40,
    backgroundColor: COLORS.yellow,
   // paddingTop: '10%', // Feels kind of bad,
  },
  buttonText: {
    backgroundColor: COLORS.yellow,
    height: 50,
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 15,
    marginRight:20,
    marginLeft:20,
    paddingLeft:8,
    paddingRight:8,
    borderRadius: 10,
    fontSize: 20,
  },
  headerText: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginTop:20,
    color: COLORS.darkGrey,
    fontSize:14,
    marginBottom:10,

 },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    alignItems: 'center',
    color: 'white',
    padding:10,
  },
  backButtonText: {
    color: COLORS.iosBlue,
    fontSize: 15,
  },
  headerButtonLeft: {
    width: 60,
    paddingLeft: 10
  },
  headerButtonRight: {
    width: 40,
    alignItems: 'flex-end',
    //paddingRight: 5,
  },
   sendButton: {
    backgroundColor: COLORS.yellow,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 15,
    bottom: 8 // Don't love this. Should change.
  },
})

// const customtInputToolbar = props => {
//   return (
//     <InputToolbar
//       {...props}
//       containerStyle={{
//         backgroundColor: "white",
//         borderTopColor: "#E8E8E8",
//         borderTopWidth: 1,
//         padding: 8
//       }}
//     />
//   );
// };