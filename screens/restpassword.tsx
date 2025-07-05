import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import StyledTextInput from '../components/StyledTextInput';
import StyledButton from '../components/StyledButton';
import LoadingOverlay from '../components/LoadingOverlay';
import { ResetPasswordScreenProps } from '../nav.types';
import { useConfirmPasswordResetMutation } from '../store/api';
import { logout } from '../store/authSlice'; // To clear any temp password reset state
import { colors } from '../theme/colors';
import { globalStyles } from '../theme/style';
import Card from '../components/Cards';
import { RootState } from '../store';


const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetPassword, { isLoading, error, isSuccess, data }] = useConfirmPasswordResetMutation();
  const dispatch = useDispatch();
  const resetCodeVerified = useSelector((state: RootState) => state.profile.resetCodeVerified);


  useEffect(() => {
    if (!resetCodeVerified) {
        Alert.alert("Error", "Please verify your OTP code first.");
        // Potentially navigate back or to login if they somehow landed here without verification
        navigation.navigate("Login");
    }
  }, [resetCodeVerified, navigation]);


  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please enter and confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) { // Example validation
        Alert.alert('Error', 'Password must be at least 6 characters long.');
        return;
    }

    try {
      await resetPassword({ newPassword }).unwrap();
      // Success handled by useEffect
    } catch (err) {
      console.error("Password Reset failed:", err);
    }
  };

  useEffect(() => {
    if (isSuccess && data) {
      Alert.alert('Success', data.message || 'Password reset successfully. Please login.');
      dispatch(logout()); // Clear reset state and any old auth state
      navigation.navigate('Login');
    }
  }, [isSuccess, data, navigation, dispatch]);

  if (!resetCodeVerified) { // Prevent rendering if code not verified
    return null;
  }

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <LoadingOverlay visible={isLoading} text="Resetting Password..." />
      <Card>
        <Text style={globalStyles.title}>Set New Password</Text>
        <Text style={globalStyles.subtitle}>Enter your new password below.</Text>

        {error && (
          <Text style={globalStyles.errorText}>
            {/* @ts-ignore */}
            Error: {error.data?.message || 'Failed to reset password.'}
          </Text>
        )}

        <StyledTextInput
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="••••••••"
          secureTextEntry
        />
        <StyledTextInput
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="••••••••"
          secureTextEntry
        />
        <StyledButton title="Reset Password" onPress={handleResetPassword} loading={isLoading} />
      </Card>
    </ScrollView>
  );
};

export default ResetPasswordScreen;