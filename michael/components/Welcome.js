import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Pressable,
  Image,
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
import { initializeApp } from 'firebase/app'; //validate yourself

import { app, auth } from '../utils/firebase';

export default function Welcome({navigation}) {

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Image
          style={{marginTop: '20%', marginBottom: '10%', width: '90%', height: '45%'}}
          source={{
            uri: 'https://firebasestorage.googleapis.com/v0/b/michael-b65b3.appspot.com/o/welcomeCoffee.png?alt=media&token=b91e39ea-53b2-4202-a3c6-ad78cbdc953a' 
          }}
        />
        <Text style={[styles.header,{paddingTop: '2%'}]}>Welcome to dindin!</Text>
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
    backgroundColor: 'white',
  },

   header: {
    fontWeight: 'bold',
    fontSize: 30,
    marginBottom: 7,
    alignItems: 'center', 
    justifyContent: 'center',
    //color: COLORS.darkGrey,
  },
  explainer: {
    color: COLORS.grey,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center', 
    width: '90%', 
    fontSize: 15,
  },
  nextButton: {
    width: '80%',
    backgroundColor: COLORS.yellow,
    height: 50,
    borderRadius: 10,
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 10,
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
