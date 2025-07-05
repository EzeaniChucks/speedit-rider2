import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Box, Progress} from 'native-base';
import Icons from '@react-native-vector-icons/ant-design';
import {useDispatch, useSelector} from 'react-redux';
import {
  setLicensePhoto,
  uploadDocumentsThunk,
  resetUploadState,
  fetchVerificationStatusThunk, // Optionally fetch status after upload
  clearAllPhotos,
} from '../../store/verify';
import UploadBottomSheet from './uploadSheet'; // Adjust path

const LicenseCollectionScreen = ({route, navigation}) => {
  const {currentProgress} = route.params || {currentProgress: 100}; // Default if last screen
  const dispatch = useDispatch();

  const licensePhotoUri = useSelector(
    state => state.verification.licensePhotoUri,
  );
  const {uploadStatus, uploadError, uploadResponse} = useSelector(
    state => state.verification,
  );
  const {verificationStatus, verificationData, verificationError} = useSelector(
    state => state.verification,
  );

  const [progressValue, setProgressValue] = useState(currentProgress);
  const [isSheetVisible, setSheetVisible] = useState(false);

  useEffect(() => {
    // Handle successful upload
    if (uploadStatus === 'succeeded') {
      Alert.alert('Success', 'Documents uploaded successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Optionally fetch verification status now
            // dispatch(fetchVerificationStatusThunk());
            dispatch(resetUploadState());
            dispatch(clearAllPhotos()); // Clear photos from redux
            navigation.navigate('MainApp', {screen: 'Home'}); // Or a success/status screen
          },
        },
      ]);
    }
    // Handle failed upload
    if (uploadStatus === 'failed') {
      const errorMessage =
        uploadError?.message ||
        JSON.stringify(uploadError) ||
        'An unknown error occurred during upload.';
      Alert.alert('Upload Failed', errorMessage, [
        {text: 'OK', onPress: () => dispatch(resetUploadState())},
      ]);
    }
  }, [uploadStatus, uploadResponse, uploadError, dispatch, navigation]);

  // Optionally, handle verification status changes
  useEffect(() => {
    if (verificationStatus === 'succeeded') {
      console.log('Verification Status Data:', verificationData);
      // Navigate or update UI based on verificationData
    } else if (verificationStatus === 'failed') {
      console.error('Verification Status Error:', verificationError);
      Alert.alert(
        'Status Check Failed',
        verificationError?.message || 'Could not fetch verification status.',
      );
    }
  }, [verificationStatus, verificationData, verificationError]);

  const handleImageSelected = imageData => {
    if (imageData) {
      dispatch(setLicensePhoto(imageData));
    }
    setSheetVisible(false);
  };

  const handleUploadDocuments = () => {
    if (!licensePhotoUri) {
      Alert.alert('Missing Photo', 'Please upload your license photo.');
      return;
    }
    // All photos should be in Redux state by now (idPhoto, vehiclePhoto, licensePhoto)
    dispatch(uploadDocumentsThunk());
  };

  const handleFetchStatus = () => {
    dispatch(fetchVerificationStatusThunk());
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
        <Progress
          value={progressValue}
          colorScheme="teal"
          size="md"
          mt={4}
          mb={4}
        />
      </Box>

      <View style={styles.content}>
        <Text style={styles.head}>Upload Your License Photo</Text>
        <Text style={styles.subHeader}>
          Photo of your valid driver's license.
        </Text>

        {licensePhotoUri && (
          <Image source={{uri: licensePhotoUri}} style={styles.imagePreview} />
        )}

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setSheetVisible(true)}>
          <Text style={styles.buttonText}>
            {licensePhotoUri ? 'Change License Photo' : 'Upload License Photo'}
          </Text>
        </TouchableOpacity>
      </View>

      {uploadStatus === 'loading' ? (
        <ActivityIndicator size="large" color="teal" style={styles.loader} />
      ) : (
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleUploadDocuments}>
          <Text style={styles.buttonText}>Submit All Documents</Text>
        </TouchableOpacity>
      )}

      {/* Optional: Button to manually check status */}
      {/* <TouchableOpacity style={[styles.submitButton, {backgroundColor: 'blue'}]} onPress={handleFetchStatus}>
        {verificationStatus === 'loading' ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Check Verification Status</Text>}
      </TouchableOpacity> */}

      <UploadBottomSheet
        visible={isSheetVisible}
        onClose={() => setSheetVisible(false)}
        onImageSelected={handleImageSelected}
      />
    </View>
  );
};

// Using similar styles
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
  loader: {
    marginVertical: 20,
  },
});

export default LicenseCollectionScreen;
