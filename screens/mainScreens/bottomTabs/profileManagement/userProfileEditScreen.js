import React, {useEffect, useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AntIcons from '@react-native-vector-icons/ant-design';
import {useNavigation} from '@react-navigation/native';
import {TextInput} from 'react-native-paper';
import {updateUserProfile} from '../../../../store/profileSlice';
import {useDispatch, useSelector} from 'react-redux';
import {useUpdateRiderProfileMutation} from '../../../../store/profileApi';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.profile.user);
  const [updateProfile, {isLoading}] = useUpdateRiderProfileMutation();

  useEffect(() => {
    // on navigating to profile edit screen,
    // if there is no user, then trigger user fetch
    if (!user) {
      useGetRiderProfileQuery();
    }
  }, []);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    vehicleModel: user?.vehicleDetails?.model || '',
    plateNumber: user?.vehicleDetails?.plateNumber || '',
    color: user?.vehicleDetails?.color || '',
  });

  const handleGoBack = () => navigation.goBack();

  const handleSubmit = async () => {
    try {
      const updatedProfile = await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        vehicleDetails: {
          model: formData.vehicleModel,
          plateNumber: formData.plateNumber,
          color: formData.color,
        },
      }).unwrap();

      dispatch(updateUserProfile(updatedProfile));
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.data?.message || 'Failed to update profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <AntIcons name="left" size={24} color="teal" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{width: 24}} /> {/* Spacer for alignment */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarContainer}>
          <AntIcons name="user" size={50} color="#fff" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <TextInput
            label="First Name"
            value={formData.firstName}
            onChangeText={text => setFormData({...formData, firstName: text})}
            mode="outlined"
            style={styles.input}
            theme={{colors: {primary: 'teal'}}}
          />

          <TextInput
            label="Last Name"
            value={formData.lastName}
            onChangeText={text => setFormData({...formData, lastName: text})}
            mode="outlined"
            style={styles.input}
            theme={{colors: {primary: 'teal'}}}
          />

          <TextInput
            label="Phone Number"
            value={formData.phone}
            onChangeText={text => setFormData({...formData, phone: text})}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            theme={{colors: {primary: 'teal'}}}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          <TextInput
            label="Vehicle Model"
            value={formData.vehicleModel}
            onChangeText={text =>
              setFormData({...formData, vehicleModel: text})
            }
            mode="outlined"
            style={styles.input}
            theme={{colors: {primary: 'teal'}}}
          />

          <TextInput
            label="Plate Number"
            value={formData.plateNumber}
            onChangeText={text => setFormData({...formData, plateNumber: text})}
            mode="outlined"
            style={styles.input}
            theme={{colors: {primary: 'teal'}}}
          />

          <TextInput
            label="Color"
            value={formData.color}
            onChangeText={text => setFormData({...formData, color: text})}
            mode="outlined"
            style={styles.input}
            theme={{colors: {primary: 'teal'}}}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.saveButton, isLoading && styles.buttonDisabled]}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  avatarContainer: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'teal',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: 'teal',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditProfileScreen;
