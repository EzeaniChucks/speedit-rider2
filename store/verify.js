import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import axiosInstance from './instance'; // Import the configured Axios instance
import { store } from '.';
import apiInstance from './imageInstance';

// Helper function to create a file object structure for FormData
const createFormDataFile = (uri, fileName, type) => {
  if (!uri) return null;
  return {
    uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
    name: fileName || `photo_${Date.now()}.${uri.split('.').pop() || 'jpg'}`,
    type: type || 'image/jpeg',
  };
};

// AsyncThunk for uploading documents using Axios
export const uploadDocumentsThunk = createAsyncThunk(
  'verification/uploadDocuments',
  async (_, {  rejectWithValue }) => {
    const state = store.getState();
    const { verification } = state;
    // Token will be added by the Axios interceptor
 
    if (!verification.idPhotoUri || !verification.licensePhotoUri || !verification.vehiclePhotoUri) {
      return rejectWithValue({ message: 'All three document images are required.' });
    }

    const formdata = new FormData();
    formdata.append(
      "idPhoto",
      createFormDataFile(verification.idPhotoUri, verification.idPhotoFileName, verification.idPhotoType),
      verification.idPhotoFileName
    );
    formdata.append(
      "licensePhoto",
      createFormDataFile(verification.licensePhotoUri, verification.licensePhotoFileName, verification.licensePhotoType),
      verification.licensePhotoFileName
    );
    formdata.append(
      "vehiclePhoto",
      createFormDataFile(verification.vehiclePhotoUri, verification.vehiclePhotoFileName, verification.vehiclePhotoType),
      verification.vehiclePhotoFileName
    );

    try {
      console.log("Uploading documents via Axios...");
      // The 'Authorization' header and 'Content-Type: multipart/form-data'
      // should be handled by the Axios instance and FormData respectively.
      const response = await apiInstance.post('riders/verification/upload/', formdata);
      console.log("Upload successful via Axios:", response.data);
      return response.data; // Axios automatically parses JSON
    } catch (error) {
      console.error('Axios Upload Thunk Error:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return rejectWithValue(error.response.data || { message: `Upload failed: ${error.response.status}` });
      } else if (error.request) {
        // The request was made but no response was received
        return rejectWithValue({ message: 'Network error: No response received from server.' });
      } else {
        // Something happened in setting up the request that triggered an Error
        return rejectWithValue({ message: error.message || 'An unknown error occurred during upload.' });
      }
    }
  }
);

// AsyncThunk for fetching verification status using Axios
export const fetchVerificationStatusThunk = createAsyncThunk(
  'verification/fetchStatus',
  async (_, {  rejectWithValue }) => {
    // Token will be added by the Axios interceptor
    try {
      const response = await axiosInstance.get('riders/verification/status/');
      return response.data; // Axios automatically parses JSON
    } catch (error) {
      console.error('Axios Fetch Status Thunk Error:', error);
      if (error.response) {
        return rejectWithValue(error.response.data || { message: `Status check failed: ${error.response.status}` });
      } else if (error.request) {
        return rejectWithValue({ message: 'Network error: No response received.' });
      } else {
        return rejectWithValue({ message: error.message || 'An unknown error occurred while fetching status.' });
      }
    }
  }
);

const initialState = {
  idPhotoUri: null,
  idPhotoFileName: null,
  idPhotoType: null,

  licensePhotoUri: null,
  licensePhotoFileName: null,
  licensePhotoType: null,

  vehiclePhotoUri: null,
  vehiclePhotoFileName: null,
  vehiclePhotoType: null,

  // IMPORTANT: Replace with your actual token or manage via auth slice
  authToken: "YOUR_REALLY_REAL_AUTH_TOKEN_NOW", // Store this securely or via auth flow

  uploadStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  uploadError: null,
  uploadResponse: null,

  verificationStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  verificationData: null,
  verificationError: null,
};

const verificationSlice = createSlice({
  name: 'verification',
  initialState,
  reducers: {
    setIdPhoto: (state, action) => {
      const { uri, fileName, type } = action.payload;
      state.idPhotoUri = uri;
      state.idPhotoFileName = fileName;
      state.idPhotoType = type;
    },
    setLicensePhoto: (state, action) => {
      const { uri, fileName, type } = action.payload;
      state.licensePhotoUri = uri;
      state.licensePhotoFileName = fileName;
      state.licensePhotoType = type;
    },
    setVehiclePhoto: (state, action) => {
      const { uri, fileName, type } = action.payload;
      state.vehiclePhotoUri = uri;
      state.vehiclePhotoFileName = fileName;
      state.vehiclePhotoType = type;
    },
    setAuthToken: (state, action) => {
      state.authToken = action.payload;
    },
    resetUploadState: (state) => {
      state.uploadStatus = 'idle';
      state.uploadError = null;
      state.uploadResponse = null;
    },
    resetVerificationState: (state) => {
        state.verificationStatus = 'idle';
        state.verificationData = null;
        state.verificationError = null;
    },
    clearAllPhotos: (state) => {
      state.idPhotoUri = null; state.idPhotoFileName = null; state.idPhotoType = null;
      state.licensePhotoUri = null; state.licensePhotoFileName = null; state.licensePhotoType = null;
      state.vehiclePhotoUri = null; state.vehiclePhotoFileName = null; state.vehiclePhotoType = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Upload Documents
      .addCase(uploadDocumentsThunk.pending, (state) => {
        state.uploadStatus = 'loading';
        state.uploadError = null;
      })
      .addCase(uploadDocumentsThunk.fulfilled, (state, action) => {
        state.uploadStatus = 'succeeded';
        state.uploadResponse = action.payload;
      })
      .addCase(uploadDocumentsThunk.rejected, (state, action) => {
        state.uploadStatus = 'failed';
        state.uploadError = action.payload; // This will be the object from rejectWithValue
      })
      // Fetch Verification Status
      .addCase(fetchVerificationStatusThunk.pending, (state) => {
        state.verificationStatus = 'loading';
        state.verificationError = null;
      })
      .addCase(fetchVerificationStatusThunk.fulfilled, (state, action) => {
        state.verificationStatus = 'succeeded';
        state.verificationData = action.payload;
      })
      .addCase(fetchVerificationStatusThunk.rejected, (state, action) => {
        state.verificationStatus = 'failed';
        state.verificationError = action.payload; // This will be the object from rejectWithValue
      });
  },
});

export const {
  setIdPhoto,
  setLicensePhoto,
  setVehiclePhoto,
  setAuthToken,
  resetUploadState,
  resetVerificationState,
  clearAllPhotos,
} = verificationSlice.actions;

export default verificationSlice.reducer;