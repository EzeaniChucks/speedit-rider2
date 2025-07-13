import React, { useState, useEffect } from 'react';
import {
  View,
  Alert,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
// Icon from 'react-native-vector-icons/FontAwesome6' is no longer needed for PaperTextInput's eye icon
import { Box } from 'native-base';
import AntIcons from '@react-native-vector-icons/ant-design';
// import AntIcons from '@react-native-vector-icons/AntIcons';
import { useDispatch, useSelector } from 'react-redux';
import {
  registerUser,
  resetAuthState,
  clearAuthError,
} from '../../store/authSlice'; // Adjust path
import { TextInput as PaperTextInput } from 'react-native-paper'; // Import PaperTextInput
import { AppDispatch } from '../../store';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ValidationResult {
  valid: boolean;
  reasons: {
    length: boolean;
    upper: boolean;
    lower: boolean;
    number: boolean;
    special: boolean;
  };
}

const CreatePasswordScreen = ({ navigation }: { navigation: any }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordMessage, setConfirmPasswordMessage] = useState('');
  const [isPasswordVisible, setPasswordVisibility] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisibility] =
    useState(false);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { registrationForm, loading, error, isRegistered } = useSelector(
    (state: any) => state.auth,
  );

  useEffect(() => {
    // Reset auth state when component mounts
    dispatch(resetAuthState());
    // No need to return a cleanup function that does the same if you want it only on mount
  }, [dispatch]);

  // useEffect(() => {
  //   if (isRegistered) {
  //   }
  // }, [isRegistered, navigation, dispatch]);

  // useEffect(() => {
  //   if (error) {
  //     Alert.alert(
  //       'Registration Error',
  //       error.message || 'An unknown error occurred.',
  //     );
  //     dispatch(clearAuthError());
  //   }
  // }, [error, dispatch]);

  const fcmToken = useSelector((state: any) => state.auth.fcmToken);

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!isPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisibility(!isConfirmPasswordVisible);
  };

  const validatePassword = (pass: string): ValidationResult => {
    const minLength = 10;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    const isValid =
      pass.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar;

    return {
      valid: isValid,
      reasons: {
        length: pass.length >= minLength,
        upper: hasUpperCase,
        lower: hasLowerCase,
        number: hasNumber,
        special: hasSpecialChar,
      },
    };
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    const result = validatePassword(text);
    setValidationResult(result);
    if (confirmPassword && text !== confirmPassword) {
      setConfirmPasswordMessage('Error: Passwords do not match');
    } else if (confirmPassword && text === confirmPassword) {
      setConfirmPasswordMessage('Passwords match');
    } else {
      setConfirmPasswordMessage('');
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (password !== text) {
      setConfirmPasswordMessage('Error: Passwords do not match');
    } else {
      setConfirmPasswordMessage('Passwords match');
    }
  };

  const handleCreateAccount = async () => {
    if (!validationResult || !validationResult.valid) {
      Alert.alert(
        'Invalid Password',
        'Please ensure your password meets all criteria.',
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    const userData = {
      ...registrationForm,
      fcmToken,
      password,
    };
    const result = await dispatch(registerUser(userData));
    if (result.meta.requestStatus === 'fulfilled') {
      await AsyncStorage.setItem('@user_has_onboarded', 'true');
      // When starting rider onboarding
      await AsyncStorage.multiSet([
        ['@user_is_rider', 'true'],
        ['@rider_onboarding_step', 'basic_info'],
      ]);

      // After completing each step, update the progress
      // await AsyncStorage.setItem('@rider_onboarding_step', 'next_step_name');

      // When completely done:
      // await AsyncStorage.setItem('@rider_onboarding_step', 'completed');

      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('AccountCreatedScreen');
      dispatch(resetAuthState()); // Reset after navigation and success
    } else {
      if (result?.payload && result?.payload?.error) {
        // console.log('from create password screen:', result?.payload.error);
        Alert.alert(
          'Oops! Lets try that again',
          typeof result.payload.error == 'string'
            ? result.payload.error
            : 'Something went wrong with registration. Please try again or contact support at 08067268692',
        );
        dispatch(clearAuthError());
      }
    }
  };

  const getValidationStyle = (isValid: boolean | undefined) => ({
    color: isValid ? 'green' : 'red',
    fontSize: 14,
    lineHeight: 20, // Added for better spacing in the list
  });

  // Common theme for PaperTextInput
  const paperInputTheme = {
    roundness: 5, // Match button borderRadius
    colors: {
      // primary: 'teal', // Outline color when focused, can be set via activeOutlineColor prop too
      // placeholder: 'gray' // For the label when it's acting as placeholder
    },
  };
  const activeOutlineColor = 'teal'; // Consistent focus color

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <Box
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
          marginBottom={20}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: 5 }}
          >
            <AntIcons name="left-circle" size={30} color="teal" />
          </TouchableOpacity>
        </Box>
        <Text style={styles.header}>Create password</Text>

        <PaperTextInput
          label="Enter password"
          mode="outlined"
          secureTextEntry={!isPasswordVisible}
          value={password}
          onChangeText={handlePasswordChange}
          style={styles.paperInputStyle}
          theme={paperInputTheme}
          outlineColor="#ccc"
          activeOutlineColor={activeOutlineColor}
          right={
            <PaperTextInput.Icon
              icon={() => (
                <AntIcons
                  name={isPasswordVisible ? 'eye-invisible' : 'eye'}
                  size={20}
                  color="gray"
                />
              )}
              onPress={togglePasswordVisibility}
            />
          }
        />

        <PaperTextInput
          label="Confirm password"
          mode="outlined"
          secureTextEntry={!isConfirmPasswordVisible}
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          style={styles.paperInputStyle}
          theme={paperInputTheme}
          outlineColor="#ccc"
          activeOutlineColor={activeOutlineColor}
          right={
            <PaperTextInput.Icon
              icon={() => (
                <AntIcons
                  name={isConfirmPasswordVisible ? 'eye-invisible' : 'eye'}
                  size={20}
                  color="gray"
                />
              )}
              onPress={toggleConfirmPasswordVisibility}
            />
          }
        />

        {/* Password match message */}
        <View style={styles.confirmMessageContainer}>
          {confirmPasswordMessage ? (
            <Text
              style={[
                styles.confirmMessageText,
                {
                  color: confirmPasswordMessage.startsWith('Error:')
                    ? 'red'
                    : 'green',
                },
              ]}
            >
              {confirmPasswordMessage}
            </Text>
          ) : null}
        </View>

        <Box
          flexDirection="column"
          justifyContent="space-between"
          marginBottom={20}
          marginTop={10}
        >
          <Text style={styles.validationHeader}>Password must contain:</Text>
          <View style={styles.validationList}>
            <Text style={getValidationStyle(validationResult?.reasons.length)}>
              {validationResult?.reasons.length ? '✔' : '✖'} Minimum 10
              characters
            </Text>
            <Text style={getValidationStyle(validationResult?.reasons.upper)}>
              {validationResult?.reasons.upper ? '✔' : '✖'} 1 uppercase letter
              (A-Z)
            </Text>
            <Text style={getValidationStyle(validationResult?.reasons.lower)}>
              {validationResult?.reasons.lower ? '✔' : '✖'} 1 lowercase letter
              (a-z)
            </Text>
            <Text style={getValidationStyle(validationResult?.reasons.number)}>
              {validationResult?.reasons.number ? '✔' : '✖'} 1 number (0-9)
            </Text>
            <Text style={getValidationStyle(validationResult?.reasons.special)}>
              {validationResult?.reasons.special ? '✔' : '✖'} 1 special
              character (e.g. !@#$%^&*)
            </Text>
          </View>
        </Box>

        <Box mt={20}>
          <Text style={styles.privacyPolicy}>
            By continuing you agree to our{' '}
            <Text
              style={styles.link}
              onPress={() => Alert.alert('Info', 'Navigate to Privacy Policy')}
            >
              privacy policy
            </Text>{' '}
            and cookies.
          </Text>

          <TouchableOpacity
            style={[
              styles.createButton,
              (loading === 'pending' ||
                !validationResult?.valid ||
                password !== confirmPassword) &&
                styles.disabledButton,
            ]}
            onPress={handleCreateAccount}
            disabled={!validationResult?.valid || password !== confirmPassword}
          >
            {loading === 'pending' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create account</Text>
            )}
          </TouchableOpacity>
        </Box>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  paperInputStyle: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  confirmMessageContainer: {
    height: 20,
    marginBottom: 5,
  },
  confirmMessageText: {
    fontSize: 14,
  },
  validationHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  validationList: {
    marginLeft: 10,
  },
  privacyPolicy: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  link: {
    color: 'teal',
    textDecorationLine: 'underline',
  },
  createButton: {
    backgroundColor: 'teal',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreatePasswordScreen;
