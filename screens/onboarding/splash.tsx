import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
  Text,
  Alert,
} from 'react-native';
import { Box, useTheme } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuthFromStorage } from '../../store/authSlice';
import { AppDispatch } from '../../store';
import { STORAGE_KEYS } from '../../util/storageKeys';

// import { STORAGE_KEYS } from '../../constants/storageKeys';

interface RiderOnboardingStep {
  step: 'basic_info' | 'documents' | 'vehicle' | 'bank' | 'completed';
}

const stepMap: Record<RiderOnboardingStep['step'], string> = {
  basic_info: 'BecomeRiderScreen',
  documents: 'DocumentCollectionScreen',
  vehicle: 'VehicleSelectionScreen',
  bank: 'BankCollectionScreen',
  completed: 'MainApp',
};

const SplashScreen = ({ navigation }: { navigation: any }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, loading } = useSelector(
    (state: any) => state.auth,
  );

  // Initialize auth state from AsyncStorage
  useEffect(() => {
    dispatch(initializeAuthFromStorage());
  }, [dispatch]);

  const checkUserState = async () => {
    try {
      // Wait for auth initialization
      if (loading === 'pending') return;

      // Minimum display time for splash screen
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check AsyncStorage for onboarding and rider status
      const [hasOnboarded, isRider, onboardingStep] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_HAS_ONBOARDED),
        AsyncStorage.getItem(STORAGE_KEYS.USER_IS_RIDER),
        AsyncStorage.getItem(STORAGE_KEYS.RIDER_ONBOARDING_STEP),
      ]);

      // Navigation logic
      if (hasOnboarded !== 'true') {
        navigation.replace('Onboarding');
      } else if (!user || !token) {
        navigation.replace('Login');
      } else if (
        isRider === 'true' &&
        onboardingStep &&
        onboardingStep !== 'completed'
      ) {
        // Rider onboarding in progress
        handleRiderOnboardingNavigation(
          onboardingStep as RiderOnboardingStep['step'],
        );
      } else {
        // Fully onboarded user
        navigation.replace('MainApp');
      }
    } catch (error) {
      console.error('Error checking user state:', error);
      Alert.alert('Error', 'Failed to load user state. Please try again.');
      navigation.replace('Login'); // Fallback to Login for auth-related issues
    }
  };

  useEffect(() => {
    if (loading !== 'pending') {
      checkUserState();
    }
  }, [navigation, isAuthenticated, user, token, loading]);

  const handleRiderOnboardingNavigation = (
    step: RiderOnboardingStep['step'],
  ) => {
    const targetScreen = stepMap[step] || 'BecomeRiderScreen';
    navigation.replace(targetScreen);
  };

  return (
    <Box style={styles.container} bg="teal.500">
      <View style={styles.content}>
        <Image
          source={require('../../assests/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ActivityIndicator
          size="small"
          color={colors.teal[200]}
          style={styles.loader}
        />
      </View>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 270,
    height: 270,
    marginBottom: 20,
  },
  loader: {
    marginTop: 10,
  },
});

export default SplashScreen;
