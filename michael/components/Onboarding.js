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

export default function Onboarding({ navigation }) {



  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.logo}>Din Din</Text>
        <Text style={styles.explainer}>For the best experience on this app:</Text>
        <View>
          <Text style={styles.entry}>1. Access Contacts</Text>
          <Text style={styles.entryLittle}>(to add your friends!)</Text>
          <Text style={styles.entry}>2. Enable Notifications</Text>
          <Text style={styles.entryLittle}>(to see when your friends are free)</Text>
          <Text style={styles.entry}>3. Sync with Google Calendar</Text>
          <Text style={styles.entryLittle}>(to share your availability)</Text>
        </View>
        <Pressable style={styles.okayButton} onPress={() => navigation.navigate('ContactsPage')}>
          <Text style={styles.okayLabel}>Okay</Text>
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
    fontSize: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  entry: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 25,
    marginTop: 20,
  },
  entryLittle: {
    color: COLORS.grey,
    marginBottom: 20,
    fontWeight: 'bold',
    marginTop: 5,
    fontSize: 15,
  },
  okayButton: {
    width: '80%',
    backgroundColor: COLORS.blue,
    height: 60,
    borderRadius: 5,
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 60,
  },
  okayLabel: {
    fontWeight: 'bold',
    color: 'white'
  },
})