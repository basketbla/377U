import { 
  StyleSheet, 
  Text, 
  View, 
  Pressable,
  Image,
  ActivityIndicator
} from 'react-native'
import React, {
  useEffect,
  useState
} from 'react'
import { COLORS } from '../utils/constants';
import { useFriends } from '../contexts/FriendsContext';
import { addFriend, removeFriendRequest, removeSentFriendRequest } from '../utils/firebase';


export default function FriendRequest({ contact, currUser }) {

  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  // const [allFriendsSmall, setAllFriendsSmall] = useState(allFriendReqs);
  // const [allExistingSmall, setAllExistingSmall] = useState(allExisting);

  // const { allExistingGlobal, setAllExistingGlobal, allFriendRequestsGlobal, setAllFriendRequestsGlobal } = useFriends();

  // useEffect(() => {
  //   setAllFriendsSmall(allFriendRequestsGlobal);
  //   setAllExistingSmall(setAll)
  // }, [allFriendRequestsGlobal])

  // Since this was so FUCKING hard to do I'm just gonna disable button when added
  const handleAccept = async () => {
    setLoading(true);
    // await handleAcceptBig(contact.id);
    await addFriend(contact.id, currUser.uid);
    await removeFriendRequest(contact.id, currUser.uid);
    await removeSentFriendRequest(contact.id, currUser.uid);
    // setAllFriendRequestsGlobal([...allFriendRequestsGlobal.filter(user => user.id !== contact.id)]);
    // setAllExistingGlobal([...allExistingGlobal.filter(user => user.id !== contact.id)]);
    setAccepted(true);
    setLoading(false);
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
            contact.name.substring(0, 18) + (contact.name.length > 18 ? '...' : '')
          }
        </Text>
        <Text style={styles.contactUsername}>
          {contact.username}
        </Text>
      </View>
      <Pressable style={(accepted || loading) ? styles.acceptRequestButtonDisabled : styles.acceptRequestButton} onPress={handleAccept} disabled={loading}>
        {
          loading ?
          <ActivityIndicator/>
          :
          <>
          {
            accepted ? 
            <Text style={styles.acceptRequestText}>Accepted!</Text>
            :
            <Text style={styles.acceptRequestText}>Accept</Text>
          }
          </>
        }
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  search: {
    width: '100%',
  },
  nextButton: {
    width: '80%',
    backgroundColor: COLORS.blue,
    height: 50,
    borderRadius: 5,
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
    width: '100%',
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
  inviteButton: {
    marginLeft: 'auto',
    textAlign: 'center',
    marginRight: 20,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    width: 100,
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
    backgroundColor: COLORS.blue,
    marginLeft: 'auto',
    alignItems: 'center',
    marginRight: 20,
    borderRadius: 10,
    padding: 10,
    width: 100,
  },
  acceptRequestButtonDisabled: {
    backgroundColor: COLORS.blue,
    marginLeft: 'auto',
    alignItems: 'center',
    marginRight: 20,
    borderRadius: 10,
    padding: 10,
    width: 100,
    opacity: 0.5,
  },
  acceptRequestText: {
    fontWeight: 'bold',
    color: 'white'
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