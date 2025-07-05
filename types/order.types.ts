// Base interfaces for shared properties
export interface LocationResponse {
    type: "Point";
    address: string;
    coordinates: [number, number];
  }
  
  export interface RestaurantBasicInfo {
    id: string;
    name: string;
    phone: string;
    prefersCash?: boolean;
    address?: string;
    logo?: string;
  }
  
  export interface CustomerBasicInfo {
    id: string;
    name:string;
    phone: string;
    pic:string;
    addresses?: any[]; // Replace with proper address type if available
  }
  
  export interface RiderBasicInfo {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    vehicleType: string;
    rating: number;
    profilePic?: string;
    avatar?: string;
    location?: any
  }
  
  export interface OrderItemResponse {
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
  }
  
  // Standard response (used for riders/admin)
  export interface StandardOrderResponse {
    id: string;
    status: string;
    acceptedAt: string | null;
    expiresAt: string;
    pickupLocation: LocationResponse & {
      restaurant: RestaurantBasicInfo;
    };
    deliveryLocation: LocationResponse & {
      customer: CustomerBasicInfo;
    };
    totalAmount: number;
    subTotal: number;
    deliveryFee: number;
    riderEarnings: number;
    serviceCharge: string;
    distance: string;
    items: OrderItemResponse[];
    specialInstructions: string;
    riderRatingImpact: number;
    estimatedPrepTime: number;
    riderEtaToRestaurant: number | null;
    riderEtaToCustomer: number | null;
    paymentMethod: string;
    paymentStatus: string;
    requiresVendorCashPayment: boolean;
    vendorCashPaid: boolean;
    vendorCashPaidAt: string | null;
    createdAt: string;
    updatedAt: string;
    actualPickupTime: string | null;
    deliveryTime: string | null;
    riderDetails?: RiderBasicInfo;
    cancellationReason?: string;
    cancellationTime?: string | null;
    preparationTime?: number;
    readyTime?: string | null;
  }