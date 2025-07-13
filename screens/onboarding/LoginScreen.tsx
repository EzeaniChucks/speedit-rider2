import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import AntDesign from '@react-native-vector-icons/ant-design';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginUser,
  clearAuthError,
  resetAuthState,
  initializeAuthFromStorage,
} from '../../store/authSlice';
import { TextInput } from 'react-native-paper';
import { AppDispatch } from '../../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../util/storageKeys';

const SignInScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, isAuthenticated, user, token } = useSelector(
    (state: any) => state.auth,
  );

  // // Initialize auth state from AsyncStorage
  // useEffect(() => {
  //   dispatch(initializeAuthFromStorage());
  // }, [dispatch]);

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', () => {
  //     dispatch(resetAuthState());
  //   });
  //   return unsubscribe;
  // }, [navigation, dispatch]);

  useEffect(() => {
    const handlePostLogin = async () => {
      console.log(isAuthenticated, user, token);
      if (!isAuthenticated || !user || !token) {
        return;
      }

      try {
        const isProfileComplete = ['verified', 'approved'].includes(
          user.verificationStatus,
        );

        // Parallelize all storage operations
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.USER_HAS_ONBOARDED, 'true'),
          AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user)),
          AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(token)),
          !isProfileComplete
            ? AsyncStorage.setItem(
                STORAGE_KEYS.RIDER_ONBOARDING_STEP,
                'basic_info', // Set initial step if needed
              )
            : Promise.resolve(),
        ]);

        // Determine navigation destination
        let targetScreen = 'MainApp';
        if (!isProfileComplete) {
          targetScreen = 'DocumentUploadScreen';
        }

        navigation.replace(targetScreen);
      } catch (err) {
        console.error('Post-login storage error:', err);
        Alert.alert(
          'Storage Error',
          "Your login was successful but we couldn't save your session. Please restart the app.",
        );
        // Fallback to safe screen
        navigation.replace('MainApp');
      }
    };

    handlePostLogin();

    // if (isAuthenticated && user) {
    //   // console.log(user)
    //   const isProfileComplete =
    //     user.verificationStatus === 'verified' ||
    //     user.verificationStatus === 'approved';

    //   const saveToStorage = async () => {
    //     try {
    //       await Promise.all([
    //         AsyncStorage.setItem(STORAGE_KEYS.USER_HAS_ONBOARDED, 'true'),
    //         AsyncStorage.setItem(STORAGE_KEYS.USER_IS_RIDER, 'true'),
    //         AsyncStorage.setItem(
    //           STORAGE_KEYS.USER_PROFILE,
    //           JSON.stringify(user),
    //         ),
    //         AsyncStorage.setItem(
    //           STORAGE_KEYS.AUTH_TOKEN,
    //           JSON.stringify(token),
    //         ),
    //         AsyncStorage.setItem(
    //           STORAGE_KEYS.RIDER_ONBOARDING_STEP,
    //           'basic_info',
    //         ),
    //       ]);
    //       navigation.replace(
    //         isProfileComplete ? 'MainApp' : 'DocumentUploadScreen',
    //       );
    //     } catch (err) {
    //       console.error('Failed to save to AsyncStorage:', err);
    //       Alert.alert('Error', 'Failed to save user data. Please try again.');
    //     }
    //   };

    //   saveToStorage();
    // }
  }, [isAuthenticated, user, token]);

  useEffect(() => {
    if (error) {
      Alert.alert(
        'Login Error',
        error.error || error.data || 'An unexpected error occurred.',
      );
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Email and password are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }
    const result = await dispatch(loginUser({ email, password }));
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('RegisterPersonalInfo');
    }
  };

  const isButtonDisabled = !email.trim() || !password.trim();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'dark-content'} backgroundColor="#E0F2F1" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <AntDesign name="left-circle" size={24} color="#008080" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sign In</Text>
          </View>

          <View style={styles.illustrationContainer}>
            <AntDesign
              name="user"
              size={72}
              color="#008080"
              style={styles.icon}
            />
            <Text style={styles.subtitle}>
              Welcome back! Please sign in to continue
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <AntDesign
                name="mail"
                size={24}
                color="#999"
                style={styles.inputIcon}
              />
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
              />
            </View>

            <View style={styles.inputContainer}>
              <AntDesign
                name="lock"
                size={24}
                color="#999"
                style={styles.inputIcon}
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  mode="outlined"
                  style={[styles.input, styles.passwordInput]}
                  theme={{
                    colors: {
                      primary: '#008080',
                      placeholder: '#999',
                    },
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIconButton}
                >
                  <AntDesign
                    name={showPassword ? 'eye-invisible' : 'eye'}
                    size={24}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPasswordInitiate')}
              style={styles.forgotPasswordButton}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isButtonDisabled || loading === 'pending'}
            >
              {loading === 'pending' ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('RegisterPersonalInfo')}
              >
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#008080',
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
  },
  formContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 10,
    alignSelf: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  passwordContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeIconButton: {
    position: 'absolute',
    right: 10,
    padding: 10,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#008080',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#008080',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#FF6347', // Coral color for logout to distinguish from sign-in
    flexDirection: 'row',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signUpText: {
    color: '#666',
    fontSize: 14,
  },
  signUpLink: {
    color: '#008080',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SignInScreen;
