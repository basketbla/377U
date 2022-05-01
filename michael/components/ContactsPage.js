import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Pressable,
  SectionList,
  Alert
} from 'react-native'
import { SearchBar } from 'react-native-elements';
import React, {
  useEffect,
  useState
} from 'react'
import * as Contacts from 'expo-contacts';
import { COLORS, PROFILE_COLORS } from '../utils/constants';
import { getUsers } from '../utils/firebase';
import * as SMS from 'expo-sms';

// Entry for contacts list
const ContactEntry = ({ contact, type }) => (
  <Pressable style={styles.contactEntry} onPress={async () => {
    
    // Invite in app instead of messaging
    if (type==="Add") {
      Alert.alert('Send Friend Request', 'I haven\'t implemented the friends stuff yet tho', [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ]);
      return
    }

    if (!contact.phoneNumbers) {
      return;
    }
    await SMS.sendSMSAsync(
      [contact.phoneNumbers[0].digits],
      'Download dindin! https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    );
  }}>
    <View style={{...styles.profilePic, backgroundColor: `${PROFILE_COLORS[contact.firstName.charCodeAt(1) % PROFILE_COLORS.length]}`}}>
      <Text style={styles.profileLetters}>{contact.firstName[0].toUpperCase() + (contact.lastName ? contact.lastName[0].toUpperCase() : '')}</Text>
    </View>
    <Text style={styles.contactName}>
      {
        // Just truncating name but dang this is ugly
        (contact.firstName + ' ' + (contact.lastName ? contact.lastName : '')).substring(0,20) + ((contact.firstName + ' ' + (contact.lastName ? contact.lastName : '')).length > 20 ? '...' : '')
      }
    </Text>
    <Text style={styles.inviteButton}>{type}</Text>
  </Pressable>
);

export default function ContactsPage({ navigation }) {


  const [contactStatus, setContactStatus] = useState('');
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [sectionData, setSectionData] = useState();

  // Get contact permissions
  useEffect(() => {
    (async () => {
      console.log('use effecting');
      const { status } = await Contacts.requestPermissionsAsync();

      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
        });
        // console.log(data.map(item => item.emails ? item.emails[0].email : undefined))
        // console.log(data);
        // setContacts(data);

        // Check which contacts have dindin and which ones don't
        let users = await getUsers();
        let existingEmails = Object.values(users).map(user => user.email);

        let existingAccounts = data.filter(user => {
          return (user.emails && existingEmails.includes(user.emails[0].email));
        })

        let otherContacts = data.filter(user => {
          return !(user.emails && existingEmails.includes(user.emails[0].email));
        })

        setSectionData([{title: "Contacts on Din Din", data: existingAccounts, renderItem: renderExistingItem }, {title: "Invite Other Contacts", data: otherContacts, renderItem: renderNewItem}]);
        setContactStatus(status);
      }
      else {
        setContactStatus(status);
      }
    })();
  }, []);

  // For rendering contacts with accounts
  const renderExistingItem = ({item}) => {
    if (item.firstName && item.firstName.startsWith(search)) {
      return <ContactEntry contact={item} type="Add"/>
    }
    else {
      return <></>
    }
  };

   // For rendering contacts without accounts
   const renderNewItem = ({item}) => {
    if (item.firstName && item.firstName.startsWith(search)) {
      return <ContactEntry contact={item} type="Invite"/>
    }
    else {
      return <></>
    }
  };

  const handleNext = () => {
    navigation.navigate('CalendarSync')
  }
  
  if (contactStatus === 'granted') {
    return (
      <View style={styles.container}>
        <SearchBar
          placeholder="Search for Contact"
          onChangeText={text => setSearch(text)}
          value={search}
          containerStyle={styles.search}
          platform="ios"
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
        />
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextLabel}>Next</Text>
        </Pressable>
      </View>
    )
  }

  if (contactStatus === 'blocked') {
    return (
      <View style={styles.container}>
        <Text>blocked</Text>
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
    width: '100%',
    marginTop: 50,
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
  }
})