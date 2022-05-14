import { StyleSheet, Text, View, Pressable, ScrollView, ActivityIndicator, Image } from 'react-native'
import React, {
  useEffect,
  useState
} from 'react'
import { COLORS } from '../utils/constants';
import { getUsers } from '../utils/firebase';

export default function BlandUser({ contact }) {

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
            contact.name.substring(0, 16) + (contact.name.length > 16 ? '...' : '')
          }
        </Text>
        <Text style={styles.contactUsername}>
          {contact.username}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingLeft: 5
  },
  detailText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.grey,
    marginTop: 20,
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  editNameText: {
    color: COLORS.iosBlue,
    fontSize: 15,
    marginTop: 10
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