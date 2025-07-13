import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../util/storageKeys';

// --- API URLs ---
const BASE_API_URL = 'https://speedit-server.onrender.com/v1/api/riders/';
const REGISTER_API_URL = `${BASE_API_URL}register/`;
const LOGIN_API_URL = `${BASE_API_URL}login/`;
const UPDATE_TOKEN_API_URL = `${BASE_API_URL}fcm-token/`;

// --- Type Definitions ---

// Matches the RiderProfile in your riderApi.ts or a shared types file
export interface RiderProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleType?: string;
  residentialAddress?: string;
  vehicleDetails?: {
    plateNumber?: string;
    color?: string;
    model?: string;
  };
  verificationStatus?:
    | 'pending'
    | 'verified'
    | 'approved'
    | 'rejected'
    | string;
  // Add other profile fields as needed
}
export interface RiderLoginResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isAvailable?: boolean; // Optional, if availability is part of the profile
  verificationStatus?:
    | 'pending'
    | 'verified'
    | 'approved'
    | 'rejected'
    | string;
  // Add other profile fields as needed
}
// Type for registration data payload
export interface RegisterRiderData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string; // Password will be sent in the thunk
  vehicleType: string;
  residentialAddress: string;
  vehicleDetails: {
    plateNumber: string;
    color: string;
    model: string;
  };
}

// Expected response structure for login (adjust to your API)
interface LoginSuccessResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    rider: RiderLoginResponse;
  };
}

// Expected response structure for registration (adjust to your API)
interface RegisterSuccessResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any; // Or a more specific type if registration returns user data
}

// Type for API error responses
type ApiErrorPayload = {
  data?: Record<string, any> | string; // For API error
  message?: string;
  [key: string]: any;
  error?: Record<string, string[]>; // For validation errors
};

// --- Async Thunks ---

export const registerUser = createAsyncThunk<
  RegisterSuccessResponse, // Return type on success
  RegisterRiderData, // Argument type
  { rejectValue: ApiErrorPayload } // Type for rejectWithValue payload
>('auth/registerUser', async (userData, { rejectWithValue }) => {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData), // userData already includes password
  };
  try {
    const response = await fetch(REGISTER_API_URL, requestOptions);
    const resultText = await response.text();
    let resultData;
    try {
      resultData = JSON.parse(resultText);
      // console.log('Parsed registration response:', resultData);
    } catch (e) {
      // If parsing fails but response was not ok, use text as message
      if (!response.ok) {
        return rejectWithValue({
          message: resultText || `HTTP error! status: ${response.status}`,
        });
      }
      // If parsing fails but response was ok (unexpected), treat as success with text
      resultData = { success: true, message: resultText };
    }

    if (!response.ok) {
      return rejectWithValue(
        (resultData as ApiErrorPayload) || {
          message: `HTTP error! status: ${response.status}`,
        },
      );
    }
    return resultData as RegisterSuccessResponse;
  } catch (error: any) {
    console.log('Registration error:', error);
    return rejectWithValue({
      message:
        error.message || 'An unexpected error occurred during registration',
    });
  }
});

export const loginUser = createAsyncThunk<
  LoginSuccessResponse, // Return type on success
  { email: string; password: string }, // Argument type
  { rejectValue: ApiErrorPayload } // Type for rejectWithValue payload
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  };
  try {
    const response = await fetch(LOGIN_API_URL, requestOptions);
    const resultText = await response.text(); // Read response as text first
    let resultData;
    try {
      resultData = JSON.parse(resultText); // Try to parse as JSON
      console.log('Parsed login response:', resultData);
    } catch (e) {
      // If parsing fails but response was not ok, use text as message
      if (!response.ok) {
        return rejectWithValue({
          message: resultText || `Login failed: ${response.status}`,
        });
      }
      // This case is unlikely for a successful login, but handle it
      return rejectWithValue({ message: 'Login response was not valid JSON.' });
    }

    if (!response.ok) {
      return rejectWithValue(
        (resultData as ApiErrorPayload) || {
          message: `Login failed: ${response.status}`,
        },
      );
    }
    return resultData as LoginSuccessResponse;
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || 'An unexpected error occurred during login',
    });
  }
});

