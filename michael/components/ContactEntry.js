import { 
  StyleSheet, 
  Text, 
  View, 
  Pressable,
  Image,
} from 'react-native'
import React, {
} from 'react'
import { DEFUALT_PROFILE_PIC, COLORS } from '../utils/constants';
import * as SMS from 'expo-sms';


// Entry for contacts list
// Really should have made this one for contacts on app and one for others. Might change.
export default function ContactEntry({ contact }) {
  return (
    <Pressable style={styles.contactEntry} onPress={async () => {

      if (!(await SMS.isAvailableAsync())) {
        alert('It looks like this device can\'t send text invites');
        return
      }

      if (!contact.phoneNumbers && !contact.emails) {
        alert('There is no number or email saved for this contact...');
        return
      }

      if (!contact.phoneNumbers && contact.emails) {
        await SMS.sendSMSAsync(
          [contact.emails[0].email],
          'Download dindin! https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        );
        return
      }

      await SMS.sendSMSAsync(
        [contact.phoneNumbers[0].digits],
        'Download dindin! https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      );
    }}>
      {/* <View style={{...styles.profilePic, backgroundColor: `${PROFILE_COLORS[contact.firstName.charCodeAt(1) % PROFILE_COLORS.length]}`}}>
        <Text style={styles.profileLetters}>{contact.firstName[0].toUpperCase() + (contact.lastName ? contact.lastName[0].toUpperCase() : '')}</Text>
      </View> */}
      <Image
        style={styles.profilePicReal}
        source={{
          uri: DEFUALT_PROFILE_PIC + '=s100'
        }}
      />
      <View style={styles.contactName}>
        <Text style={styles.contactName}>
          {
            // Just truncating name but dang this is ugly
            (contact.firstName + ' ' + (contact.lastName ? contact.lastName : '')).substring(0,20) + ((contact.firstName + ' ' + (contact.lastName ? contact.lastName : '')).length > 20 ? '...' : '')
          }
        </Text>
      </View>
      <Text style={styles.inviteButton}>Invite</Text>
    </Pressable>
  )
};

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