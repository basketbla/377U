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
  useState,
  useRef,
  useEffect
} from 'react'
import { COLORS } from '../utils/constants';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import PhoneInput from "react-native-phone-number-input";
import { FirebaseRecaptchaVerifierModal, FirebaseRecaptchaBanner } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { app, auth } from '../utils/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logEvent } from "firebase/analytics";
import { analytics } from '../utils/firebase';

export default function SignUpWithPhone() {

  const navigation = useNavigation();

  // ref needed because we pass it to verifyPhoneNumber
  const recaptchaVerifier = useRef(null);

  const { setIsNew, currentUser } = useAuth();

  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [validating, setValidating] = useState(false);
  const [verificationId, setVerificationId] = useState();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedNumber, setFormattedNumber] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [secs, setSecs] = useState(0);
  const [phoneError, setPhoneError] = useState(false);
  const [phoneErrorMessage, setPhoneErrorMessage] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');

  const phoneInput = useRef(null);

  // use effect for countdown
  useEffect(() => {
    if(secs===0){
       return;
    }

    const intervalId = setInterval(() => {
      setSecs(secs - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [secs]);

  // Prevent memory leak if user signs out and signs back in
  useEffect(() => {
    setIsNew(null);
  }, [])

  // When confirmation code is 6 digits, try to submit
  useEffect(() => {
    if(confirmationCode.length !== 6){
       return;
    }
    setValidating(true);
    submitConfirmation();
  }, [confirmationCode]);

  const handleNext = () => {
    Keyboard.dismiss();
    setPhoneError(false);
    if  (!phoneInput.current?.isValidNumber(phoneNumber)) {
      setPhoneError(true);
      setPhoneErrorMessage('Please enter a valid phone number')
      return;
    }
    handleSendCode();
  }

  const handleSendCode = () => {
    setValidating(true);
    sendVerification();
  }

  const sendVerification = async () => {
    // The FirebaseRecaptchaVerifierModal ref implements the
    // FirebaseAuthApplicationVerifier interface and can be
    // passed directly to `verifyPhoneNumber`.
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        formattedNumber,
        recaptchaVerifier.current
      );
      setVerificationId(verificationId);
      setSecs(60);
      setCodeSent(true);
      setValidating(false);
    } catch (err) {
      setValidating(false);
      setPhoneError(true);
      setPhoneErrorMessage('Something went wrong. Please try again.')
      console.log(err)
    }
  }

  const submitConfirmation = async () => {
    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        confirmationCode
      );
      // Should have put this in firebase.js but I don't want to so whatever
      let response = await signInWithCredential(auth, credential);

      // Login event for analytics
      // logEvent(analytics, 'login');

      // Only save logged in if they aren't a new user.
      if (!response._tokenResponse.isNewUser) {
        await AsyncStorage.setItem('currentUser', JSON.stringify(currentUser));
      }

      setIsNew(response._tokenResponse.isNewUser);
    } catch (err) {
      setValidating(false);
      console.log(err);
    }
  }


          // <Text style={styles.logo}>Din Din</Text>


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={app.options}
          attemptInvisibleVerification
        />
        <Text style={styles.explainer}>Sign-in with your phone number</Text>
        {
          codeSent ?
          <>
            <Text style={styles.enterCodeText}>Enter the code we sent to {formattedNumber}</Text>
            <TextInput
              style={passwordError ? styles.errorInput : styles.input}
              placeholder="Confirmation code"
              onChangeText={input => setConfirmationCode(input)}
              onSubmitEditing={Keyboard.dismiss}
              keyboardType="number-pad"
              keyboardAppearance='dark'
            />
          </>
          :
          <PhoneInput
            ref={phoneInput}
            value={phoneNumber}
            defaultCode="US"
            layout="first"
            onChangeText={(num) => {
              setPhoneNumber(num);
            }}
            onChangeFormattedText={(num) => {
              setFormattedNumber(num);
            }}
            withDarkTheme
            withShadow
            autoFocus
          />
        }
        <Text style={{...styles.errorText, display: error ? 'flex' : 'none'}}>{errorText}</Text>
        <Text style={{...styles.errorText, display: phoneError ? 'flex' : 'none'}}>{phoneErrorMessage}</Text>
        {
          codeSent ? 
          <>
            <Pressable style={secs > 0 ? styles.disabledNextButton : styles.nextButton} onPress={handleSendCode} disabled={secs > 0 || validating}>
              {
                validating ?
                <ActivityIndicator/>
                :
                <>
                  {
                    secs > 0 ?
                    <Text style={styles.nextLabel}>Resend code in {secs}...</Text>
                    :
                    <Text style={styles.nextLabel}>Resend code</Text>
                  }
                </>
              }
            </Pressable>
            {/*<Pressable style={styles.tryDifferent} onPress={() => setCodeSent(false)}>
              <Text style={styles.tryDifferentText}>
                Try a different phone number
              </Text>
            </Pressable>*/}
          </>
          :
          <Pressable style={phoneNumber === '' ? styles.disabledNextButton : styles.nextButton} onPress={handleNext} disabled={phoneNumber === ''}>
            {
              validating ?
              <ActivityIndicator/>
              :
              <Text style={styles.nextLabel}>Next</Text>
            }
          </Pressable>
        }
        <FirebaseRecaptchaBanner style={{position: 'absolute', bottom: 20, margin: 10}}/>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    //backgroundColor: 'white'
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
    marginTop: 90,
    marginBottom: 40,
    margin:25
  },
  enterCodeText: {
    color: 'black',
    fontWeight: 'bold',
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
    //backgroundColor: '#ededed',
    backgroundColor: 'white',

    height: 50,
    paddingLeft: 20,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#cfcfcf',
    marginTop: 20,
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
  },
  tryDifferent: {
    marginTop: 20,
  },
  tryDifferentText: {
    color: COLORS.iosBlue
  }
})