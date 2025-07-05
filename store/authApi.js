import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {setUserProfile, updateUserProfile} from './profileSlice';

// Base URL from your server
const BASE_URL = 'https://speedit-server.onrender.com/v1/api/';
// const BASE_URL = 'http://172.20.10.4:8080/v1/api/'; //ios

export const authApi = createApi({
  reducerPath: 'authApi',
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
  tagTypes: ['Authentication'],
  endpoints: builder => ({
    // New mutation: Initiate password reset
    initiatePasswordReset: builder.mutation({
      query: email => ({
        url: 'riders/forgot-password/initiate',
        method: 'POST',
        body: {email},
      }),
      // No tags needed as this is unauthenticated
      // transformResponse: response => response.data, // Adjust if response structure differs
    }),

    // New mutation: Complete password reset
    completePasswordReset: builder.mutation({
      query: ({verificationId, code, newPassword}) => ({
        url: 'riders/forgot-password/complete', // Adjust endpoint if different
        method: 'POST',
        body: {
          verificationId,
          code,
          newPassword,
        },
      }),
      // No tags needed for this unauthenticated operation
      // transformResponse: response => response.data,
    }),
  }),
});

export const {
  useInitiatePasswordResetMutation,
  useCompletePasswordResetMutation,
} = authApi;