export const updateFcmToken = createAsyncThunk(
  'auth/updateFcmToken',
  async (
    { fcmToken, token }: { fcmToken: string; token: string },
    { rejectWithValue },
  ) => {
    const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token: fcmToken }),
    };
    try {
      const response = await fetch(UPDATE_TOKEN_API_URL, requestOptions);
      const resultText = await response.text(); // Read response as text first
      let resultData;
      try {
        resultData = JSON.parse(resultText); // Try to parse as JSON
        // console.log('Parsed update fcm token response:', resultData);
      } catch (e) {
        // If parsing fails but response was not ok, use text as message
        if (!response.ok) {
          return rejectWithValue({
            message: resultText || `FCMToken update failed: ${response.status}`,
          });
        }
        // This case is unlikely for a successful login, but handle it
        return rejectWithValue({
          message: 'FCmtOKEN UPDATE response was not valid JSON.',
        });
      }

      if (!response.ok) {
        return rejectWithValue(
          (resultData as ApiErrorPayload) || {
            message: `FCMToken update failed: ${response.status}`,
          },
        );
      }
      return resultData as LoginSuccessResponse;
    } catch (error: any) {
      return rejectWithValue({
        message:
          error.message ||
          'An unexpected error occurred while updating fcmtokem',
      });
    }
  },
);

// Async thunk to initialize auth state from AsyncStorage
export const initializeAuthFromStorage = createAsyncThunk(
  'auth/initializeAuthFromStorage',
  async (_, { dispatch }) => {
    try {
      const [userData, tokenData] = await Promise.all([
        AsyncStorage.getItem('@user_profile'),
        AsyncStorage.getItem('@auth_token'),
      ]);
      // console.log(userData, tokenData);

      const user = userData ? JSON.parse(userData) : null;
      const token = tokenData ? JSON.parse(String(tokenData)) : null;

      return { user, token };
    } catch (error) {
      console.error('Failed to initialize auth from AsyncStorage:', error);
      return { user: null, token: null };
    }
  },
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE),
        AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
      ]);
      return true;
    } catch (error) {
      console.error('Failed to clear AsyncStorage on logout:', error);
      throw error;
    }
  },
);
// --- Auth Slice Definition ---

interface AuthState {
  // Registration form state (excluding password for security in store)
  registrationForm: Omit<RegisterRiderData, 'password'>;
  isRegistered: boolean; // Flag for successful registration step

  user: RiderProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isProfileSetupComplete: boolean;

  loading: 'idle' | 'pending'; // More specific loading state
  error: ApiErrorPayload | null; // For storing error messages/objects
  fcmToken: string | null; // Add this

  isInitialized: boolean; // Add this
}

const initialRegistrationFormState: Omit<RegisterRiderData, 'password'> = {
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  vehicleType: 'bike',
  residentialAddress: '',
  vehicleDetails: { plateNumber: '', color: '', model: '' },
};

