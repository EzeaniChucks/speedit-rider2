import {Box} from 'native-base';
import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Alert,
} from 'react-native';
import useImagePicker from '../imageUpload'; // Adjusted path

const UploadBottomSheet = ({visible, onClose, onImageSelected}) => {
  const translateY = useRef(new Animated.Value(500)).current;
  const {takePhoto, chooseFromLibrary} = useImagePicker();

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 5,
      }).start();
    } else {
      Animated.spring(translateY, {
        toValue: 500, // Or screen height
        useNativeDriver: true,
        bounciness: 5,
      }).start();
    }
  }, [visible, translateY]);

  if (!visible) {
    return null;
  }

  const handleClose = cb => {
    // Animate out, then call onClose from parent, then optional callback
    Animated.spring(translateY, {
      toValue: 500,
      useNativeDriver: true,
      bounciness: 5,
    }).start(() => {
      if (onClose) onClose(); // Propagate close to parent to set visible=false
      if (cb) cb();
    });
  };

  const handleChooseFromLibrary = () => {
    chooseFromLibrary(imageData => {
      // imageData is { uri, fileName, type } or null
      if (imageData) {
        onImageSelected(imageData); // Pass data to parent
      }
      handleClose(); // Close sheet regardless of selection for simplicity
    });
  };

  const handleTakePhoto = () => {
    takePhoto(imageData => {
      if (imageData) {
        onImageSelected(imageData);
      }
      handleClose();
    });
  };

  return (
    <Animated.View style={[styles.container, {transform: [{translateY}]}]}>
      <View style={styles.sheetContent}>
        <Text style={styles.title}>Upload document</Text>
        <Text style={styles.instruction}>
          Make sure the photo you are uploading is the correct one.
        </Text>
        <Box
          pt={6}
          pb={6}
          borderBottomColor={'gray.300'}
          borderTopColor={'gray.300'}
          borderBottomWidth={1}
          borderTopWidth={1}>
          <Text style={styles.instruction}>
            Make sure the photo is taken in good light.
          </Text>
        </Box>
        <Text style={styles.instruction}>The photo should be max 10MB.</Text>

        <TouchableOpacity
          onPress={handleChooseFromLibrary}
          style={styles.button}>
          <Text style={styles.buttonText}>Choose from library</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleTakePhoto} style={styles.button}>
          <Text style={styles.buttonText}>Take a photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleClose()}
          style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default UploadBottomSheet;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.25,
    shadowRadius: 4.65,
    maxHeight: '70%',
    zIndex: 1000, // Ensure it's on top
  },
  sheetContent: {
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  instruction: {
    marginVertical: 8,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  button: {
    backgroundColor: 'teal',
    paddingVertical: 14,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'red',
  },
  cancelButtonText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '500',
  },
});
