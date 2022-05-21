import { StyleSheet, Text, View, Button, TextInput, FlatList, Pressable, Image, ActivityIndicator} from 'react-native'
import React, {
  useEffect,
  useState,
  useRef
} from 'react'
import { COLORS, hash } from '../utils/constants';
import { useHeaderHeight } from '@react-navigation/elements';
import useKeyboardHeight from 'react-native-use-keyboard-height';
import { addMessage, createGroup, getFriends, getGroup } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import { set } from 'firebase/database';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFriends } from '../contexts/FriendsContext';

const User = ({ contact, selectedUsers, setSelectedUsers, setFriendsText }) => {

  return (
    <Pressable style={styles.contactEntry} onPress={() => {setSelectedUsers([...selectedUsers, contact]); setFriendsText('');}}>
      <Image
        style={styles.profilePicReal}
        source={{
          uri: contact.profilePic
        }}
      />
      <View style={styles.contactName}>
        <Text style={styles.contactName}>
          {
            // Just truncating name but dang this is ugly
            // Yeah number of lines fixes this. Whatever.
            contact.name ? contact.name.substring(0, 18) + (contact.name.length > 18 ? '...' : '') : ''
          }
        </Text>
        <Text style={styles.contactUsername}>
          {contact.username}
        </Text>
      </View>
    </Pressable>
  );
}

