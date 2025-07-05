export interface TransactionMetadataCustomField {
    value: string;
    display_name: string;
    variable_name: string;
  }
  
  export interface TransactionMetadata {
    id: string;
    purpose: string;
    entityId: string;
    referrer: string;
    entityType: string;
    custom_fields?: TransactionMetadataCustomField[];
  }
  
  export interface Transaction {
    id: string;
    entityId: string;
    entityType: string;
    orderId: string | null;
    amount: string; // Numeric value as string (e.g., "150.00")
    type: 'credit' | 'debit';
    reference: string;
    paymentMethod: string; // Could be enum if you know all possible values
    purpose: 'wallet_funding' | 'order_payment' | string; // Known purposes + allow others
    status: string // Add other possible statuses
    metadata: TransactionMetadata;
    createdAt: string; // ISO 8601 date string
    completedAt: string | null; // ISO 8601 date string or null
  }
  
  export interface TransactionsResponse {
    success: boolean;
    data: {
      transactions: Transaction[];
      meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
    error?: string;
  }