import { StyleSheet, Text, View, Pressable, Platform } from 'react-native'
import React, { useState, useCallback, useEffect, useRef } from "react";
import { GiftedChat, InputToolbar } from "react-native-gifted-chat";
import firebase from "@firebase/app";
import { addMessageByObj, getCurrentUser, getGroup } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import { onChildAdded, ref as ref_db} from "firebase/database";
import { database } from '../utils/firebase';
import { COLORS } from '../utils/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function Chat({ navigation, route }) {
  // state = {
  //   notification: {},
  // };

  // // componentDidMount() {
  //   registerForPushNotificationsAsync();

  //   Notifications.addNotificationReceivedListener(this._handleNotification);
    
  //   Notifications.addNotificationResponseReceivedListener(this._handleNotificationResponse);
  // }

  // _handleNotification = notification => {
  //   this.setState({ notification: notification });
  // };

  // _handleNotificationResponse = response => {
  //   console.log(response);
  // };
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  console.log(expoPushToken)
  const notificationListener = useRef();
  const responseListener = useRef();
  
  const { group } = route.params;
  const { userFirebaseDetails } = useAuth();
  // const [messages, setMessages] = useState(Object.keys(group.messages).map(id => ({...group.messages[id], _id: id, createdAt: JSON.parse(group.messages[id].createdAt)})));
  const [messages, setMessages] = useState([]);




  // useEffect(async () => {
  //   console.log(group)
  // }, [])

  const { chatname } = "hello, world"; //name of the chat group 
  // console.log(firebase.auth().currentUser);


  // useEffect(() => { //messaging
  //   registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

  //   notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
  //     setNotification(notification);
  //   });

  //   responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
  //     console.log(response);
  //   });

  // Can use this function below, OR use Expo's Push Notification Tool-> https://expo.dev/notifications
  async function sendPushNotification(expoPushToken) {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: 'You got a message on Din Din!',
      body: 'Someone requested you to go on an adventure',
      data: { someData: 'goes here' },
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

  async function schedulePushNotification(messageBody) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You got a message on Din Din! 📬",
//         body: 'Here is the notification body ', messageBody,
        body: 'Check the notification! '
        data: { data: messageBody },
      },
      trigger: { seconds: 2 },
    });
  }

  //how to make sure you have the right credentials to get notifications
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
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('this is token ', token);
      console.log(expoPushToken)
      this.setState({ expoPushToken: token });
    } else {
      alert('Must use physical device for Push Notifications');
    }

  
  //   if (Platform.OS === 'android') {
  //     Notifications.setNotificationChannelAsync('default', {
  //       name: 'default',
  //       importance: Notifications.AndroidImportance.MAX,
  //       vibrationPattern: [0, 250, 250, 250],
  //       lightColor: '#FF231F7C',
  //     });
  //   }
  
  //   return token;
  // }

  // async function schedulePushNotification() {
  //   await Notifications.scheduleNotificationAsync({
  //     content: {
  //       title: "You've got mail! 📬",
  //       body: 'Here is the notification body',
  //       data: { data: 'goes here' },
  //     },
  //     trigger: { seconds: 2 },
  //   });
  // }

  useEffect(() => {
    // Kind of can't test this well right now. TODO: TEST WITH TWO PHONES
    const unsubscribe = onChildAdded(ref_db(database, `groups/${group.id}/messages`), (snapshot, previousMessages) => {
      // I can't think of a better way to do this
      // console.log(messages.map(message => message.text));
      // console.log(snapshot.val());
      // if (!messages.map(message => message._id).includes(snapshot.key)) {
      //   let newMessage = snapshot.val();
      //   newMessage = {...newMessage, _id: snapshot.key, createdAt: JSON.parse(newMessage.createdAt)};
      //   setMessages([...messages, newMessage]);
      // }
      // console.log(snapshot.val())

      let newMessage = snapshot.val();
      newMessage = {...newMessage, _id: snapshot.key, createdAt: JSON.parse(newMessage.createdAt)};

      // Okay still so confused on what this is doing but it works so whatever
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, newMessage)
      );
    })
    // let unsubscribeFromNewSnapshots = db
    //   .collection("Chats") //ideally firestore, not realtime db
    //   .doc(chatname)
    //   .onSnapshot((snapshot) => {
    //     console.log("New Snapshot!");
    //     let newMessages = snapshot.data().messages.map((singleMessage) => {
    //       singleMessage.createdAt = singleMessage.createdAt.seconds * 1000;
    //       return singleMessage;
    //     });
    //     setMessages(newMessages);
    //   });

    // return function cleanupBeforeUnmounting() {
    //   unsubscribeFromNewSnapshots();
    // };


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


    return [unsubscribe, route.params.group.name];
  }, []);

  // firebase onsend or non-firebase onsend
  //** David's changes added async to it
  const onSend = useCallback(async (messages = []) => {
    addMessageByObj(group.id, messages[0]);
    console.log('message reached here1 ', expoPushToken)
    // await sendPushNotification(expoPushToken)
    let messageBody = messages[0]
    schedulePushNotification()
    // await schedulePushNotification(messageBody)
    console.log('message reached here2 ', expoPushToken)
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
      {/*<Pressable onPress={() => navigation.navigate('GroupAvailability', { group: group })} style={styles.header}>
          <Text style={styles.headerTitle}>See when everyone's free</Text>
      </Pressable>*/}
      <GiftedChat
        // renderInputToolbar={props => customtInputToolbar(props)}
        bottomOffset={80} // This is probably bad but can't worry about right now
        messages={messages}
        onSend={messages => onSend(messages)}
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