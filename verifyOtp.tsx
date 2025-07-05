import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import StyledTextInput from './components/StyledTextInput';
import StyledButton from './components/StyledButton';
import LoadingOverlay from './components/LoadingOverlay';
import { VerifyOtpScreenProps } from './nav.types';
import { useVerifyPasswordResetCodeMutation } from './store/api';
import { setResetCodeVerified } from './store/profileSlice';
import { colors } from './theme/colors';
import { globalStyles } from './theme/style';
import Card from './components/Cards';

const VerifyOtpScreen: React.FC<VerifyOtpScreenProps> = ({ navigation, route }) => {
  const [code, setCode] = useState('');
  const [verifyCode, { isLoading, error, isSuccess, data }] = useVerifyPasswordResetCodeMutation();
  const dispatch = useDispatch();
  const email = route.params?.email; // Passed from ForgotPasswordScreen

  const handleVerifyCode = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter the OTP code.');
      return;
    }
    try {
      await verifyCode({ code }).unwrap();
      // Success handled by useEffect
    } catch (err) {
      console.error("OTP Verification failed:", err);
    }
  };

  useEffect(() => {
    if (isSuccess && data?.success) {
      dispatch(setResetCodeVerified(true));
      Alert.alert('Success', data.message || 'Code verified successfully.');
      navigation.navigate('ResetPassword', { email });
    } else if (isSuccess && !data?.success) {
        Alert.alert('Error', data?.message || 'Invalid OTP code.');
    }
  }, [isSuccess, data, navigation, dispatch, email]);


  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <LoadingOverlay visible={isLoading} text="Verifying OTP..." />
      <Card>
        <Text style={globalStyles.title}>Verify OTP</Text>
        <Text style={globalStyles.subtitle}>
          Enter the OTP code sent to {email || 'your registered contact'}.
        </Text>

        {error && (
          <Text style={globalStyles.errorText}>
            {/* @ts-ignore */}
            Error: {error.data?.message || 'Failed to verify OTP.'}
          </Text>
        )}

        <StyledTextInput
          label="OTP Code"
          value={code}
          onChangeText={setCode}
          placeholder="123456"
          keyboardType="number-pad"
          maxLength={6}
        />
        <StyledButton title="Verify Code" onPress={handleVerifyCode} loading={isLoading} />
      </Card>
    </ScrollView>
  );
};

export default VerifyOtpScreen;