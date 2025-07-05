import { StackScreenProps } from '@react-navigation/stack';

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  VerifyOtp: { email?: string }; // Pass email or a temporary token if needed
  ResetPassword: { email?: string }; // Pass email or a temporary token if needed
  CreateAccountScreen: undefined; // For creating a new account
  AccountCreatedScreen: undefined; // For confirming account creation
  CreatePasswordScreen: undefined; // For setting a password during onboarding
  Onboarding: undefined; // Initial onboarding screen
  DocumentUploadScreen: undefined; // For uploading documents during onboarding
  VehicleSelectionScreen: undefined; // For selecting vehicle during onboarding
  LicenseCollectionScreen: undefined; // For collecting license information during onboarding

};

export type AppStackParamList = {
  Home: undefined;
  Profile: undefined;
  OrderList: undefined; // List of orders
  OrderDetails: { orderId: string }; // Details of a specific order
  OrderPicked: { orderId: string }; // When an order is picked 
  Settings: undefined; // Settings screen
  Notifications: undefined; // Notifications screen
  Chat: undefined; // Chat with support or other users
  CustomerTrack: { customerId: string }; // Track a specific customer
  PickupScreen: { orderId: string }; // Screen for picking up an order
  DeliveryScreen: { orderId: string }; // Screen for delivering an order
  Earnings: undefined; // Screen for viewing earnings
  
  // ... other authenticated screens
};

export type RootStackParamList = AuthStackParamList & AppStackParamList & {
    AuthLoading: undefined; // For initial check
    MainAppFlow: undefined; // For authenticated users
    AuthFlow: undefined; // For unauthenticated users
};


// Screen specific prop types
export type LoginScreenProps = StackScreenProps<AuthStackParamList, 'Login'>;
export type ForgotPasswordScreenProps = StackScreenProps<AuthStackParamList, 'ForgotPassword'>;
export type VerifyOtpScreenProps = StackScreenProps<AuthStackParamList, 'VerifyOtp'>;
export type ResetPasswordScreenProps = StackScreenProps<AuthStackParamList, 'ResetPassword'>;

export type HomeScreenProps = StackScreenProps<AppStackParamList, 'Home'>;
export type ProfileScreenProps = StackScreenProps<AppStackParamList, 'Profile'>;