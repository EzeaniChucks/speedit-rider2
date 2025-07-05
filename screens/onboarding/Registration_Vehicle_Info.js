import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import Icons from '@react-native-vector-icons/ant-design';
import {useDispatch, useSelector} from 'react-redux';
import {updateRegistrationForm} from '../../store/authSlice';
import {TextInput as PaperTextInput, RadioButton} from 'react-native-paper';

const RegistrationVehicleInformationScreen = ({navigation}) => {
  const registrationData = useSelector(state => state.auth.registrationForm);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();

  const vehicleOptions = [
    'Motorbike',
    'Electric motorbike',
    'Bicycle',
    'Electric bicycle',
    'Walker',
  ];

  const handleSelection = vehicle => {
    setSelectedVehicle(vehicle);
    setModalVisible(false);
  };

  const handleSubmit = () => {
    if (!selectedVehicle.trim()) {
      Alert.alert('Validation Error', 'Vehicle type is required.');
      return;
    }
    if (!plateNumber.trim() || !vehicleColor.trim() || !vehicleModel.trim()) {
      Alert.alert(
        'Validation Error',
        'All vehicle detail fields are required.',
      );
      return;
    }

    const updatedData = {
      ...registrationData,
      vehicleType: selectedVehicle,
      vehicleDetails: {
        plateNumber,
        color: vehicleColor,
        model: vehicleModel,
      },
    };

    dispatch(updateRegistrationForm(updatedData));
    navigation.navigate('CreatePasswordScreen');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vehicle Information</Text>
          <View style={{width: 24}} /> {/* Spacer for alignment */}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Tell us about your vehicle</Text>
          <Text style={styles.subtitle}>
            This helps us verify your identity as a rider
          </Text>

          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setModalVisible(true)}>
            <Text style={selectedVehicle ? styles.dropdownTextSelected : styles.dropdownText}>
              {selectedVehicle || 'Select Vehicle Type'}
            </Text>
            <Icons name="down" size={16} color="#666" />
          </TouchableOpacity>

          <Modal
            transparent={true}
            animationType="slide"
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalHeader}>Select Vehicle Type</Text>
                <FlatList
                  data={vehicleOptions}
                  keyExtractor={item => item}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => handleSelection(item)}>
                      <Text style={styles.optionText}>{item}</Text>
                      <RadioButton
                        value={item}
                        status={selectedVehicle === item ? 'checked' : 'unchecked'}
                        onPress={() => handleSelection(item)}
                        color="#008080"
                      />
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <PaperTextInput
            label="Plate Number (e.g., ABC123XYZ)"
            value={plateNumber}
            onChangeText={setPlateNumber}
            autoCapitalize="characters"
            mode="outlined"
            style={styles.input}
            outlineColor="#e0e0e0"
            activeOutlineColor="#008080"
            theme={{
              colors: {primary: '#008080', placeholder: '#9e9e9e'},
              roundness: 8,
            }}
          />

          <PaperTextInput
            label="Vehicle Color (e.g., Red)"
            value={vehicleColor}
            onChangeText={setVehicleColor}
            autoCapitalize="words"
            mode="outlined"
            style={styles.input}
            outlineColor="#e0e0e0"
            activeOutlineColor="#008080"
            theme={{
              colors: {primary: '#008080', placeholder: '#9e9e9e'},
              roundness: 8,
            }}
          />

          <PaperTextInput
            label="Vehicle Model (e.g., Yamaha)"
            value={vehicleModel}
            onChangeText={setVehicleModel}
            autoCapitalize="words"
            mode="outlined"
            style={styles.input}
            outlineColor="#e0e0e0"
            activeOutlineColor="#008080"
            theme={{
              colors: {primary: '#008080', placeholder: '#9e9e9e'},
              roundness: 8,
            }}
          />
        </View>

        <TouchableOpacity onPress={handleSubmit} style={styles.button}>
          <Text style={styles.buttonText}>Complete Registration</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#008080',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 40,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#008080',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 25,
    color: '#666',
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 15,
  },
  dropdownText: {
    fontSize: 16,
    color: '#9e9e9e',
  },
  dropdownTextSelected: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 10,
    maxHeight: '70%',
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#008080',
    padding: 15,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#008080',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RegistrationVehicleInformationScreen;