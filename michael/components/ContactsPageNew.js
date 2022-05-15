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
import { useIsFocused, useNavigation } from '@react-navigation/native';
import ContactEntry from './ContactEntry';
import ExistingContact from './ExistingContact';
import FriendRequest from './FriendRequest';
import { useFriends } from '../contexts/FriendsContext';

export default function ContactsPageNew({ navigation }) {

  const { currentUser } = useAuth();

  const isFocused = useIsFocused();

  // const { allExistingGlobal, setAllExistingGlobal, allFriendRequestsGlobal, setAllFriendRequestsGlobal } = useFriends();

  const [contactStatus, setContactStatus] = useState('');
  const [search, setSearch] = useState('');
  const [sectionData, setSectionData] = useState();
  const [allExistingAccounts, setAllExistingAccounts] = useState();
  const [allOtherContacts, setAllOtherContacts] = useState();
  const [allFriendRequests, setAllFriendRequests] = useState();
  const [pageLoading, setPageLoading] = useState(true);

  // Get contact permissions
  useEffect(async () => {
    console.log('use effecting in newfriends');

    // used to filter out duplicates in existing
    const isPropValuesEqual = (subject, target, propNames) =>
      propNames.every(propName => subject[propName] === target[propName]);

    const getUniqueItemsByProperties = (items, propNames) => {
      const propNamesArray = Array.from(propNames);
    
      return items.filter((item, index, array) =>
        index === array.findIndex(foundItem => isPropValuesEqual(foundItem, item, propNamesArray))
      );
    };

    // Check permission for contacts
    const { status } = await Contacts.requestPermissionsAsync();

    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
      });

      // Check which contacts have dindin and which ones don't
      let users = await getUsers();

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
      
      // Map emails to profile pics so we can get people's images
      // let profilePics = Object.values(users).map(user => user.profilePic);
      // let profilePicNumberMap = {};
      // let profilePicEmailMap = {};
      // existingNumbers.forEach((element, index) => {
      //   profilePicNumberMap[element] = profilePics[index];
      // });
      // existingEmails.forEach((element, index) => {
      //   profilePicEmailMap[element] = profilePics[index];
      // });

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

      

      // TODO: NEED TO CHECK IF REQUEST HAS BEEN SENT FOR EXISTING ONES
      // Fuck. I think the best way to do this is just to add a 'sentFriendRequests' thing in the db,
      // then update that whenever we do stuff with friends
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


      // if (friendsSnapshot && friendsSnapshot.val()) {
      //   friendUsers = Object.keys(friendsSnapshot.val()).map(id => {return {...users[id], id: id}});
      // }

      // This is ugly, hopefully it works
      // existingAccounts = existingAccounts.map(user => {
      //   if (user.emails) {
      //     return {...user, profilePic: profilePicEmailMap[user.emails[0].email]}
      //   }
      //   if (user.phoneNumbers) {
      //     return {...user, profilePic: profilePicNumberMap[user.phoneNumbers[0].digits]}
      //   }
      // })

      // Doing the same thing as profile pic but with username
      // let usernames = Object.values(users).map(user => user.username);
      // let usernameEmailMap = {};
      // let usernameNumberMap = {};
      // existingEmails.forEach((element, index) => {
      //   usernameEmailMap[element] = usernames[index];
      // });
      // existingNumbers.forEach((element, index) => {
      //   usernameNumberMap[element] = usernames[index];
      // });

      // existingAccounts = existingAccounts.map(user => {
      //   if (user.emails) {
      //     return {...user, username: usernameEmailMap[user.emails[0].email]}
      //   }
      //   if (user.phoneNumbers) {
      //     return {...user, username: usernameEmailMap[user.phoneNumbers[0].digits]}
      //   }
      // })


      // setAllFriendRequestsGlobal(friendRequests);
      // setAllExistingGlobal(existingAccounts);

      setAllExistingAccounts(existingAccounts);
      setAllOtherContacts(otherContacts);
      setAllFriendRequests(friendRequests);
      setSectionData([{title: `Friend Requests (${friendRequests.length})`, data: friendRequests, renderItem: renderFriendRequest}, {title: `Contacts on dindin (${existingAccounts.length})`, data: existingAccounts, renderItem: renderExistingItem }, {title: `Invite Other Contacts (${otherContacts.length})`, data: otherContacts, renderItem: renderNewItem}]);
      
      setContactStatus(status);
    }
    else {
      setContactStatus(status);
    }
    setPageLoading(false);
  }, [isFocused]);

  // Jesus christ what am I doing
  // useEffect(() => {
  //   setAllFriendRequests(allFriendRequestsGlobal);
  //   setAllExistingAccounts(allExistingGlobal);
  // }, [allFriendRequestsGlobal, allExistingGlobal])

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
        // allFriendReqs={allFriendRequests}
        // setAllFriendReqs={setAllFriendRequests}
        // allExisting={allExistingAccounts}
        // setAllExisting={setAllExistingAccounts}
        currUser={currentUser}
        // handleAcceptBig={handleAcceptBig}
      />
    )
  };

  // const handleAcceptBig = async (requesterId) => {
  //   console.log(allFriendRequests);
  //   console.log(allExistingAccounts);
  //   await addFriend(requesterId, currentUser.uid);
  //   await removeFriendRequest(requesterId, currentUser.uid);
  //   setAllFriendRequests([...allFriendRequests.filter(user => user.id !== requesterId)]);
  //   setAllExistingAccounts([...allExistingAccounts.filter(user => user.id !== requesterId)]);
  //   handleSearch(search);
  // }

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
    setSectionData([{title: `Friend Requests(${friendRequests.length})`, data: friendRequests, renderItem: renderFriendRequest }, {title: `Contacts on dindin (${existing.length})`, data: existing, renderItem: renderExistingItem }, {title: `Invite Other Contacts (${otherContacts.length})`, data: otherContacts, renderItem: renderNewItem}]);
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
      <View style={{paddingLeft: 15, paddingRight: 15, width: '100%'}}>
        <Text style={styles.header}>Add and invite your friends</Text>
        </View>
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
        <Pressable style={styles.nextButton} onPress={() => navigation.navigate('CalendarSync')}>
          <Text style={styles.nextLabel}>Next</Text>
        </Pressable>
      </View>
    )
  }

  if (contactStatus === 'denied') {
    return (
      <View style={styles.container}>
        <Text style={styles.deniedText}>Please enable contacts to add your friends</Text>
        <Pressable style={styles.nextButton} onPress={() => navigation.navigate('CalendarSync')}>
          <Text style={styles.nextLabel}>Next</Text>
        </Pressable>
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
    backgroundColor: 'white',
    paddingTop: '15%',
  },
   header: {
    color: 'grey',
    fontWeight: 'bold',
    fontSize: 20,
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
    marginTop: 15,
  },
  nextLabel: {
    fontWeight: 'bold',
    color: 'white'
  },
  contactEntry: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 5,
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