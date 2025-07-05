import {configureStore} from '@reduxjs/toolkit';
import {setupListeners} from '@reduxjs/toolkit/query';
import {ordersApi} from './ordersApi';
import {riderApi} from './api';
import authReducer from './authSlice';
import ordersReducer from './ordersSlice';
import userAuthReducer from './profileSlice';
import walletReducer from './wallet';
import verificationReducer from './verify';
import availabilityReducer from './avail'; // The new slice
import {profileApi} from './profileApi';
import {walletApi} from './walletApi';
import {authApi} from './authApi';
export const store = configureStore({
  reducer: {
    [riderApi.reducerPath]: riderApi.reducer,
    auth: authReducer,
    verification: verificationReducer,
    availability: availabilityReducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    orders: ordersReducer,
    [profileApi.reducerPath]: profileApi.reducer,
    profile: userAuthReducer,
    [walletApi.reducerPath]: walletApi.reducer,
    wallet: walletReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat([
      profileApi.middleware,
      riderApi.middleware,
      authApi.middleware,
      ordersApi.middleware,
      walletApi.middleware,
      // ...any other middlewares
    ]),
});

// Optional, but required for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
