import { StyleSheet, Text, View, TextInput, Pressable, Alert } from 'react-native'
import React, {
  useState,
  useEffect
} from 'react'
import { useAuth } from '../contexts/AuthContext';
import * as SMS from 'expo-sms';
import axios from 'axios';

// NOTE: RIGHT NOW THERE'S A TWILIO SERVER THAT YOU HAVE TO RUN FOR THIS TO WORK
export default function SendTexts() {

  // This should have the info about the logged in user
  const { currentUser } = useAuth();

  // Just a single phone number for now
  const [phoneNumber, setPhoneNumber] = useState();
  const [message, setMessage] = useState();

  const hitServer = () => {
    axios.post('http://localhost:3001/api/messages', {
      to: phoneNumber,
      body: message
    }).then(
      function(value) {
        alertMessageSent();
      },
      function(error) {
        alertFailure('failed to contact server');
      }
    );
  }

  // Puts an alert on screen when text is sent
  const alertMessageSent = () => {
    Alert.alert('Text sent', 'Yay a text should have been sent', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      { text: 'OK'}
    ])
  }

  const alertFailure = (failureMessage) => {
    Alert.alert('Error', failureMessage, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      { text: 'OK'},
    ])
  }

  return (
    <View style={styles.container}>
      <Text>SendTexts</Text>
      <TextInput
        style={{ marginVertical: 10, fontSize: 17 }}
        placeholder="+1 999 999 9999"
        autoCompleteType="tel"
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        autoFocus
        onChangeText={phoneNumber => setPhoneNumber(phoneNumber)}
      />
      <TextInput
        style={{ marginVertical: 10, fontSize: 17 }}
        placeholder="enter a message to send!"
        onChangeText={mess => setMessage(mess)}
      />
      <Pressable onPress={hitServer} style={styles.sendButton}>
        <Text style={{color: 'white'}}>Send texts</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 20,
    marginTop: 50,
    width: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }
})