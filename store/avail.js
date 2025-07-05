import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axiosInstance from './instance'; // Adjust path if needed

// Thunk to fetch current availability status
export const fetchAvailabilityStatus = createAsyncThunk(
  'availability/fetchStatus',
  async (_, {rejectWithValue}) => {
    try {
      const response = await axiosInstance.get('/riders/availability/');
      // Assuming the API returns { status: boolean } or similar
      // console.log('Fetched availability status:', response.data);
      return response.data; // e.g., { status: true }
    } catch (error) {
      return rejectWithValue(
        error.response?.data.error ||
          error.response?.data?.data ||
          'Failed to update availability status',
      );
    }
  },
);

// Thunk to update availability status
export const updateAvailabilityStatus = createAsyncThunk(
  'availability/updateStatus',
  async (newStatus, {rejectWithValue}) => {
    // newStatus is a boolean
    try {
      const payload = {status: newStatus};
      const response = await axiosInstance.post(
        '/riders/availability/',
        payload,
      );
      return response.data; // e.g., { message: "Status updated", status: true }
    } catch (error) {
      // console.log('availability error:', error.response.data.error);
      return rejectWithValue(
        error.response?.data.error ||
          error.response?.data?.data ||
          'Failed to update availability status',
      );
    }
  },
);

const initialState = {
  isAvailable: false, // Default to false or null until fetched
  getStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  getError: null,
  updateStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  updateError: null,
};

const availabilitySlice = createSlice({
  name: 'availability',
  initialState,
  reducers: {
    resetAvailabilityState: state => {
      state.getStatus = 'idle';
      state.getError = null;
      state.updateStatus = 'idle';
      state.updateError = null;
      // Optionally reset isAvailable to a default if needed
      // state.isAvailable = false;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch Status
      .addCase(fetchAvailabilityStatus.pending, state => {
        state.getStatus = 'loading';
        state.getError = null;
      })
      .addCase(fetchAvailabilityStatus.fulfilled, (state, action) => {
        state.getStatus = 'succeeded';
        // IMPORTANT: Adjust based on your actual API response structure for GET
        state.isAvailable = action.payload.data.isAvailable; // Assuming response is { status: boolean }
      })
      .addCase(fetchAvailabilityStatus.rejected, (state, action) => {
        state.getStatus = 'failed';
        state.getError = action.payload;
      })
      // Update Status
      .addCase(updateAvailabilityStatus.pending, state => {
        state.updateStatus = 'loading';
        state.updateError = null;
      })
      .addCase(updateAvailabilityStatus.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        // IMPORTANT: Adjust based on your actual API response structure for POST
        state.isAvailable = action.payload.data?.isAvailable; // Assuming response confirms new status
        // You might also want to show a success message from action.payload.message
      })
      .addCase(updateAvailabilityStatus.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.updateError = action.payload;
        // Optionally revert optimistic update if you did one
      });
  },
});

export const {resetAvailabilityState} = availabilitySlice.actions;
export default availabilitySlice.reducer;
