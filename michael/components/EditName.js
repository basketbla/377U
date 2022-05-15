import { StyleSheet, Text, View, Button, TextInput, ActivityIndicator } from 'react-native'
import React, { 
  useEffect,
  useLayoutEffect,
  useState, 
  useRef
} from 'react'
import { updateGroupName } from '../utils/firebase'

export default function EditName({ navigation, route }) {

  const [groupName, setGroupName] = useState(route.params.group.name);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Button onPress={() => navigation.goBack()} title="Cancel" />
      ),
      headerRight: () => (
        <Button onPress={async () => {
          setLoading(true);
          await updateGroupName(route.params.group.id, groupName);
          navigation.navigate('Chat', {group: {...route.params.group, name: groupName}})
        }} title="Save" />
      ),
    });
  }, [navigation, setLoading, groupName, route.params]);

  useEffect(() => {
    inputRef.current.focus();
  }, [])

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator style={{marginTop: 20}}/>
      </View>
    )
  }


  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.groupNameInput}
        value={groupName}
        onChangeText={text => setGroupName(text)}
        ref={inputRef}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white'
  },
  groupNameInput: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 30
  }
})