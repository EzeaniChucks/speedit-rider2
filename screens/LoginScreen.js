// SignInScreen.js
import {Box} from 'native-base'; // Removed Icon, Input, Pressable
import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
// MaterialIcons import was likely for the native-base Icon, PaperTextInput.Icon uses MaterialCommunityIcons by default for string names

import AntIcons from '@react-native-vector-icons/ant-design';
import {useDispatch, useSelector} from 'react-redux';
import {
  loginUser,
  clearAuthError,
  resetAuthState,
  setAuthStateFromPersisted,
} from '../store/authSlice'; // Adjust path
import {TextInput as PaperTextInput} from 'react-native-paper'; // Import PaperTextInput

const SignInScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const {loading, error, isAuthenticated, user} = useSelector(
    state => state.auth,
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(resetAuthState());
    });
    return unsubscribe;
  }, [navigation, dispatch]);

  // Your useEffect for navigation based on isAuthenticated and userInfo
  // Make sure your userInfo structure and setup completion logic is correct
  useEffect(() => {
    if (isAuthenticated && user) {
      // Example: Check if essential profile/vehicle information is present
      //userInfo.vehicleType &&  user.vehicleDetails?.plateNumber &&
      const isProfileComplete =
        user.verificationStatus === 'verified' ||
        user.verificationStatus === 'approved';

      console.log('User Info for setup check:', user);
      console.log('Is setup considered complete?', isProfileComplete);

      if (isProfileComplete) {
        navigation.replace('MainApp');
      } else {
        // If any crucial info is missing or verification isn't 'verified'/'approved'
        // Navigate to a screen where the rider can complete their profile/vehicle details/verification
        navigation.replace('DocumentUploadScreen'); // Or e.g., 'CompleteProfileScreen', 'VerificationScreen'
      }
    }
  }, [isAuthenticated, user, navigation]);

  useEffect(() => {
    if (error) {
      Alert.alert(
        'Login Error',
        error.error || error.data || 'An unexpected error occurred.',
      );
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const handleContinue = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Email and password are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }
    const resultAction = dispatch(loginUser({email, password}));
    console.log('Login result:', loading, resultAction); // Log the result action
    if (loginUser.fulfilled.match(resultAction)) {
      console.log('Login successful:', resultAction.payload.data);
      // Reset email and password fields after successful login
      setAuthStateFromPersisted({
        token: resultAction.payload.data.token,
        user: resultAction.payload.data,
      });
      // setEmail('');
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Fallback if there's no screen to go back to (e.g., deep link directly to SignIn)
      navigation.navigate('CreateAccountScreen'); // Or your primary entry point
    }
  };

  const isButtonDisabled = !email.trim() || !password.trim();

  // Common theme for PaperTextInput to match button's borderRadius and control colors
  const paperInputTheme = {
    roundness: 8, // Matches button borderRadius
    colors: {
      // text: '#000', // Default text color
      // placeholder: '#666', // Default placeholder color for outlined mode
      // primary: 'teal', // Color for focused outline and label
      // background: '#f0f0f0' // If you want a light background for the input field itself
    },
  };
  const activeOutlineColor = '#FFAB40'; // Color for the outline when focused

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'dark-content'} />
      <Box
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
        marginBottom={20}
        width="100%">
        <TouchableOpacity onPress={handleGoBack} style={{padding: 5}}>
          <AntIcons name="left-circle" size={30} color="teal" />
        </TouchableOpacity>
      </Box>
      <Text style={styles.title}>Sign in</Text>

      <PaperTextInput
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address" // More specific for email
        autoCapitalize="none"
        mode="outlined" // Gives a bordered appearance
        style={[styles.inputStyle, {marginBottom: 20}]} // NativeBase marginBottom={5} is approx 20px
        theme={paperInputTheme}
        outlineColor="#ccc" // Default outline color
        activeOutlineColor={activeOutlineColor} // Outline color on focus
        // dense // Uncomment if you want a more compact input (height ~48dp)
      />

      <PaperTextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword} 
        mode="outlined"
        style={[styles.inputStyle, {marginBottom: 12,color:'black'}]} // NativeBase marginBottom={3} is approx 12px
        theme={paperInputTheme}
        outlineColor="#ccc"
        activeOutlineColor={activeOutlineColor}
        right={
          <PaperTextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'} // Corrected icon logic
            onPress={() => setShowPassword(!showPassword)}
            color="grey" // Or use theme color: paperInputTheme.colors.placeholder
          />
        }
        // dense // Uncomment if you want a more compact input || loading =='pending'
      />

      <TouchableOpacity
        onPress={() =>
          Alert.alert(
            'Forgot Password',
            'Forgot password functionality to be implemented.',
          )
        }>
        <Text style={styles.forgotPassword}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.continueButton,
          isButtonDisabled && styles.disabledButton,
        ]}
        onPress={() => handleContinue()}
        disabled={isButtonDisabled} // Also disable if loading
      >
        {loading == 'pending' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('CreateAccountScreen')}
        style={styles.createAccountLink}>
        <Text style={styles.createAccountText}>
          Don't have an account? <Text style={styles.link}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  // Style for PaperTextInput if you need to override default height or add specific background
  inputStyle: {
    // height: 50, // If you want to force a specific height similar to native-base. Paper's default outlined is around 56dp, dense is ~48dp.
    backgroundColor: '#fff', // Or a light gray like '#f9f9f9' if you prefer a filled look
    // For PaperTextInput, padding is usually handled by its internal structure and `contentStyle` prop if needed.
  },
  // inputNativeBase style is no longer needed as it was for native-base Input
  forgotPassword: {
    color: 'teal',
    marginBottom: 20,
    textAlign: 'right',
    fontSize: 14,
  },
  continueButton: {
    backgroundColor: '#FFAB40',
    borderRadius: 8, // Used this for PaperTextInput theme.roundness
    alignItems: 'center',
    paddingVertical: 15,
    width: '100%',
  },
  disabledButton: {
    backgroundColor: 'lightgray',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  createAccountLink: {
    marginTop: 30,
    alignItems: 'center',
  },
  createAccountText: {
    fontSize: 14,
    color: '#555',
  },
  link: {
    color: 'teal',
    fontWeight: 'bold',
  },
});

export default SignInScreen;
