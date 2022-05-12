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

export default function Welcome({navigation}) {

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.header}>Welcome to dindin!</Text>
        <Text style={styles.explainer}>Find shared time with your friends, without all the hassle.</Text>
        <Pressable style={styles.nextButton} onPress={() => navigation.navigate('SignUpWithPhone')}>
          <Text style={styles.nextLabel}>Get started</Text>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({

 container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: '20%',
  },
  logo: {
    fontSize: 50,
    marginTop: 100,
  },
   header: {
    fontWeight: 'bold',
    fontSize: 30,
    marginBottom: '5%',
    alignItems: 'center', 
    justifyContent: 'center',
  },
  explainer: {
    color: COLORS.grey,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 50,
    textAlign: 'center', 
    width: '80%', 
    fontSize: 14,
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
})
