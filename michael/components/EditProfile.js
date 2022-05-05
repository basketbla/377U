import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  Button, 
  TextInput, 
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Pressable,
  Alert
} from 'react-native'
import React, {
  useEffect,
  useState,
  useLayoutEffect,
  useRef
} from 'react'
import { getCurrentUser } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import * as Device from 'expo-device';
import { uploadImageToStorage, saveUserDetails, getUsers } from '../utils/firebase';
import * as ImageManipulator from 'expo-image-manipulator';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export default function EditProfile({route, navigation}) {

  const { userDetails } = route.params;
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(userDetails.name);
  const [username, setUsername] = useState(userDetails.username);
  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorText, setUsernameErrorText] = useState('');
  const [image, setImage] = useState(userDetails.profilePic);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [type, setType] = useState(Camera.Constants.Type.back);
  
  const camRef = useRef(null);

  // Check camera options
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
    })();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button onPress={handleSubmit} title="Save" disabled={loading} />
      ),
    });
  }, [navigation, image, loading, name, username]);

  // Expo image picker code
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      result = await convertToJPG(result);
      setImage(result.uri);
    }
  };

  const photoAlert = () => {
    Alert.alert(
      "Upload Photo",
      undefined,
      [
        {
          text: "Photo Gallery",
          onPress: pickImage
        },
        {
          text: "Camera",
          onPress: Device.isDevice ? () => {
            navigation.setOptions({
              headerShown: false
            });
            setShowCamera(true);
          }: photoAlert, 
        },
        { text: "Cancel", onPress: undefined, style: "cancel" }
      ]
    );
  }
  
  const takePicture = async () => {
    let photo = await camRef.current?.takePictureAsync();
    photo = await convertToJPG(photo);
    setImage(photo.uri);
    setShowCamera(false);
    navigation.setOptions({
      headerShown: true,
    });
  }

  const handleSubmit = async () => {
    setUsernameError(false);
    setLoading(true);

    console.log(username);

    // Need to check if this username is taken
    if (username !== userDetails.username) {
      let usernames = Object.values(await getUsers()).map(item => item.username);

      if (usernames.includes(username)) {
        setLoading(false);
        setUsernameError(true);
        setUsernameErrorText('That username is already taken');
        return;
      }
    }

    let newPic = userDetails.profilePic;

    // Need to upload the new photo
    if (image !== userDetails.profilePic) {
      newPic = await uploadImageToStorage(image, currentUser.uid);
    }

    // Should change this to update so I don't have to include phone number
    await saveUserDetails(currentUser.uid, name, username, userDetails.phoneNumber, newPic);
    setLoading(false); 
    navigation.navigate('ProfileMain');
  }

  const convertToJPG = async (photo) => {
    const manipResult = await manipulateAsync(
      photo.uri,
      [{crop: {height: Math.round(photo.height * 0.8), originX: Math.round(photo.width * 0.1), originY: Math.round(photo.height * 0.1), width: Math.round(photo.width * 0.8)}}],
      { compress: 0, format: SaveFormat.JPEG }
    );
    console.log(manipResult)
    return manipResult;
  }

  if (loading) {
    return (
      <View style={{...styles.container, justifyContent: 'center'}}>
        <ActivityIndicator/>
      </View>
    )
  }

  if (showCamera) {
    return (
      <View style={styles.camContainer}>
        <View style={styles.topBar}/>
        <Camera style={styles.camera} type={type} ref={camRef}/>
        <View style={styles.otherBottomBar}>
          <Text style={styles.cancelButton} onPress={() => setShowCamera(false)}>Cancel</Text>
          <Pressable style={styles.cameraButtonOuter} onPress={takePicture}>
            <View style={styles.cameraButtonInner}/>
          </Pressable>
          <Ionicons
            name="camera-reverse-outline" 
            color="white" 
            size={35}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}
          />
        </View>
      </View>
    )
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Pressable style={{position: 'relative'}} onPress={photoAlert}>
          <Image
            style={styles.profilePic}
            source={{
              uri: image
            }}
          />
          <View style={styles.cameraIcon}>
            <Ionicons name={'camera'} size={25}/>
          </View>
        </Pressable>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          onChangeText={input => setName(input)}
          onSubmitEditing={Keyboard.dismiss}
          value={name}
        />
        <Text style={{...styles.label, marginTop: 15}}>Username</Text>
        <TextInput
          style={usernameError ? styles.errorInput : styles.input}
          placeholder="Username"
          onChangeText={input => setUsername(input)}
          onSubmitEditing={Keyboard.dismiss}
          value={username}
        />
        <Text style={{...styles.errorText, display: usernameError ? 'flex' : 'none'}}>{usernameErrorText}</Text>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white'
  },
  profilePic: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginTop: '10%'
  },
  name: {
    fontWeight: 'bold',
    fontSize: 30,
    marginTop: 10,
  },
  username: {
    fontSize: 20,
  },
  input: {
    width: '80%',
    backgroundColor: '#ededed',
    height: 50,
    paddingLeft: 20,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#cfcfcf',
    marginTop: 20,
  },
  errorInput: {
    width: '80%',
    backgroundColor: '#ededed',
    height: 50,
    paddingLeft: 20,
    borderRadius: 5,
    borderWidth: 0.5,
    marginTop: 20,
    borderColor: 'red',
  },
  label: {
    marginRight: 'auto',
    marginLeft: '10%',
    marginBottom: -15,
    fontWeight: 'bold'
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  camera: {
    flex: 1,
    backgroundColor: 'red'
  },
  camText: {
    fontSize: 18,
    color: 'white',
  },
  camContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  otherBottomBar: {
    flex: 0.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'black',
    width: '100%',
    paddingLeft: 20,
    paddingRight: 20
  },
  topBar: {
    flex: 0.2,
    backgroundColor: 'black',
    width: '100%'
  },
  cameraButtonOuter: {
    backgroundColor: 'white',
    height: 70,
    width: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButtonInner: {
    backgroundColor: 'white',
    height: 60,
    width: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'black',
  },
  cancelButton: {
    color: 'white',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  }
})