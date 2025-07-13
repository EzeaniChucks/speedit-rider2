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
  basic_info: 'DocumentUploadScreen',
  documents: 'DocumentCollectionScreen',
  vehicle: 'VehicleSelectionScreen',
  bank: 'BankCollectionScreen',
  completed: 'MainApp',
};

const SplashScreen = ({ navigation }: { navigation: any }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { isInitialized, isAuthenticated, loading } = useSelector(
    (state: any) => state.auth,
  );

  // Initialize auth state from AsyncStorage
  useEffect(() => {
    const init = async () => {
      await dispatch(initializeAuthFromStorage());

      const [hasOnboarded, isRider, onboardingStep] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_HAS_ONBOARDED),
        AsyncStorage.getItem(STORAGE_KEYS.USER_IS_RIDER),
        AsyncStorage.getItem(STORAGE_KEYS.RIDER_ONBOARDING_STEP),
      ]);

      // important return statement line to hold splash until isinitialized is true
      // prevents wrong navigation
      if (!isInitialized || loading === 'pending') return;

      // console.log(
      //   'rider states',
      //   hasOnboarded,
      //   isAuthenticated,
      //   isRider,
      //   onboardingStep,
      //   onboardingStep,
      // );

      if (hasOnboarded !== 'true') {
        navigation.replace('Onboarding');
      } else if (!isAuthenticated) {
        navigation.replace('Login');
      } else if (
        onboardingStep &&
        onboardingStep !== 'completed'
      ) {
        let step = onboardingStep as unknown;
        navigation.replace(
          stepMap[step as RiderOnboardingStep['step']] ||
            'DocumentUploadScreen',
        );
      } else {
        navigation.replace('MainApp');
      }
    };

    init();
  }, [isInitialized]); // Only rerun when these change

  return (
    <Box style={styles.container} bg="teal.700">
      <View style={styles.content}>
        <Image
          source={require('../../assests/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {/* <ActivityIndicator
          size="small"
          color={colors.teal[200]}
          style={styles.loader}
        /> */}
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
