import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from './instance';

// Async Thunks
export const fetchWalletBalance = createAsyncThunk(
  'wallet/fetchBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/riders/wallet/');
      return response.data; // Assuming API returns { balance: 123.45 } or similar
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchWalletTransactions = createAsyncThunk(
  'wallet/fetchTransactions',
  async ({ limit = 10, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/riders/wallet/transactions?limit=${limit}&page=${page}`);
      return response.data; // Assuming API returns { transactions: [], totalPages: X, currentPage: Y }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  balance: null,
  transactions: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  transactionStatus: 'idle',
  transactionError: null,
  currentPage: 1,
  totalPages: 1,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    resetWalletState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wallet Balance
      .addCase(fetchWalletBalance.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Assuming the API returns the balance directly or in a 'balance' field
        // Adjust based on your actual API response structure
        state.balance = action.payload.balance !== undefined ? action.payload.balance : action.payload;
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch Wallet Transactions
      .addCase(fetchWalletTransactions.pending, (state) => {
        state.transactionStatus = 'loading';
      })
      .addCase(fetchWalletTransactions.fulfilled, (state, action) => {
        state.transactionStatus = 'succeeded';
        // Assuming action.payload is { transactions: [...], currentPage: X, totalPages: Y }
        if (action.payload.page === 1) {
            state.transactions = action.payload.transactions;
        } else {
            state.transactions = [...state.transactions, ...action.payload.transactions];
        }
        state.currentPage = action.payload.currentPage || action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.transactionError = null;
      })
      .addCase(fetchWalletTransactions.rejected, (state, action) => {
        state.transactionStatus = 'failed';
        state.transactionError = action.payload;
      });
  },
});

export const { resetWalletState } = walletSlice.actions;
export default walletSlice.reducer;