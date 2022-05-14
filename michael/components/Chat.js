import { StyleSheet, Text, View, Pressable } from 'react-native'
import React, { useState, useCallback, useEffect } from "react";
import { GiftedChat, InputToolbar } from "react-native-gifted-chat";
import firebase from "@firebase/app";
import { addMessageByObj, getCurrentUser, getGroup } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import { onChildAdded, ref as ref_db} from "firebase/database";
import { database } from '../utils/firebase';
import { COLORS } from '../utils/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Chat({ navigation, route }) {
  
  const { group } = route.params;
  const { userFirebaseDetails } = useAuth();
  // const [messages, setMessages] = useState(Object.keys(group.messages).map(id => ({...group.messages[id], _id: id, createdAt: JSON.parse(group.messages[id].createdAt)})));
  const [messages, setMessages] = useState([]);




  // useEffect(async () => {
  //   console.log(group)
  // }, [])

  const { chatname } = "hello, world"; //name of the chat group 
  // console.log(firebase.auth().currentUser);
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
            <Pressable onPress={() => navigation.navigate('ChatDetails', { group: group })} style={styles.headerButtonRight}>
          <Ionicons name="information-circle" size={30} color={COLORS.yellow}/>
        </Pressable>
          ), });


    return [unsubscribe, route.params.group.name];
  }, []);

  // firebase onsend or non-firebase onsend
  const onSend = useCallback((messages = []) => {
    addMessageByObj(group.id, messages[0]);
  }, []);

  // const onSend = useCallback((messages = []) => {
  //   db.collection("Chats")
  //     .doc(chatname)
  //     .update({
  //       // arrayUnion appends the message to the existing array
  //       messages: firebase.firestore.FieldValue.arrayUnion(messages[0]),
  //     });
  //   setMessages((previousMessages) =>
  //     GiftedChat.append(previousMessages, messages)
  //   );
  // }, []);


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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcfcfc'
  },
  header: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '15%',
    backgroundColor: 'white',
    paddingTop: '10%', // Feels kind of bad,
    flexDirection: 'row'
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    maxWidth: '70%',
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
    width: 60,
    alignItems: 'flex-end',
    //paddingRight: 5,
  }
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