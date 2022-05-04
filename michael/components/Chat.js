import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

import React, { useState, useCallback, useEffect } from "react";
import { GiftedChat } from "react-native-gifted-chat";
// import db from "../firebase"; //do we have this? 
import firebase from "@firebase/app";

// export default function App() {
//   const [messages, setMessages] = useState([]);
//   const onSend = useCallback((messages = []) => {
//     setMessages((previousMessages) =>
//       GiftedChat.append(previousMessages, messages)
//     );
//   }, []);
//   // return (
//   // );
// }
export default function Chat({ route }) {
  const [messages, setMessages] = useState([]);

  const { chatname } = "hello, world"; //name of the chat group 
  // console.log(firebase.auth().currentUser);

  // useEffect(() => {
  //   let unsubscribeFromNewSnapshots = db
  //     .collection("Chats") //ideally firestore, not realtime db
  //     .doc(chatname)
  //     .onSnapshot((snapshot) => {
  //       console.log("New Snapshot!");
  //       let newMessages = snapshot.data().messages.map((singleMessage) => {
  //         singleMessage.createdAt = singleMessage.createdAt.seconds * 1000;
  //         return singleMessage;
  //       });
  //       setMessages(newMessages);
  //     });

  //   return function cleanupBeforeUnmounting() {
  //     unsubscribeFromNewSnapshots();
  //   };
  // }, []);

  //firebase onsend or non-firebase onsend
    const onSend = useCallback((messages = []) => {
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
      onSend={(messages) => onSend(messages)} // can switch out with firebase onSend or non-firebase onSend
      user={{
          _id: 1,
          name: "Jenny",
          avatar: "https://placeimg.com/140/140/any",
      }}
      // user={{
      //   // current "blue bubble" user
      //   _id: firebase.auth().currentUser.uid,
      //   name: firebase.auth().currentUser.displayName,
      //   avatar: "https://placeimg.com/140/140/any", //need an image "../assets/avatar.png"
      // }}
      inverted={false}
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
    alignItems: 'center'
  }
})