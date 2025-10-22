export interface Payment {
  _id: string;
  bookingId: string;
  customerId?: string;
  paymentMethod: 'stripe' | 'cash' | 'bank_transfer' | 'other';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  transactionId?: string;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    transactionCode: string;
  };
  cashInfo?: {
    receivedBy: string;
    receivedAt: string;
    notes: string;
  };
  refundInfo?: {
    refundAmount: number;
    refundReason: string;
    refundedAt: string;
    refundedBy: string;
  };
  metadata?: Record<string, any>;
  notes?: string;
  paidAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  bookingId: string;
  customerId?: string;
  paymentMethod: 'stripe' | 'cash' | 'bank_transfer' | 'other';
  amount: number;
  currency?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  transactionId?: string;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    transactionCode: string;
  };
  cashInfo?: {
    receivedBy: string;
    receivedAt: string;
    notes: string;
  };
  metadata?: Record<string, any>;
  notes?: string;
  expiresAt?: string;
}

export interface UpdatePaymentRequest {
  paymentMethod?: 'stripe' | 'cash' | 'bank_transfer' | 'other';
  amount?: number;
  currency?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  transactionId?: string;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    transactionCode: string;
  };
  cashInfo?: {
    receivedBy: string;
    receivedAt: string;
    notes: string;
  };
  metadata?: Record<string, any>;
  notes?: string;
  expiresAt?: string;
}

export interface UpdatePaymentStatusRequest {
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  refundInfo?: {
    refundAmount: number;
    refundReason: string;
    refundedAt: string;
    refundedBy: string;
  };
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: string;
  paymentMethod?: string;
  customerId?: string;
  bookingId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaymentStats {
  byStatus: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  totals: {
    totalPayments: number;
    totalAmount: number;
    averageAmount: number;
  };
}

// Lấy tất cả payments
export const getAllPayments = async (filters: PaymentFilters = {}): Promise<{
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`/api/payments?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch payments');
  }

  return response.json();
};

// Lấy payment theo ID
export const getPaymentById = async (id: string): Promise<Payment> => {
  const response = await fetch(`/api/payments/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch payment');
  }

  const data = await response.json();
  return data.data;
};

// Tạo payment mới
export const createPayment = async (paymentData: CreatePaymentRequest): Promise<Payment> => {
  const response = await fetch('/api/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create payment');
  }

  const data = await response.json();
  return data.data;
};

// Cập nhật payment
export const updatePayment = async (id: string, paymentData: UpdatePaymentRequest): Promise<Payment> => {
  const response = await fetch(`/api/payments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update payment');
  }

  const data = await response.json();
  return data.data;
};

// Cập nhật trạng thái payment
export const updatePaymentStatus = async (id: string, statusData: UpdatePaymentStatusRequest): Promise<Payment> => {
  const response = await fetch(`/api/payments/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(statusData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update payment status');
  }

  const data = await response.json();
  return data.data;
};

// Xóa payment
export const deletePayment = async (id: string): Promise<void> => {
  const response = await fetch(`/api/payments/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete payment');
  }
};

// Lấy payments theo booking
export const getPaymentsByBooking = async (bookingId: string): Promise<Payment[]> => {
  const response = await fetch(`/api/payments/booking/${bookingId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch payments by booking');
  }

  const data = await response.json();
  return data.data;
};

// Lấy payments theo customer
export const getPaymentsByCustomer = async (customerId: string, filters: PaymentFilters = {}): Promise<{
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`/api/payments/customer/${customerId}?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch payments by customer');
  }

  return response.json();
};

// Lấy thống kê payments
export const getPaymentStats = async (filters: PaymentFilters = {}): Promise<PaymentStats> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`/api/payments/stats?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch payment statistics');
  }

  const data = await response.json();
  return data.data;
};
