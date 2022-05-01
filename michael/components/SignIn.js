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

  const { currentUser, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [validating, setValidating] = useState(false);

  const handleNext = () => {
    setError(false);
    setValidating(true);

    login(email, password).then(result => {
      setValidating(false);

      // Change this to the landing page
      navigation.navigate('Username');
    }).catch(error => {
      setValidating(false);
      switch (error.code) {
        case 'auth/invalid-email':
          setError(true);
          setErrorText('Please enter a valid email');
          break;
        case 'auth/user-disabled':
          setError(true);
          setErrorText('This account is disabled');
          break;
        case 'auth/user-not-found':
          setError(true);
          setErrorText('No account exists for this email');
          break;
        case 'auth/wrong-password':
          setError(true);
          setErrorText('Incorrect email or password');
          break;
        default:
          setError(true);
          setErrorText(error.message);
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
          style={error ? styles.errorInput : styles.input}
          placeholder="Email address"
          onChangeText={input => setEmail(input)}
          onSubmitEditing={Keyboard.dismiss}
        />
        <TextInput
          style={error ? styles.errorInput : styles.input}
          placeholder="Password"
          secureTextEntry
          onChangeText={input => setPassword(input)}
          onSubmitEditing={Keyboard.dismiss}
        />
        <Text style={{...styles.errorText, display: error ? 'flex' : 'none'}}>{errorText}</Text>
        <Pressable style={email === '' || password === '' ? styles.disabledNextButton : styles.nextButton} onPress={handleNext} disabled={email === '' || password === '' || validating}>
          {
            validating ?
            <ActivityIndicator/>
            :
            <Text style={styles.nextLabel}>Next</Text>
          }
        </Pressable>
        <View style={styles.bottomBanner}>
          <Text style={styles.haveAccount}>Don't have an account? </Text>
          <Text style={styles.signInButton} onPress={() => navigation.navigate('SignUp')}>Sign Up.</Text>
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