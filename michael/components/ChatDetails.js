import { StyleSheet, Text, View, Pressable, ScrollView, ActivityIndicator, Image } from 'react-native'
import React, {
  useEffect,
  useState
} from 'react'
import { COLORS } from '../utils/constants';
import { getUsers } from '../utils/firebase';
import BlandUser from './BlandUser';

export default function ChatDetails({ route, navigation }) {
  
  const { group } = route.params;

  const [freeNow, setFreeNow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(async () => {
    // Really need to share all users throughout app
    let users = await getUsers();
    setAllUsers(users);
    setLoading(false);
  }, [])

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <Text style={styles.detailText}>
        Group name: 
        <Text style={styles.groupName}>
          {' ' + group.name}
        </Text>
      </Text>
      <Pressable onPress={() => navigation.navigate('EditName', {group: group})}>
        <Text style={styles.editNameText}>Edit group name</Text>
      </Pressable>
      <Text style={styles.detailText}>Free now:</Text>
      {
        loading ?
        <ActivityIndicator/>
        :
        <>
          {
            Object.keys(group.users).filter(userId => allUsers[userId].isFree).map(id => {
              return (
                <BlandUser contact={allUsers[id]} key={id}/>
              )
            })
          }
        </>
      }
      <Text style={styles.detailText}>Group members:</Text>
      {
        loading ?
        <ActivityIndicator/>
        :
        <>
          {
            Object.keys(group.users).map(id => {
              return (
                <BlandUser contact={allUsers[id]} key={id}/>
              )
            })
          }
        </>
      }

    </ScrollView>
  )
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
  acceptRequestText: {
    fontWeight: 'bold',
    color: 'white'
  }
})