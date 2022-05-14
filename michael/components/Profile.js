import { StyleSheet, Text, View, Image, ActivityIndicator, Pressable, Button, Alert, Switch } from 'react-native'
import React, {
  useEffect,
  useState
} from 'react'
import { getCurrentUser } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useIsFocused } from "@react-navigation/native";
import { COLORS } from '../utils/constants';
import { setAvailability, getAvailability} from '../utils/firebase';

export default function Profile({ navigation }) {

  const { currentUser, userFirebaseDetails, logout, setUserFirebaseDetails} = useAuth();

  // Used to load screen on navigate back
  const isFocused = useIsFocused();
  
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState();
  const [isFree, setIsFree] = useState(true);

  const handleChangeAvailability = async () => {
    let newAvailability = !isFree;
    setIsFree(newAvailability);
    await setAvailability(currentUser.uid, newAvailability);
    setUserFirebaseDetails({...userFirebaseDetails, isFree: newAvailability})
  }


  // Fetch user data from firebase on load
  useEffect(async () => {
    console.log('use effect on profile screen')
    // let userStuff = await getCurrentUser(currentUser.uid);
    setUserDetails(userFirebaseDetails);
    setIsFree(userFirebaseDetails.isFree);
    setLoading(false);
  }, [isFocused]);

  const confirmSignOut = () => {
    Alert.alert(
      "Are you sure you want to sign out?",
      undefined,
      [
        { text: "Cancel", onPress: undefined, style: "cancel" },
        {
          text: "Sign Out",
          onPress: async () => await logout()
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator/>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Pressable style={[styles.clickableProfile,{paddingTop: '20%'}]} onPress={() => navigation.navigate('EditProfile', {userDetails: userDetails})}>
        <Image
          style={styles.profilePic}
          source={{
            uri: userDetails.profilePic + '=s400'
          }}
        />
        <Text style={styles.name}>{userDetails.name}</Text>
        <Text style={styles.username}>{`@${userDetails.username}`}</Text>
      </Pressable>
      <View style={styles.freeButtonContainer}>
        <Text style={styles.freeButtonLabel}>
          {
            isFree ? "Available" : "Unavailable"
          }
        </Text>
        <Switch
          trackColor={{ false: "#767577", true: COLORS.iosBlue }}
          thumbColor={"#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={handleChangeAvailability}
          value={isFree}
        />
      </View>
      <Button title="Sign Out" onPress={confirmSignOut}/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clickableProfile: {
    alignItems: 'center', 
    marginBottom: 50,
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
  freeButtonContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  freeButtonLabel: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10
  }
})