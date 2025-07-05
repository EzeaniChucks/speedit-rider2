import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {setUserProfile, updateUserProfile} from './profileSlice';

// Base URL from your server
const BASE_URL = 'https://speedit-server.onrender.com/v1/api/riders/';

export const profileApi = createApi({
  reducerPath: 'profileApi',
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
  tagTypes: ['Profile'],
  endpoints: builder => ({
    // Get rider profile
    getRiderProfile: builder.query({
      query: () => 'profile/',
      providesTags: ['Profile'],
      transformResponse: response => response.data,
      onQueryStarted: async (arg, {dispatch, queryFulfilled}) => {
        try {
          const {data} = await queryFulfilled;
          //   console.log('data from rider profile fetch:', data);
          dispatch(setUserProfile(data));
        } catch (error) {
          console.error('Profile update failed:', error);
        }
      },
    }),

    // Update rider profile
    updateRiderProfile: builder.mutation({
      query: body => ({
        url: 'profile/',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
      transformResponse: response => response.data,
      onQueryStarted: async (arg, {dispatch, queryFulfilled}) => {
        try {
          const {data} = await queryFulfilled;
          dispatch(updateUserProfile(data));
        } catch (error) {
          console.error('Profile update failed:', error);
        }
      },
    }),

    // Initiate password reset
    initiatePasswordReset: builder.mutation({
      query: body => ({
        url: 'me/password/initiate-reset',
        method: 'POST',
        body,
      }),
    }),

    // Verify password reset code
    verifyPasswordReset: builder.mutation({
      query: body => ({
        url: 'me/password/verify-reset',
        method: 'POST',
        body,
      }),
    }),

    // resend password reset code
    resendVerificationCode: builder.mutation({
      query: ({verificationId}) => ({
        url: 'me/password/resend-code',
        method: 'POST',
        body: {verificationId},
      }),
    }),
  }),
});

export const {
  useGetRiderProfileQuery,
  useUpdateRiderProfileMutation,
  useInitiatePasswordResetMutation,
  useVerifyPasswordResetMutation,
  useResendVerificationCodeMutation,
} = profileApi;
