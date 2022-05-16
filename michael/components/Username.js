import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Pressable
} from 'react-native'
import React, {
  useState
} from 'react'
import { COLORS, DEFUALT_PROFILE_PIC } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';
import { getUsers, saveUserDetails } from '../utils/firebase';

export default function Username({ navigation }) {

  const { currentUser, signup, setUserFirebaseDetails } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorText, setUsernameErrorText] = useState('');
  const [nameError, setNameError] = useState(false);
  const [nameErrorText, setNameErrorText] = useState('');
  const [validating, setValidating] = useState(false);

  const handleNext = async () => {
    setUsernameError(false);
    setNameError(false);
    setValidating(true);

    if (!name.includes(' ')) {
      setNameError(true);
      setNameErrorText('Please enter you full name (first and last)');
      setValidating(false);
      return;
    }

    let usernames = Object.values(await getUsers()).map(item => item.username);

    if (usernames.includes(username)) {
      setValidating(false);
      setUsernameError(true);
      setUsernameErrorText('That username is already taken');
      return;
    }


    // Changed this to save phone number instead of email.
    saveUserDetails(currentUser.uid, name, username, currentUser.phoneNumber, DEFUALT_PROFILE_PIC).then(result => {
      setValidating(false);
      setUserFirebaseDetails({
        name: name,
        username: username,
        phoneNumber: currentUser.phoneNumber,
        profilePic: DEFUALT_PROFILE_PIC,
        uid: currentUser.uid,
        isFree: true,
        pushToken: null,
      })
      navigation.navigate('AddProfilePic')
    })
    .catch(error => {
      console.log(error);
      setValidating(false);
      setUsernameError(true);
      setUsernameErrorText('There was an error contacting the database, try again')
    })
  }


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.explainer}>Please enter your full name and username</Text>
        <TextInput
          style={nameError ? styles.errorInput : styles.input}
          placeholder="Full Name"
          onChangeText={input => setName(input)}
          onSubmitEditing={Keyboard.dismiss}
        />
        <Text style={{...styles.errorText, display: nameError ? 'flex' : 'none'}}>{nameErrorText}</Text>
        <TextInput
          style={usernameError ? styles.errorInput : styles.input}
          placeholder="Username"
          onChangeText={input => setUsername(input)}
          onSubmitEditing={Keyboard.dismiss}
        />
        <Text style={{...styles.errorText, display: usernameError ? 'flex' : 'none'}}>{usernameErrorText}</Text>

        <Pressable style={username === '' ? styles.disabledNextButton : styles.nextButton} onPress={handleNext} disabled={validating}>
          {
            validating ?
            <ActivityIndicator/>
            :
            <Text style={styles.nextLabel}>Next</Text>
          }
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  logo: {
    fontSize: 50,
    marginTop: 100,
  },
  explainer: {
    color: COLORS.grey,
    textAlign: 'center', 
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: '20%',
    marginBottom: '5%',
    margin:20
  },
  bottomBanner: {
    position: 'absolute',
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: 'lightgrey',
    width: '100%',
    height: '10%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  haveAccount: {
    color: COLORS.grey
  },
  signInButton: {
    color: COLORS.yellow,
    fontWeight: 'bold'
  },
  input: {
    width: '80%',
    backgroundColor: 'white',
    height: 50,
    paddingLeft: 20,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#cfcfcf',
    marginTop: 10,
  },
  errorInput: {
    width: '80%',
    backgroundColor: '#ededed',
    height: 50,
    paddingLeft: 20,
    borderRadius: 10,
    borderWidth: 0.5,
    marginTop: 20,
    borderColor: 'red',
  },
  nextButton: {
    width: '80%',
    backgroundColor: COLORS.yellow,
    height: 50,
    borderRadius: 10,
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 20,
  },
  disabledNextButton: {
    width: '80%',
    backgroundColor: COLORS.yellow,
    opacity: 0.5,
    height: 50,
    borderRadius: 10,
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 20,
  },
  nextLabel: {
    fontWeight: 'bold',
    color: 'white'
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  }
})