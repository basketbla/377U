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
        <Text style={styles.explainer}>Almost there! To get the most out of this app:</Text>
        <View style={{width: '85%'}}>
          <Text style={styles.entry}>1. Access Contacts</Text>
          <Text style={styles.entryLittle}>To add your friends</Text>
          <Text style={styles.entry}>2. Enable Notifications</Text>
          <Text style={styles.entryLittle}>So your friends can reach you</Text>
          <Text style={styles.entry}>3. Sync with Google Calendar</Text>
          <Text style={styles.entryLittle}>So your friends know when you might be free :)</Text>
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
    width: '85%',
    color: COLORS.grey,
    fontWeight: 'bold',
    fontSize: 24,
    marginTop: '20%',
    marginBottom: 20,
    // marginLeft: 20,
    // marginRight: 30,
  },
  entry: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 22,
    marginTop: 10,
    // marginLeft: 20,
    // marginRight: 20,
  },
  entryLittle: {
    color: COLORS.grey,
    marginBottom: 20,
    fontWeight: 'bold',
    marginTop: 5,
    fontSize: 16,
        // marginLeft: 20,
        //     marginRight: 20,
  },
  okayButton: {
    width: '80%',
    backgroundColor: COLORS.yellow,
    height: 60,
    borderRadius: 10,
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 30,
  },
  okayLabel: {
    fontWeight: 'bold',
    color: 'white'
  },
})