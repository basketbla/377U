import { 
  Text, 
  View, 
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator
} from 'react-native'
import React, {
  useState
} from 'react'
import { COLORS } from '../utils/constants';
import { addFriendRequest, addSentFriendRequest } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';


export default function ExistingContact({ contact }) {

  const { currentUser } = useAuth();

  const [sent, setSent] = useState(contact.requestSent);
  const [loading, setLoading] = useState(false);

  const handleSendRequest = async () => {
    setLoading(true);
    await addFriendRequest(currentUser.uid, contact.id);
    await addSentFriendRequest(currentUser.uid, contact.id);
    setSent(true);
    setLoading(false);
  }

  return (
    <View style={styles.contactEntry}>
      {/* <View style={{...styles.profilePic, backgroundColor: `${PROFILE_COLORS[contact.firstName.charCodeAt(1) % PROFILE_COLORS.length]}`}}>
        <Text style={styles.profileLetters}>{contact.firstName[0].toUpperCase() + (contact.lastName ? contact.lastName[0].toUpperCase() : '')}</Text>
      </View> */}
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
            contact.name.substring(0, 16) + (contact.name.length > 16 ? '...' : '')
          }
        </Text>
        <Text style={styles.contactUsername}>
          {contact.username}
        </Text>
      </View>
      {
        contact.isFriend ?
        <></>
        :
        <Pressable style={(sent || loading) ? styles.acceptRequestButtonDisabled : styles.acceptRequestButton} onPress={handleSendRequest} disabled={sent || loading}>
          {
            loading ?
            <ActivityIndicator/>
            :
            <>
              {
                sent ?
                <Text style={styles.acceptRequestText}>Sent!</Text>
                :
                <Text style={styles.acceptRequestText}>Add</Text>
              }
            </>
          }
        </Pressable>
      }
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
    width: 70,
  },
  acceptRequestButtonDisabled: {
    backgroundColor: COLORS.yellow,
    marginLeft: 'auto',
    alignItems: 'center',
    marginRight: 15,
    borderRadius: 10,
    padding: 10,
    width: 70,
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
  },
})