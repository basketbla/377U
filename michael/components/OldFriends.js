import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Pressable,
  Image,
  Keyboard,
  ActivityIndicator,
  Alert
} from 'react-native'
import { SearchBar } from 'react-native-elements';
import React, {
  useEffect,
  useState
} from 'react'
import * as Contacts from 'expo-contacts';
import { COLORS, DEFUALT_PROFILE_PIC } from '../utils/constants';
import { getFriendRequests, getFriends, removeFriend, database, getUsers } from '../utils/firebase';
import { onValue, ref as ref_db } from 'firebase/database';
import * as SMS from 'expo-sms';
import { useAuth } from '../contexts/AuthContext';
import { useIsFocused } from "@react-navigation/native";
import { useFriends } from '../contexts/FriendsContext'

const User = ({ contact, handleRemoveFriend }) => {

  const [littleLoading, setLittleLoading] = useState(false);

  const handleRemoveFriendLittle = async () => {
    confirmRemove();
  }

  const confirmRemove = () => {
    Alert.alert(
      "Confirm Remove Friend",
      `Are you sure you want to remove ${contact.username} from your friends?`,
      [
        {
          text: "Confirm",
          onPress: async () => {setLittleLoading(true); await handleRemoveFriend(contact.id)}
        },
        { text: "Cancel", onPress: undefined, style: "cancel" }
      ]
    );
  }

  return (
    <View style={styles.contactEntry}>
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
      <Pressable style={styles.removeButton} onPress={handleRemoveFriendLittle} disabled={littleLoading}>
        {
          littleLoading ?
          <ActivityIndicator/>
          :
          <Text style={styles.removeButtonText}>X</Text>  
        }
      </Pressable>
    </View>
  );
}

export default function OldFriends({ navigation }) {

  const isFocused = useIsFocused();

  const { currentUser } = useAuth();
  const { allUsers, setAllUsers } = useFriends();

  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState([]);
  const [friendsToDisplay, setFriendsToDisplay] = useState([]);
  const [loading, setLoading] = useState(true);


  // Fetch all friends
  useEffect(async () => {
      let friendsSnapshot = await getFriends(currentUser.uid);
      let users = allUsers;
      let friendUsers = [];
      if (friendsSnapshot && friendsSnapshot.val()) {
        friendUsers = Object.keys(friendsSnapshot.val()).map(id => {return {...users[id], id: id}});
      }
      setFriends(friendUsers);
      setFriendsToDisplay(friendUsers);
      setLoading(false);
  }, []);

  // Add listeners to see if anyone accepted requests
  useEffect(() => {

    // Wasting a time setting friendRequests the first time, but I think it's fine
    const unsubscribe = onValue(ref_db(database, `friends/${currentUser.uid}`), async (snapshot) => {
      if (snapshot.val()) {
        let friendIds = Object.keys(snapshot.val());

        // Same thing as in newFriends. Still hacky
        let shouldRefresh = false;
        for (let id of friendIds) {
          if (allUsers[id] === undefined) {
            shouldRefresh = true;
          }
        }

        let newAllUsers = allUsers;
        if (shouldRefresh) {
          newAllUsers = await getUsers();
          setAllUsers(newAllUsers)
        }

        let friendUsers = Object.keys(snapshot.val()).map(id => {return {...newAllUsers[id], id: id}});
        setFriends(friendUsers)
        setFriendsToDisplay(friendUsers)
      }
      else {
        setFriends([])
        setFriendsToDisplay([])
      }
    });
    

    return unsubscribe;
  }, []);

  // For rendering contacts with accounts
  const renderItem = ({item}) => {
    return <User contact={item} handleRemoveFriend={handleRemoveFriend}/>
  };

  const handleRemoveFriend = async (friendId) => {
    await removeFriend(friendId, currentUser.uid);
    setFriendsToDisplay([...friendsToDisplay.filter(user => user.id !== friendId)])
  }

  const handleSearch = text => {
    setSearch(text);
    text = text.toLowerCase();
    let newFriends = friends.filter(item => (item.username.toLowerCase().includes(text) || item.name.toLowerCase().includes(text)));
    setFriendsToDisplay(newFriends);
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator/>
      </View>
    )
  }
  
  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Search Friends"
        onChangeText={handleSearch}
        value={search}
        containerStyle={styles.search}
        platform="ios"
        inputStyle={{backgroundColor: COLORS.lightGrey}}
        inputContainerStyle={[{backgroundColor: COLORS.lightGrey},{ height: 40 }]}   
      />
      {
        friends.length === 0 ?
        <Text style={{marginTop: 10, flex: 1, fontSize: 18, color: COLORS.darkGrey}}>You have no friends yet :(</Text>
        :
        <>
          {
            friendsToDisplay.length === 0 ?
            <Text style={{flex: 1, fontSize: 20, color: COLORS.darkGrey}}>No matching friends</Text>
            :
            <FlatList
              data={friendsToDisplay}
              renderItem={renderItem}
              keyExtractor={item => item.username}
              style={styles.contactList}
              onScrollEndDrag={() => Keyboard.dismiss() }
              onScrollBeginDrag={() => Keyboard.dismiss() }
            />
          }
        </>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  search: {
    //width: '95%',
    marginLeft: 5,
    marginRight: 5,
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
  removeButton: {
    marginLeft: 'auto',
    marginRight: 20,
    padding: 10,
    width: 100,
  },
  removeButtonText: {
    textAlign: 'right',
    fontWeight: 'bold',
    color: COLORS.darkGrey
  },
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
  }
})