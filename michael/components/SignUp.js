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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

export default function SignUp() {

  const navigation = useNavigation();

  const { currentUser, signup } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [validating, setValidating] = useState(false);
  const [passwordErrorText, setPasswordErrorText] = useState('');
  const [emailErrorText, setEmailErrorText] = useState('');

  const handleNext = () => {
    setPasswordError(false);
    setEmailError(false);
    setValidating(true);

    if (password !== confirmPassword) {
      console.log(password)
      console.log(confirmPassword)
      setValidating(false);
      setPasswordError(true);
      setPasswordErrorText('Passwords do not match');
      return;
    }

    signup(email, password).then(result => {
      setValidating(false);
      navigation.navigate('Username');
    }).catch(error => {
      setValidating(false);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setEmailError(true);
          setEmailErrorText('A user already exists with that email');
          break;
        case 'auth/invalid-email':
          setEmailError(true);
          setEmailErrorText('Please enter a valid email');
          break;
        case 'auth/operation-not-allowed':
          setEmailError(true);
          setEmailErrorText('There was an error. Please try again.');
          break;
        case 'auth/weak-password':
          setPasswordError(true)
          setPasswordErrorText('Passwords must be 6 characters or more');
          break;
        default:
          setEmailError(true);
          setEmailErrorText(error.message);
          break;
        }
    });
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.logo}>Din Din</Text>
        <Text style={styles.explainer}>Sign up to find shared freetime with friends</Text>
        <TextInput
          style={emailError ? styles.errorInput : styles.input}
          placeholder="Email address"
          onChangeText={input => setEmail(input)}
          onSubmitEditing={Keyboard.dismiss}
        />
        <Text style={{...styles.errorText, display: emailError ? 'flex' : 'none'}}>{emailErrorText}</Text>
        <TextInput
          style={passwordError ? styles.errorInput : styles.input}
          placeholder="Password"
          secureTextEntry
          onChangeText={input => setPassword(input)}
          onSubmitEditing={Keyboard.dismiss}
        />
        <Text style={{...styles.errorText, display: passwordError ? 'flex' : 'none'}}>{passwordErrorText}</Text>
        <TextInput
          style={passwordError ? styles.errorInput : styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          onChangeText={input => setConfirmPassword(input)}
          onSubmitEditing={Keyboard.dismiss}
        />
        <Pressable style={email === '' || password === '' || confirmPassword === '' ? styles.disabledNextButton : styles.nextButton} onPress={handleNext} disabled={email === '' || password === '' || confirmPassword === '' || validating}>
          {
            validating ?
            <ActivityIndicator/>
            :
            <Text style={styles.nextLabel}>Next</Text>
          }
        </Pressable>
        <View style={styles.bottomBanner}>
          <Text style={styles.haveAccount}>Alredy have an account? </Text>
          <Text style={styles.signInButton} onPress={() => navigation.navigate('SignIn')}>Sign In.</Text>
        </View>
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