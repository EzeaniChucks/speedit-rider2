import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {setUserProfile, updateUserProfile} from './profileSlice';

// Base URL from your server
const BASE_URL = 'https://speedit-server.onrender.com/v1/api/';
// const BASE_URL = 'http://172.20.10.4:8080/v1/api/'; //ios

export const walletApi = createApi({
  reducerPath: 'walletApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, {getState}) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Wallet'],
  endpoints: builder => ({
    initializeWalletFunding: builder.mutation({
      query: body => ({
        url: 'riders/wallet/fund',
        method: 'POST',
        body,
      }),
    }),
    verifyWalletFunding: builder.mutation({
      query: ({trxref}) => ({
        url: `payments/funding/verify?trxref=${trxref}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useInitializeWalletFundingMutation,
  useVerifyWalletFundingMutation,
} = walletApi;
