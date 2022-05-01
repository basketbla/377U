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
import { COLORS } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';
import { getUsers, saveName } from '../utils/firebase';

export default function Username({ navigation }) {

  const { currentUser, signup } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorText, setUsernameErrorText] = useState('');
  const [validating, setValidating] = useState(false);

  const handleNext = async () => {
    setUsernameError(false);
    setValidating(true);

    let usernames = Object.values(await getUsers()).map(item => item.username);

    if (usernames.includes(username)) {
      setValidating(false);
      setUsernameError(true);
      setUsernameErrorText('That username is already taken');
      return;
    }


    saveName(currentUser.uid, name, username, currentUser.email).then(result => {
      setValidating(false);
      navigation.navigate('Onboarding')
    })
    .catch(error => {
      setValidating(false);
      setUsernameError(true);
      setUsernameErrorText('There was an error contacting the database, try again')
    })
  }


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.logo}>Din Din</Text>
        <Text style={styles.explainer}>Please enter your full name and username</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          onChangeText={input => setName(input)}
          onSubmitEditing={Keyboard.dismiss}
        />
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
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
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
    color: COLORS.blue,
    fontWeight: 'bold'
  },
  input: {
    width: '80%',
    backgroundColor: '#ededed',
    height: 50,
    paddingLeft: 20,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#cfcfcf',
    marginTop: 20,
  },
  errorInput: {
    width: '80%',
    backgroundColor: '#ededed',
    height: 50,
    paddingLeft: 20,
    borderRadius: 5,
    borderWidth: 0.5,
    marginTop: 20,
    borderColor: 'red',
  },
  nextButton: {
    width: '80%',
    backgroundColor: COLORS.blue,
    height: 50,
    borderRadius: 5,
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 20,
  },
  disabledNextButton: {
    width: '80%',
    backgroundColor: COLORS.blue,
    opacity: 0.5,
    height: 50,
    borderRadius: 5,
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