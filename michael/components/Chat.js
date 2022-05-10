import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

import React, { useState, useCallback, useEffect } from "react";
import { GiftedChat } from "react-native-gifted-chat";
// import db from "../firebase"; //do we have this? 
import firebase from "@firebase/app";
import { addMessageByObj, getCurrentUser, getGroup } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import { onChildAdded, ref as ref_db} from "firebase/database";
import { database } from '../utils/firebase';

export default function Chat({ route }) {
  
  const { group } = route.params;
  const { userFirebaseDetails } = useAuth();
  const [messages, setMessages] = useState(Object.keys(group.messages).map(id => ({...group.messages[id], _id: id, createdAt: JSON.parse(group.messages[id].createdAt)})));

  // useEffect(async () => {
  //   console.log(group)
  // }, [])

  const { chatname } = "hello, world"; //name of the chat group 
  // console.log(firebase.auth().currentUser);

  useEffect(() => {
    // Kind of can't test this well right now. TODO: TEST WITH TWO PHONES
    const unsubscribe = onChildAdded(ref_db(database, `groups/${group.id}/messages`), (snapshot, previousMessages) => {
      console.log('New message :o');
      let newMessage = snapshot.val();
      console.log(newMessage);
      if (newMessage.user._id !== userFirebaseDetails.uid) {
        console.log('doesnt match')
        newMessage = {...newMessage, _id: snapshot.key(), createdAt: JSON.parse(newMessage.createdAt)};
        setMessages([...messages, newMessage]);
      }
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
    return unsubscribe;
  }, []);

  // firebase onsend or non-firebase onsend
  const onSend = useCallback((messages = []) => {
    addMessageByObj(group.id, messages[0]);
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
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

  return (
    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)} // can switch out with firebase onSend or non-firebase onSend
      user={{
          _id: userFirebaseDetails.uid,
          name: userFirebaseDetails.name,
          avatar: userFirebaseDetails.profilePic,
      }}
      // user={{
      //   // current "blue bubble" user
      //   _id: firebase.auth().currentUser.uid,
      //   name: firebase.auth().currentUser.displayName,
      //   avatar: "https://placeimg.com/140/140/any", //need an image "../assets/avatar.png"
      // }}
      inverted={true}
      showUserAvatar={true}
      renderUsernameOnMessage={true}
    />
  );
}

// export default function Chat() {
//   const [messages, setMessages] = useState([]);

//   const onSend = useCallback((messages = []) => {
//     setMessages((previousMessages) =>
//       GiftedChat.append(previousMessages, messages)
//     );
//   }, []);
//   return (
//     // <View style={styles.container}>
//       // <div>
//         <GiftedChat
//         messages={messages}
//         onSend={(messages) => onSend(messages)}
//         user={{
//           _id: 1,
//           name: "Jenny",
//           avatar: "https://placeimg.com/140/140/any",
//         }}
//         showUserAvatar={true}
//       />

//       // </div>
//       // {/* <Text>Chat</Text> */}

//     // </View>
//   )
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})