import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {TextInput} from 'react-native-paper';
import AntDesign from '@react-native-vector-icons/ant-design';
import {useInitiatePasswordResetMutation} from '../../../store/authApi';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [initiateReset, {isLoading}] = useInitiatePasswordResetMutation();
  const navigation = useNavigation();

  const handleGoBack = () => navigation.goBack();

  const handleSubmit = async () => {
    try {
      const response = await initiateReset(email).unwrap();
      // console.log('forgot password response:', response);
      if (response?.success) {
        navigation.navigate('ForgotPasswordComplete', {
          verificationId: response?.data?.verificationId,
          email,
        });
      }
    } catch (error) {
      console.log('forgot password error:', error?.response, error);
      Alert.alert(
        'Error',
        typeof error?.data?.error ? error?.data?.error : 'Failed to send code',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <AntDesign name="left-circle" size={24} color="#008080" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forgot Password</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.illustrationContainer}>
            <AntDesign
              name="lock"
              size={72}
              color="#008080"
              style={styles.icon}
            />
            <Text style={styles.subtitle}>
              Enter your email. We will send a verification code to the phone
              number linked to entered email
            </Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              style={styles.input}
              theme={{
                colors: {
                  primary: '#008080',
                  placeholder: '#999',
                },
              }}
              left={<AntDesign name="account-book" color="black" size={40} />}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Send Verification Code</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0F2F1',
    backgroundColor: '#E0F2F1',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#008080',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 100,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#5F9EA0',
    textAlign: 'center',
    marginTop: 8,
    padding: 10,
  },
  formContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#FFF',
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#008080',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
