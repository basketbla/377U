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
import { getFriendRequests, getFriends, getUsers, removeFriend, getSentFriendRequests } from '../utils/firebase';
import * as SMS from 'expo-sms';
import { useAuth } from '../contexts/AuthContext';
import { useIsFocused } from "@react-navigation/native";
import ExistingContact from './ExistingContact';

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

  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState([]);
  const [friendsToDisplay, setFriendsToDisplay] = useState([]);
  const [loading, setLoading] = useState(true);


  // Fetch all friends
  useEffect(async () => {
      let users = await getUsers();
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

      // Don't show the current user
      users = users.filter(user => user.id !== currentUser.uid)


      setFriends(users);
      setFriendsToDisplay(users);
      setLoading(false);
  }, [isFocused]);

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
    borderRadius: 50,
    marginRight: 10,
    marginLeft: 10,
  },

})