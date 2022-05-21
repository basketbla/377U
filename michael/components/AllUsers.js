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
import { getFriendRequests, getFriends, removeFriend, getSentFriendRequests, database } from '../utils/firebase';
import { ref as ref_db, onValue } from 'firebase/database'
import { useAuth } from '../contexts/AuthContext';
import { useIsFocused } from "@react-navigation/native";
import ExistingContact from './ExistingContact';
import { useFriends } from '../contexts/FriendsContext';

// const User = ({ contact }) => {

//   return (
//     <Pressable style={styles.contactEntry} onPress={() => alert(`show the profile of ${contact.username}`)}>
//       <Image
//         style={styles.profilePicReal}
//         source={{
//           uri: contact.profilePic
//         }}
//       />
//       <View style={styles.contactName}>
//         <Text style={styles.contactName}>
//           {
//             // Just truncating name but dang this is ugly
//             // Yeah number of lines fixes this. Whatever.
//             contact.name.substring(0, 16) + (contact.name.length > 16 ? '...' : '')
//           }
//         </Text>
//         <Text style={styles.contactUsername}>
//           {contact.username}
//         </Text>
//       </View>
//     </Pressable>
//   );
// }

export default function AllUsers({ navigation }) {

  const isFocused = useIsFocused();

  const { currentUser } = useAuth();
  const { allUsers } = useFriends();

  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState([]);
  const [friendsToDisplay, setFriendsToDisplay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesters, setRequesters] = useState([]);
  const [newFriends, setNewFriends] = useState([]);
  const [requestees, setRequestees] = useState([]);


  // Fetch all friends
  useEffect(async () => {
      let users = allUsers;
      users = Object.keys(users).map(id => {return {...users[id], id: id}});

      let sentRequestsSnapshot = await getSentFriendRequests(currentUser.uid);


      // Show if friend request has been sent or not
      if (sentRequestsSnapshot && sentRequestsSnapshot.val()) {
        let requestees = Object.keys(sentRequestsSnapshot.val());
        users = users.map(user => {return {...user, requestSent: requestees.includes(user.id)}})
      }
      else {
        users = users.map(user => {return {...user, requestSent: false}})
      }

      // Show if friend or not
      let friendsSnapshot = await getFriends(currentUser.uid);
      if (friendsSnapshot && friendsSnapshot.val()) {
        let friendIds = Object.keys(friendsSnapshot.val());
        users = users.map(user => {return {...user, isFriend: friendIds.includes(user.id)}})
      }
      else {
        users = users.map(user => {return {...user, isFriend: false}})
      }

      // Also mark as friend if they've sent you a request
      let receivedSnapshot = await getFriendRequests(currentUser.uid);
      if (receivedSnapshot && receivedSnapshot.val()) {
        let requesters = Object.keys(receivedSnapshot.val());
        users = users.map(user => {return {...user, isFriend: requesters.includes(user.id)}})
      }

      // Don't show the current user
      users = users.filter(user => user.id !== currentUser.uid)


      setFriends(users);
      setFriendsToDisplay(users);
      setLoading(false);
  }, []);


  // Add listeners to see if you've been sent a request. If you have, mark them as a friend
  useEffect(() => {

    const unsubscribe = onValue(ref_db(database, `friendRequests/${currentUser.uid}`), (snapshot) => {
      if (snapshot.val()) {
        setRequesters(Object.keys(snapshot.val()));
      }
      else {
        setRequesters([])
      }
    });
    

    return unsubscribe;
  }, []);

   // Add listeners to see if your sent requests have changed.
   useEffect(() => {

    const unsubscribe = onValue(ref_db(database, `sentFriendRequests/${currentUser.uid}`), (snapshot) => {
      if (snapshot.val()) {
        setRequestees(Object.keys(snapshot.val()));
      }
      else {
        setRequestees([])
      }
    });
    

    return unsubscribe;
  }, []);

  // Add listener to see if someone has accepted your request. Not super necessary? Also assumes that you can't stop being friends
  useEffect(() => {

    const unsubscribe = onValue(ref_db(database, `friends/${currentUser.uid}`), (snapshot) => {
      if (snapshot.val()) {
        setNewFriends(Object.keys(snapshot.val()));
      }
      else {
        setNewFriends([])
      }
    });
    

    return unsubscribe;
  }, []);

  // Update display based on new friend requests
  useEffect(() => {
    let temp = [...friends]
    temp = temp.map(user => {return {...user, isFriend: requesters.includes(user.id) || user.isFriend}})
    setFriends(temp)
    setFriendsToDisplay(temp)
  }, [requesters])

  // Update display based on accepted friend requests. 
  useEffect(() => {
    let temp = [...friends]
    temp = temp.map(user => {return {...user, isFriend: newFriends.includes(user.id), requestSent: (user.requestSent && !newFriends.includes(user.id))}})
    setFriends(temp)
    setFriendsToDisplay(temp)
  }, [newFriends])

  // Update display based on new sent friend requests
  useEffect(() => {
    let temp = [...friends]
    temp = temp.map(user => {return {...user, requestSent: requestees.includes(user.id)}})
    setFriends(temp)
    setFriendsToDisplay(temp)
  }, [requestees])


  // For rendering contacts with accounts
  const renderItem = ({item}) => {
    return <ExistingContact contact={item}/>
  };

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
        placeholder="Search All Users"
        onChangeText={handleSearch}
        value={search}
        containerStyle={styles.search}
        platform="ios"
        inputStyle={{backgroundColor: COLORS.lightGrey}}
        inputContainerStyle={[{backgroundColor: COLORS.lightGrey},{ height: 40 }]}   
      />
      {
        friends.length === 0 ?
        <Text style={{flex: 1, fontSize: 20, color: COLORS.darkGrey}}>You have no friends :(</Text>
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
    borderRadius: 50,
    marginRight: 10,
    marginLeft: 10,
  },

})