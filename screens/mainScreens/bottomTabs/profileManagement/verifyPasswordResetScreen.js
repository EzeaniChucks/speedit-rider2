import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AntIcons from '@react-native-vector-icons/ant-design';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  useVerifyPasswordResetMutation,
  useResendVerificationCodeMutation,
} from '../../../../store/profileApi';
import {TextInput} from 'react-native-paper';

const VerifyPasswordResetScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [verifyReset, {isLoading: isVerifying}] =
    useVerifyPasswordResetMutation();
  const [resendCode, {isLoading: isResending}] =
    useResendVerificationCodeMutation();
  const [code, setCode] = useState('');
  const {verificationId} = route.params;
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleGoBack = () => navigation.goBack();

  const handleSubmit = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    try {
      const response = await verifyReset({code}).unwrap();
      if (response.success) {
        navigation.navigate('PasswordResetSuccess');
      }
    } catch (error) {
      Alert.alert('Error', error.data?.error || 'Failed to verify code');
    }
  };

  const handleResend = async () => {
    try {
      const response = await resendCode({verificationId}).unwrap();
      if (response.success) {
        setTimeLeft(30 * 60); // Reset timer
        Alert.alert(
          'Success',
          response.message || 'New code sent successfully',
        );
      }
    } catch (error) {
      Alert.alert('Error', error.data?.error || 'Failed to resend code');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <AntIcons name="left-circle" size={24} color="teal" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Code</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.illustration}>
          <AntIcons name="message" size={60} color="teal" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Verification Code</Text>
          <Text style={styles.instructions}>
            We've sent a 6-digit code to your registered phone number
          </Text>

          <TextInput
            label="Verification Code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            mode="outlined"
            style={styles.input}
            theme={{colors: {primary: 'teal'}}}
          />

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {timeLeft > 0
                ? `Code expires in: ${formatTime(timeLeft)}`
                : 'Code expired'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isVerifying && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isVerifying}>
          {isVerifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify Code</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResend}
          disabled={isResending || timeLeft > 0}>
          {isResending ? (
            <ActivityIndicator color="teal" />
          ) : (
            <Text
              style={[
                styles.resendText,
                timeLeft > 0 && styles.resendDisabled,
              ]}>
              Didn't receive code? Resend
            </Text>
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  illustration: {
    alignItems: 'center',
    marginVertical: 30,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  timerText: {
    color: '#666',
    fontSize: 14,
  },
  button: {
    backgroundColor: 'teal',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resendButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    color: 'teal',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resendDisabled: {
    opacity: 0.5,
  },
});

export default VerifyPasswordResetScreen;
