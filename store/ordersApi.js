import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {setAvailableOrders, setSelectedOrder} from './ordersSlice';

// Define your base URL
const BASE_URL = 'https://speedit-server.onrender.com/v1/api/riders/';

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
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
  tagTypes: [
    'AvailableOrders',
    'CurrentOrder',
    'OrderHistory',
    'Order',
    'Wallet',
    'WalletTransactions',
    'RiderLocation',
  ], // For cache invalidation
  endpoints: builder => ({
    getAvailableOrders: builder.query({
      query: ({radius, riderLocation}) =>
        `orders/available/?radius=${radius}&rider_location=[${riderLocation.join(
          ',',
        )}]`,
      providesTags: ['AvailableOrders'],
      // Optionally add this to automatically update the cache
      onQueryStarted: async (arg, {dispatch, queryFulfilled}) => {
        try {
          const {data} = await queryFulfilled;
          dispatch(setAvailableOrders(data?.data));
        } catch (error) {
          console.error('Failed to fetch orders:', error);
        }
      },
    }),

    getOrderDetails: builder.query({
      query: orderId => `orders/${orderId}`,
      providesTags: result =>
        result ? [{type: 'Order', id: result.id}] : ['Order'],
      onQueryStarted: async (arg, {dispatch, queryFulfilled}) => {
        try {
          const {data} = await queryFulfilled;
          // console.log('here is the order details from rtk api:', data);
          dispatch(setSelectedOrder(data?.data));
        } catch (error) {
          console.error('Failed to fetch order details:', error);
        }
      },
    }),

    acceptOrder: builder.mutation({
      query: orderId => ({
        url: `orders/${orderId}/accept/`,
        method: 'POST',
      }),
      invalidatesTags: ['AvailableOrders', 'CurrentOrder', 'Order'],
    }),

    rejectOrder: builder.mutation({
      query: ({orderId, reason}) => ({
        url: `orders/${orderId}/reject/`,
        method: 'PATCH',
        body: reason ? {reason} : {}, // Only send reason if provided
      }),
      invalidatesTags: ['AvailableOrders', 'CurrentOrder', 'Order'],
    }),
    getOrderHistory: builder.query({
      query: ({page = 1, limit = 10}) =>
        `orders/history/?page=${page}&limit=${limit}`,
      providesTags: ['OrderHistory'],
    }),
    getCurrentOrder: builder.query({
      query: () => 'orders/current/',
      providesTags: ['CurrentOrder', 'Order'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({orderId, status}) => ({
        url: `orders/${orderId}/status/`,
        method: 'PUT',
        body: {status},
      }),
      invalidatesTags: ['CurrentOrder', 'OrderHistory', 'Order'],
    }),
    confirmVendorPayment: builder.mutation({
      query: orderId => ({
        url: `orders/${orderId}/confirm-vendor-payment`,
        method: 'POST',
      }),
      // Potentially invalidate CurrentOrder or Order if it affects its state
      invalidatesTags: ['CurrentOrder', 'Order'],
    }),

    // getOrderDetails: builder.query({
    //   // Example: if you need details of a specific order
    //   query: orderId => `orders/${orderId}/`, // Assuming such an endpoint exists
    //   providesTags: (result, error, orderId) => [{type: 'Order', id: orderId}],
    // }),

    // === LOCATION TRACKING ===
    updateRiderLocation: builder.mutation({
      query: ({lat, lng}) => ({
        url: 'location/',
        method: 'PUT',
        body: {lat, lng},
      }),
      // No invalidation needed as this is a "fire-and-forget" update
    }),
    getRiderLocation: builder.query({
      query: () => 'location/',
      providesTags: ['RiderLocation'],
    }),
    // === WALLET & PAYMENTS ===
    getWalletBalance: builder.query({
      query: () => 'wallet/',
      providesTags: ['Wallet'],
    }),
    getWalletTransactions: builder.query({
      query: ({page = 1, limit = 10}) =>
        `wallet/transactions?page=${page}&limit=${limit}`,
      providesTags: ['WalletTransactions'],
    }),
    fundWallet: builder.mutation({
      query: ({amount}) => ({
        url: 'wallet/fund/',
        method: 'POST',
        body: {amount},
      }),
      invalidatesTags: ['Wallet'], // May not invalidate immediately, depends on payment gateway callback
    }),
    // The "verify" endpoint is public and uses a `trxref`.
    // It's better called from a server-side webhook, but if called from the client:
    verifyFunding: builder.query({
      query: trxref => `payments/funding/verify?trxref=${trxref}`,
      // This query should trigger a refetch of the wallet balance upon completion.
      async onQueryStarted(arg, {dispatch, queryFulfilled}) {
        try {
          await queryFulfilled;
          dispatch(api.util.invalidateTags(['Wallet', 'WalletTransactions']));
        } catch (err) {
          // handle error
        }
      },
    }),
    getBankList: builder.query({
      query: () => 'payments/banks/list',
      // This is public, no auth needed.
    }),
    verifyBankAccount: builder.mutation({
      query: ({accountNumber, bankCode}) => ({
        url: 'payments/banks/verify',
        method: 'POST',
        body: {accountNumber, bankCode, entityType: 'rider'},
      }),
    }),
    requestWithdrawal: builder.mutation({
      query: withdrawalDetails => ({
        // { amount, accountNumber, bankCode }
        url: 'payments/request_withdrawal',
        method: 'POST',
        body: {...withdrawalDetails, entityType: 'rider'},
      }),
      invalidatesTags: ['Wallet', 'WalletTransactions'],
    }),
  }),
});

export const {
  useGetAvailableOrdersQuery,
  // useGetOrderDetailsQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useGetOrderHistoryQuery,
  useGetCurrentOrderQuery,
  useUpdateOrderStatusMutation,
  useConfirmVendorPaymentMutation,
  useGetOrderDetailsQuery,
  // Location
  useUpdateRiderLocationMutation,
  useGetRiderLocationQuery,
  // Wallet & Payments
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
  useFundWalletMutation,
  useLazyVerifyFundingQuery, // Use lazy query for manual triggering
  useGetBankListQuery,
  useVerifyBankAccountMutation,
  useRequestWithdrawalMutation,
} = ordersApi;
