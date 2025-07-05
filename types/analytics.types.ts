// Core interfaces
interface Wallet {
    availableBalance: number;
    pendingBalance: number;
    totalEarnings?: number;
  }
  
  interface Transaction {
    amount: string; // Typically formatted as "320.00"
    date: string; // ISO format
    reference: string;
    status: string; // Often mirrors amount
    purpose: string;
  }
  
  interface Order {
    // Define based on what you expect in last5Orders
    id?: string;
    earnings?: number;
    status?: string;
    // ... other order fields
  }
  
  // Performance metrics that appear in each time frame
  interface PerformanceMetrics {
    acceptanceRate: number;
    currentRating: string | number; // Could be "4.60" or 4.6
    completedOrders: number;
    rejectedOrders?: number;
    // ... other potential metrics
  }
  
  // The structure that repeats for each time frame
  interface TimeFrameMetrics {
    earnings: {
      today: number;
      week: number;
      month: number;
      total: number;
      // For custom time frames, we might need to extend this
      [key: string]: number; // Flexible for additional periods
    };
    orders: {
      completed: number;
      completedToday: number;
      averageDeliveryTime: number;
      averageEarningsPerOrder?: number;
      // ... other order stats
    };
    performance: PerformanceMetrics;
  }
  
  // Historical data structure
  interface HistoricalData {
    last5Transactions: Transaction[];
    last5Orders: Order[]; // Empty array in example, but typed properly
  }
  
  // Main response structure
  interface AnalyticsResponse {
    success: boolean;
    data: {
      wallet: Wallet;
      timeFrame: {
        // Known time frames (all optional since they might not all be present)
        today?: TimeFrameMetrics;
        week?: TimeFrameMetrics;
        month?: TimeFrameMetrics;
        year?: TimeFrameMetrics;
        // For custom or dynamic time frames
        [key: string]: TimeFrameMetrics | HistoricalData | undefined;
        
        // Historical is special - it's always present but has different structure
        historical: HistoricalData;
      };
      // ... other potential top-level data fields
    };
    // ... other potential response metadata
  }