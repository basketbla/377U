import { StyleSheet, Text, View, TextInput, Pressable, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, {
  useState,
  useEffect
} from 'react'
import { useAuth } from '../contexts/AuthContext';
import * as SMS from 'expo-sms';
import axios from 'axios';
import { NODE_URL, cleanNumber } from '../utils/constants'

// NOTE: RIGHT NOW THERE'S A TWILIO SERVER THAT YOU HAVE TO RUN FOR THIS TO WORK
export default function SendTexts() {

  // This should have the info about the logged in user
  const { currentUser } = useAuth();

  // Just a single phone number for now
  const [phoneNumbers, setPhoneNumbers] = useState();
  const [message, setMessage] = useState();

  const hitServer = () => {
    axios.post(NODE_URL + '/api/messages', {
      numbers: phoneNumbers.split('\n').map(number => cleanNumber(number)),
      body: message,
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
    <TouchableWithoutFeedback style={styles.container} onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text>Enter in numbers and send a blast:</Text>
        <TextInput
          style={styles.numbersInput}
          multiline={true}
          placeholder={`(999) 999-9999 \n999 999 9999 \n9999999999 \n...`}
          autoCompleteType="tel"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoFocus
          onChangeText={nums => setPhoneNumbers(nums)}
          />
        <TextInput
          style={styles.numbersInput}
          multiline={true}
          placeholder="enter a message to send!"
          onChangeText={mess => setMessage(mess)}
        />
        <Pressable onPress={hitServer} style={styles.sendButton}>
          <Text style={{color: 'white'}}>Send texts</Text>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
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
  },
  numbersInput: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 20,
    margin: 20,
    width: '50%',
    height: 100
  }
})