import {Box, HStack} from 'native-base'; // Select and CheckIcon were unused, Input is being replaced
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import Icons from '@react-native-vector-icons/ant-design';
import {useDispatch} from 'react-redux';
import {updateRegistrationForm} from '../../store/authSlice'; // Adjust path as needed
import {RadioButton, TextInput as PaperTextInput} from 'react-native-paper'; // Import PaperTextInput

const CreateAccountScreen = ({navigation}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  // vehicleType state is present but not directly tied to a Paper TextInput in this refactor scope
  // It's used by the custom modal selector.
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();
  const [selectedVehicle, setSelectedVehicle] = useState(''); // This state is for the custom dropdown

  const handleSelection = vehicle => {
    // Assuming you want to update vehicleType which is part of registrationData
    // If selectedVehicle is just for display in the dropdown, this is fine.
    // If it should also update the 'vehicleType' state used in handleContinue, do:
    // setVehicleType(vehicle); // This was the original state for vehicle type
    setSelectedVehicle(vehicle); // This updates the displayed text in the TouchableOpacity
    setModalVisible(false);
  };

  const vehicleOptions = [
    'Motorbike',
    'Electric motorbike',
    'Bicycle',
    'Electric bicycle',
    'Walker',
  ];

  const handleContinue = () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !residentialAddress.trim()
    ) {
      Alert.alert(
        'Validation Error',
        'All personal and address fields are required.',
      );
      return;
    }
    // Use selectedVehicle for validation if it's the true source of vehicle type
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
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }
    if (!/^\d{10,11}$/.test(phone)) {
      Alert.alert(
        'Validation Error',
        'Please enter a valid phone number (10 or 11 digits after +234).',
      );
      return;
    }

    const registrationData = {
      firstName,
      lastName,
      email,
      phone: `+234${phone}`,
      residentialAddress,
      vehicleType: selectedVehicle, // Use selectedVehicle from the modal
      vehicleDetails: {
        plateNumber,
        color: vehicleColor,
        model: vehicleModel,
      },
    };

    dispatch(updateRegistrationForm(registrationData));
    navigation.navigate('CreatePasswordScreen');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  // Common style for PaperTextInput content area
  const paperInputStyle = {backgroundColor: '#f9f9f9'};
  // Common theme for PaperTextInput
  const paperInputTheme = {
    roundness: 5,
    colors: {text: '#000', placeholder: '#666'},
  }; // Added text and placeholder color for consistency
  const activeOutlineColor = '#FFAB40'; // Example active color, you can change this

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <HStack space={2} alignItems="center" marginBottom={10}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icons name="arrow-left" size={30} color="black" />
          </TouchableOpacity>
          <Text style={{fontSize: 26, color: 'black'}}>Register</Text>
        </HStack>
        <Text style={styles.title}>We’re excited to have you on board!</Text>
        <Text style={styles.subtitle}>
          Please fill in your details to create an account.
        </Text>

        <Text style={styles.sectionHeader}>Personal Information</Text>
        <PaperTextInput
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          mode="flat"
          style={[styles.paperInputBase, {marginBottom: 12}]}
          outlineColor="#ccc"
          activeUnderlineColor={activeOutlineColor}
          theme={paperInputTheme}
          dense
        />
        <PaperTextInput
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
          mode="flat"
          style={[styles.paperInputBase, {marginBottom: 12}]}
          outlineColor="#ccc"
          activeUnderlineColor={activeOutlineColor}
          theme={paperInputTheme}
          dense
        />
        <PaperTextInput
          label="xxxx@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          mode="flat"
          style={[styles.paperInputBase, {marginBottom: 12}]}
          outlineColor="#ccc"
          activeUnderlineColor={activeOutlineColor}
          theme={paperInputTheme}
          dense
        />
        <View style={styles.phoneContainer}>
          <TextInput // Standard RN TextInput for the country code
            style={styles.phoneCode}
            value="+234"
            keyboardType="phone-pad"
            editable={false}
            // color="black" // Already in styles.phoneCode
          />
          <PaperTextInput
            label="7035397136"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            mode="flat"
            style={[styles.paperInputBase, {flex: 1}]} // No marginBottom here, phoneContainer has it
            outlineColor="#ccc"
            activeUnderlineColor={activeOutlineColor}
            theme={paperInputTheme}
            dense
          />
        </View>
        <PaperTextInput
          label="Residential Address"
          value={residentialAddress}
          onChangeText={setResidentialAddress}
          autoCapitalize="sentences"
          multiline
          numberOfLines={2} // This will suggest a height for 2 lines
          mode="outlined"
          style={[styles.paperInputBase, {marginBottom: 16, height: 'auto'}]} // Adjust height automatically for multiline, or set fixed like e.g. 80
          outlineColor="#ccc"
          activeUnderlineColor={activeOutlineColor}
          theme={paperInputTheme}
          // dense // `dense` might make multiline input too small, test and decide
        />

        <Text style={styles.sectionHeader}>Vehicle Information</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.dropdownText}>
            {selectedVehicle || 'Select Vehicle Type'}
          </Text>
        </TouchableOpacity>
        <Modal
          transparent={true}
          animationType="slide"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
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
                    color={activeOutlineColor} // Use consistent color
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
        </Modal>

        <PaperTextInput
          label="Plate Number (e.g., ABC123XYZ)"
          value={plateNumber}
          onChangeText={setPlateNumber}
          autoCapitalize="characters"
          mode="flat"
          style={[styles.paperInputBase, {marginBottom: 12, marginTop: 12}]} // Added marginTop since dropdown is above
          outlineColor="#ccc"
          activeUnderlineColor={activeOutlineColor}
          theme={paperInputTheme}
          dense
        />
        <PaperTextInput
          label="Vehicle Color (e.g., Red)"
          value={vehicleColor}
          onChangeText={setVehicleColor}
          autoCapitalize="words"
          mode="flat"
          style={[styles.paperInputBase, {marginBottom: 12}]}
          outlineColor="#ccc"
          activeUnderlineColor={activeOutlineColor}
          theme={paperInputTheme}
          dense
        />
        <PaperTextInput
          label="Vehicle Model (e.g., Yamaha)"
          value={vehicleModel}
          onChangeText={setVehicleModel}
          autoCapitalize="words"
          mode="flat"
          style={[styles.paperInputBase, {marginBottom: 16}]}
          outlineColor="#ccc"
          activeUnderlineColor={activeOutlineColor}
          theme={paperInputTheme}
          dense
        />

        <TouchableOpacity onPress={handleContinue} style={styles.button}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleLogin}
          style={styles.signInLinkContainer}>
          <Text style={styles.signInText}>
            Already a rider? <Text style={styles.link}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 15,
    color: '#555',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 8,
    color: '#444',
  },
  // New base style for PaperTextInput to set background color
  paperInputBase: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9', // Background for the input area itself
    // `dense` prop makes the input height around 48dp. If you need exactly 50px:
    // height: 50,
    // And you might need to adjust contentStyle padding for label and text alignment.
    // For multiline, height: 'auto' is often better or a larger fixed height.
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Align items vertically
    marginBottom: 12,
  },
  phoneCode: {
    // For the "+234" TextInput
    height: 48, // Match dense PaperTextInput height (approx)
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5, // Match PaperTextInput theme roundness
    paddingHorizontal: 10,
    marginRight: 8, // Small gap
    textAlign: 'center',
    backgroundColor: '#eee', // Slightly different to distinguish
    color: '#333',
    fontSize: 16,
    // To vertically center text, you might need paddingTop or textAlignVertical if it looks off
    textAlignVertical: 'center', // try this
  },
  button: {
    backgroundColor: 'black',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signInLinkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  signInText: {
    textAlign: 'center',
    color: '#555',
    fontSize: 14,
  },
  link: {
    color: '#FFAB40',
    fontWeight: 'bold',
  },
  // Modal and Dropdown styles (unchanged from your original, just minor adjustments if needed)
  dropdown: {
    backgroundColor: '#f9f9f9', // Match input background
    paddingVertical: 15, // Ensure it's comfy to tap
    paddingHorizontal: 12,
    borderRadius: 5, // Match input border radius
    borderWidth: 1,
    borderColor: '#ccc', // Match input border color
    alignItems: 'flex-start', // Align text to start
    justifyContent: 'center', // Center text vertically
    height: 48, // Try to match dense input height
    marginBottom: 12, // Consistent margin
  },
  dropdownText: {
    fontSize: 16, // Match input text size
    color: '#666', // Placeholder-like color
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center', // Center vertically
    backgroundColor: 'white', // Semi-transparent background rgba(228, 11, 11, 0.5)
    padding: 20,
  },
  modalContent: {
    // Wrap actual modal content for better styling
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%', // Limit height
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20, // Increased margin
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, // More touch area
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#007BFF', // Standard blue
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateAccountScreen;
