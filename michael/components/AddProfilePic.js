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
  useRef
} from 'react'
import { getCurrentUser } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import * as Device from 'expo-device';
import { uploadImageToStorage, updateProfilePic } from '../utils/firebase';
import * as ImageManipulator from 'expo-image-manipulator';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { DEFUALT_PROFILE_PIC, COLORS } from '../utils/constants';

export default function AddProfilePic({navigation}) {
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorText, setUsernameErrorText] = useState('');
  const [image, setImage] = useState(DEFUALT_PROFILE_PIC);
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
      confirmPhoto(result.uri);
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

  const confirmPhoto = (uri) => {
    Alert.alert(
      "Confirm Photo",
      "Is this photo good or do you want to select a different one?",
      [
        { text: "Cancel", onPress: () => setImage(DEFUALT_PROFILE_PIC), style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            // Upload photo
            setLoading(true);
            let newUrl = await uploadImageToStorage(uri, currentUser.uid);
            await updateProfilePic(newUrl, currentUser.uid);
            setLoading(false);
          }
        },
      ]
    );
  }
  
  const takePicture = async () => {
    let photo = await camRef.current?.takePictureAsync();
    photo = await convertToJPG(photo);
    setImage(photo.uri);
    setShowCamera(false);
    confirmPhoto(photo.uri);
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
      <View style={styles.container}>
        <Text style={styles.header}>Add Profile Picture</Text>
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
        <Text style={styles.header}>Add Profile Picture</Text>
        <Pressable style={{position: 'relative'}} onPress={photoAlert}>
          <Image
            style={styles.profilePic}
            source={{
              uri: image
            }}
          />
          <View style={styles.cameraIcon}>
            <Ionicons name={'camera'} size={35}/>
          </View>
        </Pressable>
        <Pressable style={styles.nextButton} onPress={() => navigation.navigate('Onboarding')}>
          <Text style={styles.nextLabel}>Next</Text>
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
    paddingTop: '20%'
  },
  profilePic: {
    width: 200,
    height: 200,
    borderRadius: 100,
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
    width: 60,
    height: 60,
    borderRadius: 30,
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
  },
  header: {
    fontWeight: 'bold',
    fontSize: 30,
    marginBottom: '20%',
  },
  nextButton: {
    width: '80%',
    backgroundColor: COLORS.blue,
    height: 50,
    borderRadius: 5,
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 100,
  },
  nextLabel: {
    fontWeight: 'bold',
    color: 'white'
  },
})