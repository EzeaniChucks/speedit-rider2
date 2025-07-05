// features/orders/ordersSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {StandardOrderResponse} from '../types/order.types';

interface OrdersState {
  availableOrders: Partial<StandardOrderResponse>[];
  selectedOrder: StandardOrderResponse | null;
  notificationCount: number;
}

const initialState: OrdersState = {
  availableOrders: [],
  selectedOrder: null,
  notificationCount: 0,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setAvailableOrders: (
      state,
      action: PayloadAction<StandardOrderResponse[]>,
    ) => {
      state.availableOrders = action.payload;
      state.notificationCount = action.payload.length;
    },
    setSelectedOrder: (
      state,
      action: PayloadAction<StandardOrderResponse | null>,
    ) => {
      state.selectedOrder = action.payload;
    },
    clearOrders: () => initialState,
  },
});

export const {setAvailableOrders, setSelectedOrder, clearOrders} =
  ordersSlice.actions;
export default ordersSlice.reducer;
