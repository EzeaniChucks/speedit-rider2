import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
// import { Button } from 'react-native-paper'; // Using TouchableOpacity for consistency
import {Box, Progress} from 'native-base';
import Icons from '@react-native-vector-icons/ant-design';
import {useDispatch, useSelector} from 'react-redux';
import {setIdPhoto} from '../../store/verify';
import UploadBottomSheet from './uploadSheet'; // Adjust path

const DocumentUploadScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const idPhotoUri = useSelector(state => state.verification.idPhotoUri);

  const [progress, setProgress] = useState(20); // Initial progress
  const [isSheetVisible, setSheetVisible] = useState(false);

  const handleImageSelected = imageData => {
    // imageData is { uri, fileName, type }
    if (imageData) {
      dispatch(setIdPhoto(imageData));
    }
    setSheetVisible(false);
  };

  const handleSubmit = () => {
    if (!idPhotoUri) {
      Alert.alert('Missing Photo', 'Please upload your ID photo.');
      return;
    }
    // console.log('ID Photo URI:', idPhotoUri);

    const nextProgress = Math.min(progress + 20, 100);
    navigation.navigate('VehicleSelectionScreen', {
      currentProgress: nextProgress,
    });
  };

  return (
    <View style={styles.container}>
      <Box safeAreaTop paddingX={4} paddingTop={4}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icons name="left-circle" size={30} color="teal" />
          </TouchableOpacity>
          <Text style={styles.title}>Document collection</Text>
        </View>
        <Progress value={progress} colorScheme="teal" size="md" mt={4} mb={4} />
      </Box>

      <View style={styles.content}>
        <Text style={styles.head}>Upload Your ID</Text>
        <Text style={styles.subHeader}>
          Photo of your ID (National ID, valid voter’s card, intl passport or
          rider's card)
        </Text>

        {idPhotoUri && (
          <Image source={{uri: idPhotoUri}} style={styles.imagePreview} />
        )}

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setSheetVisible(true)}>
          <Text style={styles.buttonText}>
            {idPhotoUri ? 'Change ID Photo' : 'Upload ID Photo'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>

      <UploadBottomSheet
        visible={isSheetVisible}
        onClose={() => setSheetVisible(false)}
        onImageSelected={handleImageSelected}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10, // Consistent padding
  },
  title: {
    fontSize: 22, // Adjusted size
    fontWeight: 'bold',
    marginLeft: 20, // Spacing from icon
    color: '#333',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  head: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  imagePreview: {
    width: 200,
    height: 150,
    resizeMode: 'contain',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  uploadButton: {
    backgroundColor: 'teal',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
    width: '80%',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 4,
    alignItems: 'center',
    margin: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DocumentUploadScreen;
