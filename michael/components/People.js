import { StyleSheet, Text, View, Pressable, FlatList, Image, ActivityIndicator } from 'react-native'
import React, {
  useState,
  useEffect
} from 'react'
import { colors, SearchBar } from 'react-native-elements';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, DEFUALT_PROFILE_PIC } from '../utils/constants';
import { getFriends, getUsers, getCurrentUser, getUserGroups } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext'
import { useNavigation } from '@react-navigation/native';

const FreeNow = ({ user }) => (
  <Pressable style={styles.freeNow}>
    <Image
      style={styles.profilePic}
      source={{
        uri: user.profilePic
      }}
    />
    <Text style={styles.freeNowText} numberOfLines={1}>{user.name.indexOf(' ') === -1 ? user.name : user.name.substr(0, user.name.indexOf(' '))}</Text>
  </Pressable>
);

const Group = ({ group }) => {

  const navigation = useNavigation();

  return (
    <Pressable onPress={() => navigation.navigate('Chat', {group: group})} style={styles.groupEntry}>
      <View style={styles.groupEntryTextContainer}>
        <Text style={styles.groupEntryName}>{group.name}</Text>
        <Text style={styles.groupEntryFree}>{`${group.numFree}/${group.totalNum} free`}</Text>
      </View>
      {/* <Pressable style={styles.contactButton}>
        <Text style={styles.contactButtonText}>Contact!</Text>
      </Pressable> */}
    </Pressable>
  )
}


export default function People({ navigation }) {

  const [search, setSearch] = useState('');
  const [temp, setTemp] = useState({});
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const { currentUser, setUserFirebaseDetails } = useAuth();

  // Still just all friends, not free friends
  useEffect(async () => {

    // Setting userFirebaseDetails here too
    let userStuff = await getCurrentUser(currentUser.uid);
    setUserFirebaseDetails({...userStuff.val(), uid: currentUser.uid});

    let userGroups = await getUserGroups(currentUser.uid);
    setGroups(userGroups.map(group => ({...group, numFree: 5, totalNum: Object.keys(group.users).length})));
    // {name: 'All Friends', numFree: 5, totalNum: 10, id: '1'}


    let friends = await getFriends(currentUser.uid);
    let friendIds = Object.keys(friends.val());
    let users = await getUsers();
    users = Object.keys(users).map(id => {return {...users[id], id: id}});
    setTemp(users.filter(user => friendIds.includes(user.id)));

    setLoading(false);
  }, [])

  const handleSearch = text => {
    setSearch(text);
  }

  const renderFreeNow = ({ item }) => (
    <FreeNow user={item}/>
  );

  const renderGroups = ({ item }) => (
    <Group group={item}/>
  );

  if (loading) {
    return (
      <View style={{...styles.container, justifyContent: 'center'}}>
        <ActivityIndicator/>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Ionicons name={'people'} size={30} color={COLORS.darkGrey} onPress={() => navigation.navigate('FriendsTab')}/>
        <Pressable style={styles.addGroup} onPress={() => navigation.navigate('CreateGroup')}>
          {/* <Text style={styles.addText}>New group</Text> */}
          {/* <Ionicons name={'add'} size={30} color={COLORS.darkGrey}/> */}
          <Ionicons name="create-outline" size={30} color={COLORS.darkGrey} />
        </Pressable>
      </View>
      <SearchBar
        placeholder="Search for Group or Person"
        onChangeText={handleSearch}
        value={search}
        containerStyle={styles.search}
        platform="ios"
      />
      <Text style={styles.freeLabel}>Free Now</Text>
      {
        temp.length === 0 ?
        <View style={styles.noFreeContainer}>
          <Text style={styles.noFreeText}>No one is free right now :(</Text>
        </View>
        :
        <FlatList
          data={Object.values(temp)}
          renderItem={renderFreeNow}
          keyExtractor={item => item.username}
          horizontal={true}
          style={styles.freeNowList}
          contentContainerStyle={styles.freeNowContainer}
          showsHorizontalScrollIndicator={false}
        />
      }
      <Text style={styles.freeLabel}>Conversations</Text>
      {
        groups.length === 0 ?
        <Text style={styles.noFriendsText}>You don't have any groups yet...</Text>
        :
        <FlatList
          // data={[{name: 'All Friends', numFree: 5, totalNum: 10, id: '1'}, {name: 'Roommates', numFree: 3, totalNum: 5, id: '2'}, {name: 'Foodies', numFree: 2, totalNum: 6, id: '3'}]}
          data={groups}
          renderItem={renderGroups}
          keyExtractor={item => item.id}
          style={styles.groupList}
          contentContainerStyle={styles.groupListContainer}
        />
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white'
  },
  search: {
    width: '100%',
  },
  topBar: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: 10,
    paddingRight: 10,
  },
  addGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addText: {
    color: COLORS.darkGrey,
    fontWeight: 'bold',
    fontSize: 15,
  },
  freeLabel: {
    marginRight: 'auto',
    marginLeft: 20,
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 5,
  },
  freeNow: {
    alignItems: 'center',
    marginLeft: 20,
    width: 70,
  },
  freeNowList: {
    width: '100%',
    height: 100,
    flexGrow: 0,
  },
  freeNowContainer: {
    paddingRight: 20,
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  freeNowText: {
    fontWeight: 'bold',
    marginTop: 5,
  },
  groupList: {
    width: '100%',
  },
  groupEntry: {
    width: '100%',
    height: 80,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 40,
  },
  groupListContainer: {
    borderBottomColor: COLORS.grey,
    borderBottomWidth: 1,
  },
  groupEntryName: {
    fontWeight: 'bold',
    fontSize: 25,
    color: COLORS.darkGrey
  },
  groupEntryFree: {
    fontSize: 15,
    color: COLORS.darkGrey
  },
  groupEntryTextContainer: {
  },
  contactButton: {
    borderWidth: 1,
    borderColor: COLORS.darkGrey,
    borderRadius: 10,
    padding: 18,
  },
  contactButtonText: {
    fontSize: 15,
    color: COLORS.darkGrey,
    fontWeight: 'bold'
  },
  noFriendsText: {
    fontSize: 20,
    color: COLORS.darkGrey,
    fontWeight: 'bold',
    marginTop: 30,
    width: '80%',
    textAlign: 'center'
  },
  noFreeContainer: {
    height: 100,
    justifyContent: 'center'
  },
  noFreeText: {
    fontSize: 15,
    color: COLORS.darkGrey,
    fontWeight: 'bold',
  }
})