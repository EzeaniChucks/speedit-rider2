import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import {Box, Progress} from 'native-base';
import Icons from '@react-native-vector-icons/ant-design';
import {useDispatch, useSelector} from 'react-redux';
import {setVehiclePhoto} from '../../store/verify';
import UploadBottomSheet from './uploadSheet'; // Adjust path

const VehicleIdUploadScreen = ({route, navigation}) => {
  const {currentProgress} = route.params || {currentProgress: 80};
  const dispatch = useDispatch();
  const vehiclePhotoUri = useSelector(
    state => state.verification.vehiclePhotoUri,
  );

  const [progress, setProgress] = useState(currentProgress);
  const [isSheetVisible, setSheetVisible] = useState(false);

  const handleImageSelected = imageData => {
    if (imageData) {
      dispatch(setVehiclePhoto(imageData));
    }
    setSheetVisible(false);
  };

  const handleNext = () => {
    if (!vehiclePhotoUri) {
      Alert.alert('Missing Photo', 'Please upload your vehicle photo.');
      return;
    }
    // console.log('Vehicle Photo URI:', vehiclePhotoUri);
    const nextProgress = Math.min(progress + 20, 100);
    // Navigate to LicenseCollectionScreen or the next appropriate screen
    navigation.navigate('LicenseCollectionScreen', {
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
        <Text style={styles.head}>Upload Your Vehicle Photo</Text>
        <Text style={styles.subHeader}>
          Photo of your vehicle (bike, car, etc.)
        </Text>

        {vehiclePhotoUri && (
          <Image source={{uri: vehiclePhotoUri}} style={styles.imagePreview} />
        )}

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setSheetVisible(true)}>
          <Text style={styles.buttonText}>
            {vehiclePhotoUri ? 'Change Vehicle Photo' : 'Upload Vehicle Photo'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleNext}>
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

// Using similar styles to DocumentUploadScreen for consistency
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 20,
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

export default VehicleIdUploadScreen;