export default function CreateGroup({ navigation, route }) {

  // Keyboard avoiding didn't work when switching focus.
  // Current fix makes it lag for a second, but whatever
  const keyboardHeight = useKeyboardHeight();

  const { currentUser, userFirebaseDetails } = useAuth();
  const { allUsers } = useFriends();

  const friendInputRef = useRef();
  const [friendsText, setFriendsText] = useState(''); 
  const [allFriends, setAllFriends] = useState([]);
  const [friendsToDisplay, setFriendsToDisplay] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [highlightLastSelected, setHighlightLastSelected] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [noFriends, setNoFriends] = useState(false);

  // TODO: make the text input not shitty and then actually make da groups!

  useEffect(async () => {
    friendInputRef.current.focus();

    // fetch all friends
    // is there a better way than just getting all users and filtering based on that?
    let friends = await getFriends(currentUser.uid);
    if (!friends.exists()) {
      setNoFriends(true);
      return
    }
    let friendIds = Object.keys(friends.val());
    let users = allUsers;

    if (route.params && route.params.selected) {
      setSelectedUsers(route.params.selected)
    }

    users = Object.keys(users).map(id => {return {...users[id], id: id}});
    setAllFriends(users.filter(user => friendIds.includes(user.id)));
    setFriendsToDisplay(users.filter(user => friendIds.includes(user.id)));
  }, [route.params])

  const renderItem = ({item}) => {
    return <User contact={item} selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} setFriendsText={setFriendsText}/>
  };

  const handleSearchFriends = (text) => {
    if (highlightLastSelected) {
      setHighlightLastSelected(false);
    }
    setFriendsText(text);

    // Filter out selected
    let newAllFriends = allFriends.filter(user => !selectedUsers.includes(user));
    setFriendsToDisplay(newAllFriends.filter(user => (user.name.toLowerCase().includes(text.toLowerCase()) || user.username.toLowerCase().includes(text.toLowerCase()))));
  }

  const handleDeleteSelected = () => {
    if (friendsText !== "") {
      return;
    }

    // if nothing highlighted, highlight the last one
    // Otherwise, deselect the last one
    if (highlightLastSelected) {
      setSelectedUsers(selectedUsers.slice(0, selectedUsers.length-1));
      setHighlightLastSelected(false);
    }
    else {
      setHighlightLastSelected(true);
    }
  }

  const sendMessage = async () => {
    // send messageText to whatever group selectedUsers is.
    // If group doesn't exist, make a new group.

    setSendingMessage(true);
    let hashStr = '';
    let userIds = selectedUsers.map(user => user.id);
    userIds.push(currentUser.uid);
    userIds.sort();
    for (let id of userIds) {
      hashStr += id;
    }
    let groupKey = hash(hashStr);
    let groupSnapshot = await getGroup(groupKey);
    if (groupSnapshot.exists()) {
      await addMessage(groupKey, userFirebaseDetails, messageText);
    }
    else {
      await createGroup(groupKey, selectedUsers, userFirebaseDetails, messageText);
    }
    let group = (await getGroup(groupKey)).val();


    // If two people, want their name as the name
    if (Object.keys(group.users).length === 2) {
      navigation.navigate('Chat', {group: {...group, numFree: Object.keys(group.users).length, totalNum: Object.keys(group.users).length, id: groupKey, name: allUsers[Object.keys(group.users).filter(id => id !== currentUser.uid)].name}, sendNotif: messageText}) 
    }
    navigation.navigate('Chat', {group: {...group, numFree: Object.keys(group.users).length, totalNum: Object.keys(group.users).length, id: groupKey}, sendNotif: messageText})
  }

  return (
    <View style={{...styles.container, paddingBottom: keyboardHeight}}>
      {/* What the hell? goes behind thing when focused?? */}
      <Text style={styles.header}>Message</Text>
      <View style={styles.friendInputContainer}>
        {
          selectedUsers.map(user => {
            // Check if we need to highlight the last one
            if ((user.id === selectedUsers[selectedUsers.length-1].id) && highlightLastSelected) {
              return (
                <View key={user.id} style={styles.selectedUserHighlight} >
                  <Text style={styles.selectedUserTextHighlight}>{user.name}</Text>
                </View>
              );
            }
            return (
              <View key={user.id} style={styles.selectedUser} >
                <Text style={styles.selectedUserText}>{user.name}</Text>
              </View>
            );
          })
        }
        <TextInput
          style={styles.friendInput}
          placeholder="Add friends"
          onChangeText={handleSearchFriends}
          value={friendsText}
          ref={friendInputRef}
          onKeyPress={({ nativeEvent }) => {
            nativeEvent.key === 'Backspace' ? handleDeleteSelected() : null
          }}
          blurOnSubmit={false}
          onBlur={() => setFriendsText('')}
        />
      </View>
      <View style={styles.cancelButton}>
        <Button title="Cancel" onPress={() => navigation.goBack()}/>
      </View>
      <View style={{flexGrow: 1, width: '100%'}}>
        {
          friendsText.length === 0 ?
          <></>
          :
          <FlatList
            data={friendsToDisplay}
            renderItem={renderItem}
            keyExtractor={item => item.username}
            style={styles.contactList}
          />
        }
      </View>
      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.otherInput}
          placeholder="Send a message!"
          onChangeText={input => setMessageText(input)}
          value={messageText}
          multiline={true}
          // returnKeyType="send"
          // onSubmitEditing={() => alert('send a message!')}
        />
        <Pressable onPress={sendMessage} style={{...styles.sendButton, backgroundColor: (messageText === '' || selectedUsers.length === 0)  ? COLORS.lightGrey : COLORS.yellow}} disabled={(messageText === '' || selectedUsers.length === 0 || sendingMessage)}>
          {
            sendingMessage ?
            <ActivityIndicator/>
            :
            <Ionicons name="arrow-up-outline" size={23} color='white'/>
          }
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'white'
  },
  header: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 20,
  },
  cancelButton: {
    position: 'absolute',
    marginTop: 13,
    right: 10,
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
  contactEntry: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10
  },
 contactList: {
    //width: '100%',
    marginLeft: 5,
  },
  contactName: {
    color: COLORS.grey,
    fontWeight: 'bold',
    fontSize: 15,
  },
  contactUsername: {
    color: COLORS.grey,
    fontSize: 15,
  },
  profilePic: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginRight: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileLetters: {
    color: 'white',
    fontSize: 18,
  },
  // removeButton: {
  //   marginLeft: 'auto',
  //   marginRight: 20,
  //   padding: 10,
  //   width: 100,
  // },
  // removeButtonText: {
  //   textAlign: 'right',
  //   fontWeight: 'bold',
  //   color: COLORS.darkGrey
  // },
  sectionHeader: {
    width: '100%',
    height: 30,
    backgroundColor: 'white',
    color: 'black',
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 10,
  },
  deniedText: {
    color: COLORS.grey,
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 100,
  },
  profilePicReal: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginRight: 10,
    marginLeft: 10,
  },
  acceptRequestButton: {
    backgroundColor: COLORS.yellow,
    marginLeft: 'auto',
    alignItems: 'center',
    marginRight: 20,
    borderRadius: 10,
    padding: 10,
    width: 100,
  },
  acceptRequestText: {
    fontWeight: 'bold',
    color: 'white'
  },
  friendInput: {
    height: 30,
    paddingLeft: 5,
    flexGrow: 1,
  },
  friendInputContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
    marginTop: 10,
    width: '100%',
    flexDirection: 'row',
    paddingLeft: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingTop: 3,
    paddingBottom: 3
  },
  selectedUser: {
    backgroundColor: COLORS.yellow,
    padding: 6,
    paddingLeft:8,
    paddingRight:8,
    borderRadius: 7,
    margin: 3
  },
  selectedUserText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectedUserHighlight: {
    backgroundColor: COLORS.darkGrey,
    padding: 6,
    paddingLeft:8,
    paddingRight:8,
    borderRadius: 7,
    margin: 3
  },
  selectedUserTextHighlight: {
    color: 'white',
    fontWeight: 'bold',

  },
  otherInput: {
    width: '83%',
    //borderWidth: 1,
    //borderColor: 'lightgrey',
    // borderRadius: 20,
    //justifyContent: 'left',
    marginTop: 10,
    marginBottom: 5,
    maxHeight: 200,
    paddingLeft: 15,
    paddingBottom: 8,
    //paddingTop: 12,
    //paddingRight: 40,
    fontSize: 16,
    // height: 50,
    // borderBottomWidth: 1,
  },
  messageInputContainer: {
    //alignItems: 'center',
    width: '100%',
    borderTopWidth: 1,
    borderColor: 'lightgrey',

  },
  sendButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 15,
    bottom: 8, // Don't love this. Should change.
  },
})