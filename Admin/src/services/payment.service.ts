import { env } from '../constanst/getEnvs';

const API_BASE_URL = env.API_URL;

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
  booking?: {
    _id: string;
    roomId: {
      roomNumber: string;
      typeId: {
        name: string;
      };
    };
    checkIn: string;
    checkOut: string;
    guests: number;
    totalPrice: number;
  };
  customer?: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
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

  const response = await fetch(`${API_BASE_URL}/api/v1/payments?${queryParams.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch payments');
  }

  const data = await response.json();
  console.log('API response:', data);
  return data.data;
};

// Lấy payment theo ID
export const getPaymentById = async (id: string): Promise<Payment> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/payments/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch payment');
  }

  const data = await response.json();
  return data.data;
};

// Tạo payment mới
export const createPayment = async (paymentData: CreatePaymentRequest): Promise<Payment> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
  const response = await fetch(`${API_BASE_URL}/api/v1/payments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
  const response = await fetch(`${API_BASE_URL}/api/v1/payments/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
  const response = await fetch(`${API_BASE_URL}/api/v1/payments/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete payment');
  }
};

// Lấy payments theo booking
export const getPaymentsByBooking = async (bookingId: string): Promise<Payment[]> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/payments/booking/${bookingId}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
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

  const response = await fetch(`${API_BASE_URL}/api/v1/payments/customer/${customerId}?${queryParams.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch payments by customer');
  }

  const data = await response.json();
  return data.data;
};

// Lấy thống kê payments
export const getPaymentStats = async (filters: PaymentFilters = {}): Promise<PaymentStats> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/v1/payments/stats?${queryParams.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch payment statistics');
  }

  const data = await response.json();
  return data.data;
};

// Export service object
export const paymentService = {
  getAll: getAllPayments,
  getById: getPaymentById,
  create: createPayment,
  update: updatePayment,
  updateStatus: updatePaymentStatus,
  delete: deletePayment,
  getByBooking: getPaymentsByBooking,
  getByCustomer: getPaymentsByCustomer,
  getStats: getPaymentStats,
};
