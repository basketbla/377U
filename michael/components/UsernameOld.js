import { 
  StyleSheet, 
  Text, 
  View,
  TextInput,
  Pressable,
  Keyboard,
  Alert
} from 'react-native'
import React, {
  useState
} from 'react'
import { saveUsernameName } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function Username({ navigation }) {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');

  const { currentUser } = useAuth();

  const handleSubmit = () => {
    saveUsernameName(currentUser.uid, username, name);
    Alert.alert('User Saved', 'User data has been saved!', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      { text: 'OK', onPress: () => navigation.navigate('SendTexts')}
    ])

  }

  return (
    <View style={styles.container}>
      <Text>Welcome to Din Din!</Text>
      <TextInput
        style={styles.input}
        placeholder="enter your username"
        onChangeText={input => setUsername(input)}
        onSubmitEditing={Keyboard.dismiss}
      />
      <TextInput
        style={styles.input}
        placeholder="enter your full name"
        onChangeText={input => setName(input)}
        onSubmitEditing={Keyboard.dismiss}
      />
      <Pressable style={styles.doneButton} onPress={handleSubmit}>
        <Text style={{color: 'white'}}>Done</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    paddingLeft: 10,
    borderWidth: 1,
    borderRadius: 20,
    margin: 20,
    width: '50%',
    height: 50
  },
  doneButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 20,
    marginTop: 50,
    width: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
})