import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Pressable,
  SectionList,
  Image,
  Keyboard,
  ActivityIndicator
} from 'react-native'
import { SearchBar } from 'react-native-elements';
import React, {
  useEffect,
  useState
} from 'react'
import * as Contacts from 'expo-contacts';
import { COLORS, DEFUALT_PROFILE_PIC } from '../utils/constants';
import { addFriend, getFriendRequests, getFriends, getSentFriendRequests, getUsers, removeFriendRequest } from '../utils/firebase';
import * as SMS from 'expo-sms';
import { useAuth } from '../contexts/AuthContext'
import { useIsFocused } from '@react-navigation/native';
import ContactEntry from './ContactEntry';
import ExistingContact from './ExistingContact';
import FriendRequest from './FriendRequest';
import { useFriends } from '../contexts/FriendsContext';
import { onChildChanged, onChildAdded, ref as ref_db, onValue } from 'firebase/database';
import { database } from '../utils/firebase'


export default function NewFriends({ navigation }) {

  const { currentUser } = useAuth();
  const { allUsers, setAllUsers } = useFriends();

  const isFocused = useIsFocused();

  const [contactStatus, setContactStatus] = useState('');
  const [search, setSearch] = useState('');
  const [sectionData, setSectionData] = useState();
  const [allExistingAccounts, setAllExistingAccounts] = useState([]);
  const [allOtherContacts, setAllOtherContacts] = useState([]);
  const [allFriendRequests, setAllFriendRequests] = useState();
  const [pageLoading, setPageLoading] = useState(true);

  // Get contact permissions
  useEffect(async () => {
    console.log('use effecting in newfriends');

    // Check permission for contacts
    const { status } = await Contacts.requestPermissionsAsync();

    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
      });

      // Check which contacts have dindin and which ones don't
      let users = allUsers;

      // Get friendRequests
      let friendRequests = await getFriendRequests(currentUser.uid);
      if (friendRequests && friendRequests.val()) {
        let friendRequestIds = Object.keys(friendRequests.val());
        friendRequests = friendRequestIds.map(id => (
          {...users[id], id: id}
        ));
      }
      else {
        friendRequests = [];
      }
      let friendRequestNumbers = friendRequests.map(user => user.phoneNumber);
      let friendRequestEmails = friendRequests.map(user => user.email);

      let existingEmails = Object.values(users).map(user => user.email);
      let existingNumbers = Object.values(users).map(user => user.phoneNumber);

      let existingAccounts = data.filter(user => {
        // Exclude friend requests
        if (user.emails && friendRequestEmails.includes(user.emails[0].email)) {
          return false;
        }
        if (user.phoneNumbers && friendRequestNumbers.includes(user.phoneNumbers[0].digits)) {
          return false;
        }

        // Include the data that's in the existing emails OR phone numbers
        if (user.firstName) {
          if (user.emails && existingEmails.includes(user.emails[0].email)) {
            return true;
          }
          if (user.phoneNumbers && existingNumbers.includes(user.phoneNumbers[0].digits)) {
            return true;
          }
        }
        return false;
      })

      let otherContacts = data.filter(user => {
        return (!existingAccounts.includes(user) && user.firstName);
      })

      // Could save a lot of effort if we just map existing user contacts to actual user objects
      let userList = Object.keys(users).map(key => {
        return {...users[key], id: key}
      })

      existingAccounts = existingAccounts.map(contact => {
        // Oh shit this may be inefficient... whatever
        if (contact.phoneNumbers) {
          return userList.filter(user => user.phoneNumber === contact.phoneNumbers[0].digits)[0]
        }
        if (contact.emails) {
          return userList.filter(user => user.email === contact.emails[0].email)[0]
        }
        return null;
      })

      let sentRequestsSnapshot = await getSentFriendRequests(currentUser.uid);
      if (sentRequestsSnapshot && sentRequestsSnapshot.val()) {
        let requestees = Object.keys(sentRequestsSnapshot.val());
        existingAccounts = existingAccounts.map(user => {return {...user, requestSent: requestees.includes(user.id)}})
      }
      else {
        existingAccounts = existingAccounts.map(user => {return {...user, requestSent: false}})
      }

      // Filter out the existingFriends
      let friendsSnapshot = await getFriends(currentUser.uid);
      if (friendsSnapshot && friendsSnapshot.val()) {
        let friendIds = Object.keys(friendsSnapshot.val());
        existingAccounts = existingAccounts.filter(user => !friendIds.includes(user.id))
      }

      // For now just taking friends out, so setting isFriend to false
      existingAccounts = existingAccounts.map(user => {return {...user, isFriend: false}})

      // Filter out duplicates (same contact saved twice)
      existingAccounts = existingAccounts.filter((v,i,a)=>a.findIndex(v2=>(v2.id===v.id))===i)

      setAllExistingAccounts(existingAccounts);
      setAllOtherContacts(otherContacts);
      // setAllFriendRequests(friendRequests);
      // setSectionData([{title: `Friend Requests (${friendRequests.length})`, data: friendRequests, renderItem: renderFriendRequest}, {title: `Contacts on Din Din (${existingAccounts.length})`, data: existingAccounts, renderItem: renderExistingItem }, {title: `Invite Other Contacts (${otherContacts.length})`, data: otherContacts, renderItem: renderNewItem}]);
      
      setContactStatus(status);
    }
    else {
      setContactStatus(status);
    }
    setPageLoading(false);
  }, []);


  // Add listeners to see if friend requests have changed
  useEffect(() => {

    // Wasting a time setting friendRequests the first time, but I think it's fine
    const unsubscribe = onValue(ref_db(database, `friendRequests/${currentUser.uid}`), async (friendRequests) => {
      console.log('Friend request listener fired')
      if (friendRequests && friendRequests.val()) {
        let friendRequestIds = Object.keys(friendRequests.val());

        // This is hacky. But if we get a friend request that's not in allUsers, just update allUsers
        let shouldRefresh = false;
        for (let id of friendRequestIds) {
          if (allUsers[id] === undefined) {
            shouldRefresh = true;
          }
        }

        let newAllUsers = allUsers;
        if (shouldRefresh) {
          newAllUsers = await getUsers();
          setAllUsers(newAllUsers)
        }

        friendRequests = friendRequestIds.map(id => (
          {...newAllUsers[id], id: id}
        ));
      }
      else {
        friendRequests = [];
      }
      setAllFriendRequests(friendRequests);
      setSectionData([{title: `Friend Requests (${friendRequests.length})`, data: friendRequests, renderItem: renderFriendRequest}, {title: `Contacts on Din Din (${allExistingAccounts.length})`, data: allExistingAccounts, renderItem: renderExistingItem }, {title: `Invite Other Contacts (${allOtherContacts.length})`, data: allOtherContacts, renderItem: renderNewItem}]);
    });
    

    return unsubscribe;
  }, [allExistingAccounts, allOtherContacts]);

  // For rendering contacts with accounts
  const renderExistingItem = ({item}) => {
    return <ExistingContact contact={item}/>
  };

  // For rendering contacts without accounts
  const renderNewItem = ({item}) => {
    return <ContactEntry contact={item}/>
  };

  // For rendering contacts without accounts
  const renderFriendRequest = ({item}) => {
    return (
      <FriendRequest 
        contact={item} 
        currUser={currentUser}
      />
    )
  };

  const handleNext = () => {
    navigation.navigate('CalendarSync');
  }

  const handleSearch = text => {
    setSearch(text);
    text = text.toLowerCase();
    let existing = allExistingAccounts.filter(item => (item.firstName + ' ' + item.lastName).toLowerCase().includes(text));
    let otherContacts = allOtherContacts.filter(item => (item.firstName + ' ' + item.lastName).toLowerCase().includes(text));

    // change this to actually get friend requests
    let friendRequests = allFriendRequests.filter(item => (item.name.toLowerCase().includes(text) || item.username.toLowerCase().includes(text)));
    setSectionData([{title: `Friend Requests(${friendRequests.length})`, data: friendRequests, renderItem: renderFriendRequest }, {title: `Contacts on Din Din (${existing.length})`, data: existing, renderItem: renderExistingItem }, {title: `Invite Other Contacts (${otherContacts.length})`, data: otherContacts, renderItem: renderNewItem}]);
  }

  if (pageLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator/>
      </View>
    )
  }
  
  if (contactStatus === 'granted') {
    return (
      <View style={styles.container}>
        <SearchBar
          placeholder="Search Contacts"
          onChangeText={handleSearch}
          value={search}
          containerStyle={styles.search}
          platform="ios"
          inputStyle={{backgroundColor: COLORS.lightGrey}}
          inputContainerStyle={[{backgroundColor: COLORS.lightGrey},{ height: 40 }]}   
        />
        <SectionList
          stickySectionHeadersEnabled={true}
          sections={sectionData}
          // renderItem={renderItem}
          renderItem={({ section: { renderItem } }) => <View>{renderItem}</View>}
          keyExtractor={item => item.id}
          style={styles.contactList}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          maxToRenderPerBatch={10}
          onScrollEndDrag={() => Keyboard.dismiss() }
          onScrollBeginDrag={() => Keyboard.dismiss() }
        />
      </View>
    )
  }

  if (contactStatus === 'denied') {
    return (
      <View style={styles.container}>
        <Text style={styles.deniedText}>Please enable contacts to add your friends</Text>
        {/* <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextLabel}>Next</Text>
        </Pressable> */}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text>Loading...</Text>
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

  sectionHeader: {
    width: '100%',
    height: 35,
    backgroundColor: 'white',
    color: 'black',
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 10,
    paddingTop: 7,
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

  addButton: {
    marginLeft: 'auto',
    marginRight: 20,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    width: 100,
  },
  addButtonText: {
    textAlign: 'center',
  }
})