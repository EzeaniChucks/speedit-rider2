import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import type {RootState} from '../store'; // Adjust path if necessary

const BASE_URL = 'https://speedit-server.onrender.com/v1/api/'; // Your API base URL

// Define a service using a base URL and expected endpoints
export const riderApi = createApi({
  reducerPath: 'riderApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, {getState}) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Profile'], // For cache invalidation
  endpoints: builder => ({
    loginRider: builder.mutation<
      {token: string; user?: any /* Define user type */}, // Response type
      {email: string; password: string} // Argument type
    >({
      query: credentials => ({
        url: 'riders/login/',
        method: 'POST',
        body: credentials,
        // Note: Login usually doesn't need Content-Type explicitly if body is object
        // but your example used raw string, so fetchBaseQuery handles stringify
      }),
    }),
    // This is a HYPOTHETICAL endpoint. Adjust to your backend.
    requestPasswordResetOtp: builder.mutation<
      {message: string},
      {email: string}
    >({
      query: ({email}) => ({
        url: 'riders/password/request-otp', // Example: You need an endpoint for this
        method: 'POST',
        body: {email},
      }),
    }),
    verifyPasswordResetCode: builder.mutation<
      {message: string; success: boolean},
      {code: string}
    >({
      query: ({code}) => ({
        url: 'riders/me/password/verify-reset',
        method: 'POST',
        body: {code},
      }),
    }),
    // This maps to your "initiate-reset" endpoint that takes a newPassword
    confirmPasswordReset: builder.mutation<
      {message: string},
      {newPassword: string}
    >({
      query: ({newPassword}) => ({
        url: 'riders/me/password/initiate-reset',
        method: 'POST',
        body: {newPassword},
      }),
    }),
    getRiderProfile: builder.query<any /* Define profile type */, void>({
      query: () => 'riders/profile/',
      providesTags: ['Profile'],
    }),
    updateRiderProfile: builder.mutation<
      any, // Response type
      Partial<{firstName: string; vehicleDetails: {color: string}}> // Argument type
    >({
      query: profileData => ({
        url: 'riders/profile/',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Profile'], // Invalidate cache on update
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useLoginRiderMutation,
  useRequestPasswordResetOtpMutation,
  useVerifyPasswordResetCodeMutation,
  useConfirmPasswordResetMutation,
  useGetRiderProfileQuery,
  useUpdateRiderProfileMutation,
} = riderApi;
