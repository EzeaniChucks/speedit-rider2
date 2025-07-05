import { useState } from 'react';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "App needs access to your camera.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true; // iOS permissions are handled by Info.plist
};


const useImagePicker = () => {
  const [pickedImage, setPickedImage] = useState(null);

  const takePhoto = async (callback) => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
        Alert.alert("Permission Denied", "Camera permission is required to take photos.");
        return;
    }
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: true, // To save to gallery
    };
    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to take photo: ' + response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const image_data = {
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
        };
        setPickedImage(image_data);
        if (callback) callback(image_data);
      }
    });
  };

  const chooseFromLibrary = (callback) => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to pick image: ' + response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
         const image_data = {
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `library_image_${Date.now()}.jpg`,
        };
        setPickedImage(image_data);
        if (callback) callback(image_data);
      }
    });
  };

  return { pickedImage, takePhoto, chooseFromLibrary, setPickedImage };
};

export default useImagePicker;