import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AntIcons from '@react-native-vector-icons/ant-design';
import { useNavigation, useRoute } from '@react-navigation/native';
import axiosInstance from '../../../store/instance';

const WithdrawalOTPScreen = () => {
  const navigation: any = useNavigation();
  const route = useRoute();
  const { withdrawalData } = route.params as any; // Pass all withdrawal data

  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Handle countdown timer
  useEffect(() => {
    const timer: any =
      countdown > 0 &&
      setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(
        '/payments/finalize_withdrawal',
        {
          entityType: withdrawalData.entityType,
          reference: withdrawalData.reference,
          otp,
        },
      );

      // console.log('funding otp finalization result:', response);

      if (response.data.data.success) {
        setOtp('');
        navigation.replace('WithdrawalSuccess', {
          amount: withdrawalData.amount,
          accountName: withdrawalData.accountName,
          bankName: withdrawalData.bankName,
        });
      }
    } catch (error: any) {
      // console.log(
      //   'funding finalization error message:',
      //   error.message,
      //   error.response,
      // );
      Alert.alert(
        'Error',
        error?.response?.data?.error ||
          error?.message ||
          'OTP verification failed. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOTP = async () => {
    setCountdown(60);
    try {
      const response = await axiosInstance.post('/payments/resend_otp', {
        entityType: 'rider',
        reference: withdrawalData.reference,
      });

      // console.log('otp resend:', response);

      Alert.alert(
        'OTP Resent',
        response.data.data.message || 'A new OTP has been sent to your phone',
      );
    } catch (error: any) {
      // console.log(error.response?.data?.error, error?.message),
        Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntIcons name="left" size={24} color="teal" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>OTP Verification</Text>
          <View style={{ width: 24 }} /> {/* Spacer */}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to your phone number ending with{' *******'}
            {withdrawalData.phoneNumber?.slice(-4) || '****'}
          </Text>

          <TextInput
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
            autoFocus
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              (otp.length !== 6 || isSubmitting) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={otp.length !== 6 || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify & Complete</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            {countdown > 0 ? (
              <Text style={styles.resendText}>Resend OTP in {countdown}s</Text>
            ) : (
              <TouchableOpacity onPress={resendOTP}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  otpInput: {
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    padding: 15,
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: 'teal',
  },
  submitButton: {
    backgroundColor: 'teal',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resendContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  resendText: {
    color: '#666',
  },
  resendLink: {
    color: 'teal',
    fontWeight: 'bold',
  },
});

export default WithdrawalOTPScreen;
