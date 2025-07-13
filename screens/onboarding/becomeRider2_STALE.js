import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import Icons from '@react-native-vector-icons/ant-design';
import { Box, CheckIcon, FlatList, Select } from 'native-base';


// STALE COMPONENT, BUT MIGHT STILL CONTAIN SOME USEFUL FEATURES FOR THE FUTURE
const BecomeRiderTwoScreen = ({ navigation }) => {
  const [city, setCity] = useState('');

  const handleNext = () => {
    if (!city) {
      Alert.alert('Error', 'Please fill in city');
      return;
    }
    // Navigate to the next screen
    navigation.navigate('DocumentUploadScreen'); // Replace with your actual next screen name
  };
  const [modalVisible, setModalVisible] = useState(false);

  const cities = [
    { label: 'Lagos Mainland', value: 'ux' },
    { label: 'Lekki', value: 'web' },
    { label: 'Victoria Island', value: 'cross' },
    { label: 'Oshodi/ Isolo', value: 'ui' },
    { label: 'Backend Development', value: 'backend' },
  ];

  const handleCitySelect = item => {
    setCity(item);
    setModalVisible(false);
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icons name="arrow-left" size={30} color="teal" />
        <Text style={styles.title}>Become a rider</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Which city do you want to deliver in?
        </Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>{city ? city : 'Choose City'}</Text>
        </TouchableOpacity>
        <Box maxW="300">
          <Modal
            transparent={true}
            animationType="slide"
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <FlatList
                  data={cities}
                  keyExtractor={item => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.cityItem}
                      onPress={() => handleCitySelect(item.label)}
                    >
                      <Text style={styles.cityText}>{item.label}</Text>
                      {city === item.label && <CheckIcon size="5" />}
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </Box>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    marginVertical: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  selectButton: {
    padding: 10,
    backgroundColor: '#28a745',
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  cityText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FF5733',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BecomeRiderTwoScreen;
