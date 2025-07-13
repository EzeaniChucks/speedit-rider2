import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/onboarding/LoginScreen';
import OrderDetailsScreen from './screens/order/OrderDetailsScreen';
import SettingsScreen from './SettingsScreen';
// import BecomeRiderScreen from './screens/onboarding/becomeRider';
// import BecomeRiderTwoScreen from './screens/onboarding/becomeRiderStep_two';
import BottomTabNavigator from './nav/index'; // Adjust the path
import CreatePasswordScreen from './screens/onboarding/CreatePassword';
import BankCollectionScreen from './screens/onboarding/BankCollectionScreen';
import DocumentCollectionScreen from './screens/onboarding/setProfillePhoto';
import DocumentUploadScreen from './screens/onboarding/Documentupload';
import VehicleSelectionScreen from './screens/onboarding/VehicleSelectionScreen';
import AccountCreatedScreen from './screens/onboarding/AccountCreatedScreen'; // Adjust the path
import OnboardingScreen from './screens/onboarding/OnboardingScreen'; // Adjust the path as necessary
import { setNavigator } from './NavigationService'; // Import the navigation service
import {
  useTheme,
  DefaultTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import { NativeBaseProvider } from 'native-base';
import OrderPicked from './screens/ConfirmOrder';
import TrackCustomer from './screens/TrackCustomer';
import DeliveryScreen from './screens/DeliveryScreen';
import { store } from './store';
import { Alert, Platform, PermissionsAndroid, StatusBar } from 'react-native';
//import { PersistGate } from 'redux-persist/integration/react'; // If using redux-persist
import { Provider as ReduxProvider, useDispatch } from 'react-redux';
import { setFcmToken } from './store/authSlice';
import messaging, { firebase } from '@react-native-firebase/messaging';
import { firebaseConfig } from './firebaseCon';
import LicenseCollectionScreen from './screens/onboarding/LicenseCollection ';
import AvailableOrdersScreen from './screens/avalOrders';
import AvailableRidersScreen from './screens/availDash';
import OrderProgressScreen from './screens/order/OrderProgressionScreen';
import DeliveryAcknowledgement from './screens/DeliveryAcknowledgement';
import TransactionHistoryScreen from './screens/transactionsHistory';
import ForgotPasswordScreen from './screens/onboarding/forgotPassword/forgotPasswordScreen';
import ForgotPasswordCompleteScreen from './screens/onboarding/forgotPassword/resetPasswordScreen';
import SplashScreen from './screens/onboarding/splash';
import RegistrationPersonalInformationScreen from './screens/onboarding/Registration_Personal_Info';
import RegistrationVehicleInformationScreen from './screens/onboarding/Registration_Vehicle_Info';
import WithdrawalScreen from './screens/mainScreens/fundingAndWithdrawal/walletWithdrawalScreen';
import WalletFundScreen from './screens/mainScreens/fundingAndWithdrawal/walletFundScreen';
import PaymentSuccessScreen from './screens/mainScreens/fundingAndWithdrawal/walletFundSuccessScreen';
import WithdrawalOTPScreen from './screens/mainScreens/fundingAndWithdrawal/walletWithdrawalOTPscreen';
import WithdrawalSuccessScreen from './screens/mainScreens/fundingAndWithdrawal/walletWithdrawalSuccess';
import EditProfileScreen from './screens/mainScreens/bottomTabs/profileManagement/userProfileEditScreen';
import InitiatePasswordResetScreen from './screens/mainScreens/bottomTabs/profileManagement/initiatePasswordResetScreen';
import VerifyPasswordResetScreen from './screens/mainScreens/bottomTabs/profileManagement/verifyPasswordResetScreen';
import PasswordResetSuccessScreen from './screens/mainScreens/bottomTabs/profileManagement/passwordResetSuccessScreen';
import OrderHistoryScreen from './screens/order/OrderHistoryScreen';
import { requestUserPermissionAndGetToken } from './firbaseSetup';

const Stack = createStackNavigator();

const RootNavigation = () => {
  // Move Firebase initialization to index.js or App.js to avoid redundancy
  // If you must initialize here, wrap it in a check to avoid multiple initializations

  useEffect(() => {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
  }, []);

  // Component to handle FCM setup
  const FcmHandler = () => {
    const dispatch = useDispatch();

    useEffect(() => {
      // Only execute FCM-related code on Android until iOS push notifications are enabled
      if (Platform.OS !== 'ios') {
        // 1. Request permission and get initial token
        requestUserPermissionAndGetToken(dispatch);

        // 2. Listen for token refresh
        const unsubscribeTokenRefresh = messaging().onTokenRefresh(newToken => {
          // console.log('FCM Token Refreshed:', newToken);
          // Send to backend here if needed
          dispatch(setFcmToken(newToken));
        });

        // 3. Listen for foreground messages
        const unsubscribeOnMessage = messaging().onMessage(
          async remoteMessage => {
            // console.log('FCM Message Received in Foreground:', JSON.stringify(remoteMessage));
            Alert.alert(
              remoteMessage.notification?.title || 'New Message',
              remoteMessage.notification?.body || 'You have a new message.',
            );
          },
        );

        // 4. Handle notification press when app is in background
        messaging().onNotificationOpenedApp(remoteMessage => {
          console.log(
            'Notification caused app to open from background:',
            remoteMessage,
          );
          // Navigate to a specific screen based on remoteMessage.data
        });

        // 5. Handle notification when app is opened from quit state
        messaging()
          .getInitialNotification()
          .then(remoteMessage => {
            if (remoteMessage) {
              console.log(
                'Notification caused app to open from quit state:',
                remoteMessage,
              );
              // Navigate to a specific screen based on remoteMessage.data
            }
          });

        // Cleanup subscriptions on unmount
        return () => {
          unsubscribeTokenRefresh();
          unsubscribeOnMessage();
        };
      }

      // TODO: Uncomment the following block when upgrading to a paid Apple Developer account to enable iOS push notifications
      /*
      if (Platform.OS === 'ios') {
        // Request permission and get initial token
        requestUserPermissionAndGetToken(dispatch);

        // Listen for token refresh
        const unsubscribeTokenRefresh = messaging().onTokenRefresh(newToken => {
          // console.log('FCM Token Refreshed:', newToken);
          dispatch(setFcmToken(newToken));
        });

        // Listen for foreground messages
        const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
          // console.log('FCM Message Received in Foreground:', JSON.stringify(remoteMessage));
          Alert.alert(
            remoteMessage.notification?.title || 'New Message',
            remoteMessage.notification?.body || 'You have a new message.',
          );
        });

        // Handle notification press when app is in background
        messaging().onNotificationOpenedApp(remoteMessage => {
          console.log('Notification caused app to open from background:', remoteMessage);
          // Navigate to a specific screen based on remoteMessage.data
        });

        // Handle notification when app is opened from quit state
        messaging()
          .getInitialNotification()
          .then(remoteMessage => {
            if (remoteMessage) {
              console.log('Notification caused app to open from quit state:', remoteMessage);
              // Navigate to a specific screen based on remoteMessage.data
            }
          });

        return () => {
          unsubscribeTokenRefresh();
          unsubscribeOnMessage();
        };
      }
      */
    }, [dispatch]);

    return null; // This component doesn't render anything visible
  };

  // Add this custom theme configuration at the top of your file
  const customTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      text: '#000000', // Black text for better contrast
      primary: '#FFAB40', // Your primary color
      placeholder: '#666666', // Darker placeholder text
      background: '#FFFFFF', // White background
      surface: '#FFFFFF', // White surface for components
    },
    roundness: 8, // Consistent with your design
  };

  return (
    <ReduxProvider store={store}>
      <NativeBaseProvider>
        <PaperProvider theme={customTheme}>
          <FcmHandler />
          <StatusBar
            backgroundColor="#008080" // Teal
            barStyle="light-content" // or 'dark-content'
          />
          <NavigationContainer ref={setNavigator}>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
              }}
              initialRouteName="Splash"
              // initialRouteName="Login"
            >
              {/* Changed initial route */}
              {/* Splash Screen - First screen users see */}
              <Stack.Screen name="Splash" component={SplashScreen} />
              {/* Auth Screens */}
              <Stack.Group>
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />

                {/* Password Reset Flow */}
                <Stack.Screen
                  name="ForgotPasswordInitiate"
                  component={ForgotPasswordScreen}
                />
                <Stack.Screen
                  name="ForgotPasswordComplete"
                  component={ForgotPasswordCompleteScreen}
                />
                <Stack.Screen
                  name="InitiatePasswordReset"
                  component={InitiatePasswordResetScreen}
                />
                <Stack.Screen
                  name="VerifyPasswordReset"
                  component={VerifyPasswordResetScreen}
                />
                <Stack.Screen
                  name="PasswordResetSuccess"
                  component={PasswordResetSuccessScreen}
                />
              </Stack.Group>

              {/* Rider Onboarding Flow */}
              <Stack.Group>
                <Stack.Screen
                  name="RegisterPersonalInfo"
                  component={RegistrationPersonalInformationScreen}
                />
                <Stack.Screen
                  name="RegisterVehicleInfo"
                  component={RegistrationVehicleInformationScreen}
                />
                <Stack.Screen
                  name="CreatePasswordScreen"
                  component={CreatePasswordScreen}
                />
                <Stack.Screen
                  name="AccountCreatedScreen"
                  component={AccountCreatedScreen}
                />

                {/* STALE COMPONENTS, BUT MIGHT STILL CONTAIN SOME USEFUL FEATURES FOR THE FUTURE */}
                {/* <Stack.Screen
                  name="BecomeRiderScreen"
                  component={BecomeRiderScreen}
                />
                <Stack.Screen
                  name="BecomeRiderTwoScreen"
                  component={BecomeRiderTwoScreen}
                /> */}

                <Stack.Screen
                  name="DocumentCollectionScreen"
                  component={DocumentCollectionScreen}
                />
                <Stack.Screen
                  name="DocumentUploadScreen"
                  component={DocumentUploadScreen}
                />
                <Stack.Screen
                  name="VehicleSelectionScreen"
                  component={VehicleSelectionScreen}
                />
                <Stack.Screen
                  name="LicenseCollectionScreen"
                  component={LicenseCollectionScreen}
                />
                <Stack.Screen
                  name="BankCollectionScreen"
                  component={BankCollectionScreen}
                />
              </Stack.Group>
              {/* Main App */}
              <Stack.Screen name="MainApp" component={BottomTabNavigator} />
              {/* Order Management */}
              <Stack.Group>
                <Stack.Screen name="OrderList" component={OrderHistoryScreen} />
                <Stack.Screen name="OrderPicked" component={OrderPicked} />
                <Stack.Screen
                  name="OrderDetails"
                  component={OrderDetailsScreen}
                />
                <Stack.Screen
                  name="OrderProgress"
                  component={OrderProgressScreen}
                />

                <Stack.Screen
                  name="DeliveryScreen"
                  component={DeliveryScreen}
                />
                <Stack.Screen
                  name="DeliveryAcknowledgement"
                  component={DeliveryAcknowledgement}
                />
                <Stack.Screen
                  name="avalRides"
                  component={AvailableRidersScreen}
                />
                <Stack.Screen
                  name="avalOrders"
                  component={AvailableOrdersScreen}
                />
              </Stack.Group>
              {/* Wallet & Transactions */}
              <Stack.Group>
                <Stack.Screen
                  name="TransactionHistory"
                  component={TransactionHistoryScreen}
                />
                <Stack.Screen name="WalletFund" component={WalletFundScreen} />
                <Stack.Screen
                  name="PaymentSuccess"
                  component={PaymentSuccessScreen}
                />
                <Stack.Screen
                  name="WithdrawalOTP"
                  component={WithdrawalOTPScreen}
                />
                <Stack.Screen
                  name="WalletWithdrawal"
                  component={WithdrawalScreen}
                />
                <Stack.Screen
                  name="WithdrawalSuccess"
                  component={WithdrawalSuccessScreen}
                />
              </Stack.Group>
              {/* Profile & Settings */}
              <Stack.Group>
                <Stack.Screen name="Settings" component={SettingsScreen} />
                {/* <Stack.Screen
                  name="Notifications"
                  component={NotificationsScreen}
                /> */}
                <Stack.Screen
                  name="EditProfile"
                  component={EditProfileScreen}
                />
                <Stack.Screen name="CustomerTrack" component={TrackCustomer} />
              </Stack.Group>
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </NativeBaseProvider>
    </ReduxProvider>
  );
};

export default RootNavigation;
