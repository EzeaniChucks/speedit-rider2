import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import Icons from '@react-native-vector-icons/ant-design';
import {useDispatch} from 'react-redux';
import {updateRegistrationForm} from '../../store/authSlice';
import {TextInput as PaperTextInput} from 'react-native-paper';

const RegistrationPersonalInformationScreen = ({navigation}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const dispatch = useDispatch();

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

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    // Remove all non-digit characters first
    const cleanedPhone = phone.replace(/\D/g, '');

    // Check if phone starts with 0, 234, or nothing
    let formattedPhone;
    if (cleanedPhone.startsWith('0')) {
      // Format: 080... → +23480...
      formattedPhone = `+234${cleanedPhone.substring(1)}`;
    } else if (cleanedPhone.startsWith('234')) {
      // Format: 23480... → +23480...
      formattedPhone = `+${cleanedPhone}`;
    } else if (cleanedPhone.length === 10) {
      // Format: 807... → +234807...
      formattedPhone = `+234${cleanedPhone}`;
    } else {
      Alert.alert(
        'Validation Error',
        'Please enter a valid Nigerian phone number (e.g. 08012345678, 2348012345678, or 8012345678).',
      );
      return;
    }

    // Final validation - should be +234 followed by 10 digits (no leading zero)
    if (!/^\+234[1-9]\d{9}$/.test(formattedPhone)) {
      Alert.alert(
        'Validation Error',
        'Please enter a valid Nigerian phone number (10 digits after +234 without leading zero).',
      );
      return;
    }

    const registrationData = {
      firstName,
      lastName,
      email,
      phone: formattedPhone,
      residentialAddress,
    };

    dispatch(updateRegistrationForm(registrationData));
    navigation.navigate('RegisterVehicleInfo');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Information</Text>
          <View style={{width: 24}} /> {/* Spacer for alignment */}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Let's get to know you</Text>
          <Text style={styles.subtitle}>
            Please provide your personal details to continue
          </Text>

          <PaperTextInput
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
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
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
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
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
            outlineColor="#e0e0e0"
            activeOutlineColor="#008080"
            theme={{
              colors: {primary: '#008080', placeholder: '#9e9e9e'},
              roundness: 8,
            }}
          />

          <View style={styles.phoneContainer}>
            <TextInput
              style={styles.phoneCode}
              value="+234"
              keyboardType="phone-pad"
              editable={false}
            />
            <PaperTextInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              mode="outlined"
              style={[styles.input, {flex: 1}]}
              outlineColor="#e0e0e0"
              activeOutlineColor="#008080"
              theme={{
                colors: {primary: '#008080', placeholder: '#9e9e9e'},
                roundness: 8,
              }}
            />
          </View>

          <PaperTextInput
            label="Residential Address"
            value={residentialAddress}
            onChangeText={setResidentialAddress}
            autoCapitalize="sentences"
            multiline
            numberOfLines={3}
            mode="outlined"
            style={[styles.input, {height: 100}]}
            outlineColor="#e0e0e0"
            activeOutlineColor="#008080"
            theme={{
              colors: {primary: '#008080', placeholder: '#9e9e9e'},
              roundness: 8,
            }}
          />
        </View>

        <TouchableOpacity onPress={handleContinue} style={styles.button}>
          <Text style={styles.buttonText}>Continue</Text>
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
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  phoneCode: {
    height: 50,
    width: 70,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
    color: '#333',
    fontSize: 16,
    textAlignVertical: 'center',
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

export default RegistrationPersonalInformationScreen;
