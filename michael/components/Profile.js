import { StyleSheet, Text, View, Image, ActivityIndicator, Pressable } from 'react-native'
import React, {
  useEffect,
  useState
} from 'react'
import { getCurrentUser } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useIsFocused } from "@react-navigation/native";

export default function Profile({ navigation }) {

  const { currentUser } = useAuth();

  // Used to load screen on navigate back
  const isFocused = useIsFocused();
  
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState();

  // Fetch user data from firebase on load
  useEffect(async () => {
    console.log('use effect on profile screen')
    let userStuff = (await getCurrentUser(currentUser.uid));
    setUserDetails(userStuff)
    setLoading(false);
  }, [isFocused]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator/>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.container} onPress={() => navigation.navigate('EditProfile', {userDetails: userDetails})}>
        <Image
          style={styles.profilePic}
          source={{
            uri: userDetails.profilePic + '=s400'
          }}
        />
        <Text style={styles.name}>{userDetails.name}</Text>
        <Text style={styles.username}>{`@${userDetails.username}`}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePic: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 30,
    marginTop: 10,
  },
  username: {
    fontSize: 20,
  },
})