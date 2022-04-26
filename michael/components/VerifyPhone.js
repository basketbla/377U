import React, {
  useRef,
  useState
} from 'react';
import {
  Text,
  View,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Platform,
  LogBox
} from 'react-native';
import { FirebaseRecaptchaVerifierModal, FirebaseRecaptchaBanner } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { app, auth } from '../utils/firebase';
import { useNavigation } from '@react-navigation/native';
import { cleanNumber } from '../utils/constants';

// STARTING WITH ENTIRE PAGE COPIED FROM HERE:
// https://docs.expo.dev/versions/latest/sdk/firebase-recaptcha/1

// Double-check that we can run the example
if (!app?.options || Platform.OS === 'web') {
  throw new Error('This example only works on Android or iOS, and requires a valid Firebase config.');
}

// Expo uses some thing that gives a warning and this suppresses it
LogBox.ignoreLogs(['AsyncStorage has been extracted from react-native core']);

/**
 * Right now this is all expo code...
 * I'm going through and commenting so we can know
 * how stuff works and change it 
 */
export default function VerifyPhone() {
  
  // React navigation
  const navigation = useNavigation();

  // ref needed because we pass it to verifyPhoneNumber
  const recaptchaVerifier = useRef(null);

  // just two text fields and then the id is a firebase thing
  const [phoneNumber, setPhoneNumber] = useState();
  const [verificationId, setVerificationId] = useState();
  const [verificationCode, setVerificationCode] = useState();

  // why didn't they just use alerts ???
  // Whelp I tried to change it and everything crashed
  const [message, showMessage] = useState();

  // this just affects whether we show the warning (is this a legal thing??)
  // But the flag just does what it ways
  const attemptInvisibleVerification = true;

  return (
    <View style={{ padding: 20, marginTop: 50 }}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
        attemptInvisibleVerification
      />
      <Text style={{ marginTop: 20 }}>Enter phone number</Text>
      {/* Doesn't work if we don't have the plus, might want to change?*/}
      <TextInput
        style={{ marginVertical: 10, fontSize: 17 }}
        placeholder="(999) 999-9999"
        autoFocus
        autoCompleteType="tel"
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        onChangeText={phoneNumber => {
          // Clean it up
          number = cleanNumber(phoneNumber);
          
          setPhoneNumber(number);
        }}
      />
      {/* Button does standard firebase text auth */}
      <Button
        title="Send Verification Code"
        disabled={!phoneNumber}
        onPress={async () => {
          // The FirebaseRecaptchaVerifierModal ref implements the
          // FirebaseAuthApplicationVerifier interface and can be
          // passed directly to `verifyPhoneNumber`.
          try {
            const phoneProvider = new PhoneAuthProvider(auth);
            const verificationId = await phoneProvider.verifyPhoneNumber(
              phoneNumber,
              recaptchaVerifier.current
            );
            setVerificationId(verificationId);
            showMessage({
              text: 'Verification code has been sent to your phone.',
            });
          } catch (err) {
            showMessage({ text: `Error: ${err.message}`, color: 'red' });
          }
        }}
      />
      <Text style={{ marginTop: 20 }}>Enter Verification code</Text>
      <TextInput
        style={{ marginVertical: 10, fontSize: 17 }}
        editable={!!verificationId}
        placeholder="123456"
        onChangeText={setVerificationCode}
      />
      {/* Either creates new firebase user or signs in I think */}
      <Button
        title="Confirm Verification Code"
        disabled={!verificationId}
        onPress={async () => {
          try {
            const credential = PhoneAuthProvider.credential(
              verificationId,
              verificationCode
            );
            await signInWithCredential(auth, credential);
            navigation.navigate('Username');
          } catch (err) {
            showMessage({ text: `Error: ${err.message}`, color: 'red' });
          }
        }}
      />
      {message ? (
        <TouchableOpacity
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 0xffffffee, justifyContent: 'center' },
          ]}
          onPress={() => showMessage(undefined)}>
          <Text
            style={{
              color: message.color || 'blue',
              fontSize: 17,
              textAlign: 'center',
              margin: 20,
            }}>
            {message.text}
          </Text>
        </TouchableOpacity>
      ) : (
        undefined
      )}
      {attemptInvisibleVerification && <FirebaseRecaptchaBanner />}
    </View>
  );
}