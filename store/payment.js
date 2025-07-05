import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from './instance';

// Async Thunks
export const fetchBanks = createAsyncThunk(
  'payment/fetchBanks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/payments/banks/list');
      return response.data; // Assuming API returns an array of banks [{ name: 'Bank A', code: '001' }, ...]
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const verifyBankAccount = createAsyncThunk(
  'payment/verifyBankAccount',
  async (bankDetails, { rejectWithValue }) => {
    // bankDetails: { entityType: 'rider', accountNumber: '...', bankCode: '...' }
    try {
      const response = await axiosInstance.post('/payments/banks/verify', bankDetails);
      return response.data; // Assuming API returns { success: true, accountName: '...' } or similar
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const requestWithdrawal = createAsyncThunk(
  'payment/requestWithdrawal',
  async (withdrawalData, { getState, rejectWithValue }) => {
    // withdrawalData: { amount: 3000, accountNumber: '...', bankCode: '...' }
    const riderId = getState().auth.riderId;
    if (!riderId) {
        return rejectWithValue('Rider ID not found. Please login again.');
    }
    const payload = {
      ...withdrawalData,
      entityId: riderId,
      entityType: 'rider',
    };
    try {
      const response = await axiosInstance.post('/payments/request_withdrawal', payload);
      return response.data; // Assuming API returns { success: true, message: '...' }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  banks: [],
  banksStatus: 'idle',
  banksError: null,
  verificationResult: null,
  verificationStatus: 'idle',
  verificationError: null,
  withdrawalStatus: 'idle',
  withdrawalError: null,
  withdrawalSuccessMessage: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    resetPaymentState: () => initialState,
    clearVerificationResult: (state) => {
        state.verificationResult = null;
        state.verificationStatus = 'idle';
        state.verificationError = null;
    },
    clearWithdrawalStatus: (state) => {
        state.withdrawalStatus = 'idle';
        state.withdrawalError = null;
        state.withdrawalSuccessMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Banks
      .addCase(fetchBanks.pending, (state) => {
        state.banksStatus = 'loading';
      })
      .addCase(fetchBanks.fulfilled, (state, action) => {
        state.banksStatus = 'succeeded';
        state.banks = action.payload.banks || action.payload; // Adjust based on API response
      })
      .addCase(fetchBanks.rejected, (state, action) => {
        state.banksStatus = 'failed';
        state.banksError = action.payload;
      })
      // Verify Bank Account
      .addCase(verifyBankAccount.pending, (state) => {
        state.verificationStatus = 'loading';
        state.verificationError = null;
      })
      .addCase(verifyBankAccount.fulfilled, (state, action) => {
        state.verificationStatus = 'succeeded';
        state.verificationResult = action.payload;
      })
      .addCase(verifyBankAccount.rejected, (state, action) => {
        state.verificationStatus = 'failed';
        state.verificationError = action.payload;
        state.verificationResult = null;
      })
      // Request Withdrawal
      .addCase(requestWithdrawal.pending, (state) => {
        state.withdrawalStatus = 'loading';
        state.withdrawalError = null;
        state.withdrawalSuccessMessage = null;
      })
      .addCase(requestWithdrawal.fulfilled, (state, action) => {
        state.withdrawalStatus = 'succeeded';
        state.withdrawalSuccessMessage = action.payload.message || 'Withdrawal successful!';
      })
      .addCase(requestWithdrawal.rejected, (state, action) => {
        state.withdrawalStatus = 'failed';
        state.withdrawalError = action.payload;
      });
  },
});

export const { resetPaymentState, clearVerificationResult, clearWithdrawalStatus } = paymentSlice.actions;
export default paymentSlice.reducer;