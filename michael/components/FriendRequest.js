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
import { COLORS, NOTIFICATION_TYPES } from '../utils/constants';
import { useFriends } from '../contexts/FriendsContext';
import { addFriend, removeFriendRequest, removeSentFriendRequest } from '../utils/firebase';
import { sendPushNotification } from '../utils/expo';
import { useAuth } from '../contexts/AuthContext';


export default function FriendRequest({ contact, currUser }) {

  const { userFirebaseDetails } = useAuth();
  const { allUsers } = useFriends();

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

    if (allUsers[contact.id]?.pushToken) {
      sendPushNotification(`${userFirebaseDetails.name} accepted your friend request!`, 'Go send them a message!', allUsers[contact.id].pushToken, { type: NOTIFICATION_TYPES.friendRequestAccepted })
    }
    // setAllFriendRequestsGlobal([...allFriendRequestsGlobal.filter(user => user.id !== contact.id)]);
    // setAllExistingGlobal([...allExistingGlobal.filter(user => user.id !== contact.id)]);
    // setAccepted(true);
    // setLoading(false);
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
            contact.name ? contact.name.substring(0, 16) + (contact.name.length > 16 ? '...' : '') : ''
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
            <Text style={styles.acceptRequestText}>Added!</Text>  
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
    marginRight: 15,
    borderRadius: 10,
    padding: 10,
    width: 80,
  },
  acceptRequestButtonDisabled: {
    backgroundColor: COLORS.yellow,
    marginLeft: 'auto',
    alignItems: 'center',
    marginRight: 15,
    borderRadius: 10,
    padding: 10,
    width: 80,
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