const initialState: AuthState = {
  registrationForm: initialRegistrationFormState,
  isRegistered: false,
  user: null,
  token: null,
  isAuthenticated: false,
  isProfileSetupComplete: false,
  loading: 'idle',
  fcmToken: null, // Add this
  error: null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateRegistrationForm: (
      state,
      action: PayloadAction<Partial<Omit<RegisterRiderData, 'password'>>>,
    ) => {
      if (action.payload.vehicleDetails) {
        state.registrationForm.vehicleDetails = {
          ...state.registrationForm.vehicleDetails,
          ...action.payload.vehicleDetails,
        };
        const { vehicleDetails, ...restPayload } = action.payload;
        state.registrationForm = { ...state.registrationForm, ...restPayload };
      } else {
        state.registrationForm = {
          ...state.registrationForm,
          ...action.payload,
        };
      }
    },
    // // Used for loading persisted auth state or setting credentials from RTK query profile fetch
    // setAuthStateFromPersisted: (
    //   state,
    //   action: PayloadAction<{ token: string; user: RiderLoginResponse }>,
    // ) => {
    //   state.token = action.payload.token;
    //   state.user = action.payload.user;
    //   state.isAuthenticated = true;
    //   state.isProfileSetupComplete =
    //     action.payload.user.verificationStatus === 'verified' ||
    //     action.payload.user.verificationStatus === 'approved';
    //   state.loading = 'idle';
    //   state.error = null;
    // },
    setFcmToken(state, action) {
      // New reducer
      state.fcmToken = action.payload;
    },
    resetAuthState: state => {
      state.loading = 'idle';
      state.error = null;
      state.isAuthenticated = false;
      state.user = null;
    },
    clearAuthError: state => {
      state.error = null;
    },
    resetRegistrationStatus: state => {
      state.isRegistered = false;
      state.registrationForm = initialRegistrationFormState; // Optionally clear form
    },
    // If RTK Query (e.g., getProfile) updates the user, this can sync it to authSlice
    updateUserFromApi: (state, action: PayloadAction<RiderProfile>) => {
      if (state.user && state.isAuthenticated) {
        // Only if user is already logged in
        state.user = action.payload;
        state.isProfileSetupComplete =
          action.payload.verificationStatus === 'verified' ||
          action.payload.verificationStatus === 'approved';
      }
    },
  },
  extraReducers: builder => {
    builder
      // initialize user from storage
      .addCase(initializeAuthFromStorage.pending, state => {
        state.loading = 'pending';
      })
      .addCase(initializeAuthFromStorage.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = !!(action.payload.user && action.payload.token);
        state.isProfileSetupComplete =
          action.payload.user?.verificationStatus === 'verified' ||
          action.payload.user?.verificationStatus === 'approved';
        state.isInitialized = true;
        state.loading = 'idle';
      })
      .addCase(initializeAuthFromStorage.rejected, state => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Registration
      .addCase(registerUser.pending, state => {
        state.loading = 'pending';
        state.error = null;
        state.isRegistered = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = 'idle';
        if (action.payload.success) {
          state.isRegistered = true;
          state.error = null;
          // Optionally clear registration form on success
          // state.registrationForm = initialRegistrationFormState;
        } else {
          // Handle API returning success: false in payload
          state.isRegistered = false;
          state.error = {
            message: action.payload.message || 'Registration reported failure.',
          };
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = 'idle';
        state.error = action.payload || {
          message: 'Registration failed due to an unknown error.',
        };
        state.isRegistered = false;
      })

      // Login
      .addCase(loginUser.pending, state => {
        state.loading = 'pending';
        state.error = null;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = 'idle';
        // && action.payload.data.token && action.payload.data.rider
        if (action.payload.success && action.payload.data) {
          state.user = action.payload.data.rider;
          state.token = action.payload.data.token;
          state.isAuthenticated = true;
          state.error = null;
          state.isRegistered = false; // Reset registration flag
          state.registrationForm = initialRegistrationFormState; // Clear form

          // Determine if profile setup is complete based on rider info
          const rider = action.payload.data.rider;
          state.isProfileSetupComplete =
            rider.verificationStatus === 'verified' ||
            rider.verificationStatus === 'approved';
        } else {
          // Handle cases where API indicates success: false or data is missing
          state.error = {
            message:
              action.payload.message ||
              'Login successful but data is not in expected format.',
          };
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          state.isProfileSetupComplete = false;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        // console.log(action);
        state.loading = 'idle';
        state.error = action.payload || {
          data: 'Login failed. Please check your credentials.',
        };
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.isProfileSetupComplete = false;
      })
      // Logout user
      .addCase(logoutUser.fulfilled, state => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isProfileSetupComplete = false;
        state.loading = 'idle';
        state.error = null;
        state.isRegistered = false; // Reset registration flag
        state.registrationForm = initialRegistrationFormState; // Clear form
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = { data: action?.error?.message || '' };
      });
    // // Update fcmtoken
    // .addCase(updateFcmToken.pending, state => {
    //   state.loading = 'pending';
    //   state.error = null;
    // })
    // .addCase(updateFcmToken.fulfilled, (state, action) => {
    //   state.loading = 'idle';
    //   state.error = null;
    // })
    // .addCase(updateFcmToken.rejected, (state, action) => {
    //   state.loading = 'idle';
    //   state.error = {
    //     data:
    //       String(action?.payload?.error) ||
    //       'Login failed. Please check your credentials.',
    //   };
    // });
  },
});

export const {
  updateRegistrationForm,
  resetAuthState,
  clearAuthError,
  resetRegistrationStatus,
  updateUserFromApi,
  setFcmToken,
} = authSlice.actions;

export default authSlice.reducer;
