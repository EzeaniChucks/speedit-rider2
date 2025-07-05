import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import StyledTextInput from './components/StyledTextInput';
import StyledButton from './components/StyledButton';
import LoadingOverlay from './components/LoadingOverlay';
import Card from './components/Cards';
import { RootState, AppDispatch } from './store';
import { useGetRiderProfileQuery, useUpdateRiderProfileMutation } from './store/api';
import { updateUserProfile as updateAuthSliceProfile } from './store/profileSlice';
import { ProfileScreenProps } from './nav.types';
import { colors } from './theme/colors';
import { globalStyles } from './theme/style';

const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: profileData, isLoading: isLoadingProfile, error: profileError, refetch } = useGetRiderProfileQuery();
  const [updateProfile, { isLoading: isUpdatingProfile, error: updateError }] = useUpdateRiderProfileMutation();

  const [firstName, setFirstName] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  // Add more fields as needed based on your profile structure

  useEffect(() => {
    if (profileData) {
      setFirstName(profileData.firstName || '');
      setVehicleColor(profileData.vehicleDetails?.color || '');
      // Update authSlice if needed, though getProfileQuery might be enough for display
      dispatch(updateAuthSliceProfile(profileData));
    }
  }, [profileData, dispatch]);

  const handleUpdateProfile = async () => {
    const updatedData: { firstName?: string, vehicleDetails?: { color: string } } = {};
    if (firstName !== (profileData?.firstName || '')) {
        updatedData.firstName = firstName;
    }
    if (vehicleColor !== (profileData?.vehicleDetails?.color || '')) {
        updatedData.vehicleDetails = { color: vehicleColor };
    }

    if (Object.keys(updatedData).length === 0) {
        Alert.alert("No Changes", "You haven't made any changes to your profile.");
        return;
    }

    try {
      const result = await updateProfile(updatedData).unwrap();
      Alert.alert('Success', 'Profile updated successfully!');
      dispatch(updateAuthSliceProfile(result)); // Update auth slice with response
      refetch(); // Refetch profile data
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile.');
      console.error("Profile Update failed:", err);
    }
  };

  if (isLoadingProfile) {
    return (
      <View style={[globalStyles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Loading Profile...</Text>
      </View>
    );
  }

  if (profileError) {
    return (
      <View style={[globalStyles.container, styles.centered]}>
        <Text style={globalStyles.errorText}>Failed to load profile. Please try again.</Text>
        <StyledButton title="Retry" onPress={refetch} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <LoadingOverlay visible={isUpdatingProfile} text="Updating Profile..." />
      <Card>
        <Text style={globalStyles.title}>My Profile</Text>
        <Text style={styles.emailText}>Email: {profileData?.email}</Text>

        <StyledTextInput
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="John"
        />
        <StyledTextInput
          label="Vehicle Color"
          value={vehicleColor}
          onChangeText={setVehicleColor}
          placeholder="e.g., Tomato Red"
        />
        {/* Add more editable fields here */}

        {updateError && (
          <Text style={globalStyles.errorText}>
            {/* @ts-ignore */}
            Update Error: {updateError.data?.message || 'Could not update.'}
          </Text>
        )}

        <StyledButton title="Save Changes" onPress={handleUpdateProfile} loading={isUpdatingProfile} />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  }
});

export default ProfileScreen;