import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const API_URL = "http://localhost:8080/api/v1";

export interface Coupon {
  _id: string;
  code: string;
  name: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  status: "active" | "inactive" | "expired";
  applicableTo: "all" | "room" | "service";
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponListResponse {
  coupons: Coupon[];
  pagination: {
    totalRecord: number;
    limit: number;
    page: number;
  };
}

// Lấy access token từ store
const getAuthHeaders = () => {
  const accessToken = useAuthStore.getState().tokens?.accessToken;
  return {
    Authorization: accessToken ? `Bearer ${accessToken}` : "",
  };
};

export const fetchCoupons = async (
  page: number = 1,
  limit: number = 10,
  filters?: {
    code?: string;
    status?: string;
    applicableTo?: string;
  }
): Promise<CouponListResponse> => {
  const params: any = { page, limit };
  if (filters?.code) params.code = filters.code;
  if (filters?.status) params.status = filters.status;
  if (filters?.applicableTo) params.applicableTo = filters.applicableTo;

  const response = await axios.get(`${API_URL}/coupons`, {
    params,
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const getCouponById = async (id: string): Promise<Coupon> => {
  const response = await axios.get(`${API_URL}/coupons/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const createCoupon = async (payload: Partial<Coupon>): Promise<Coupon> => {
  const response = await axios.post(`${API_URL}/coupons`, payload, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const updateCoupon = async (
  id: string,
  payload: Partial<Coupon>
): Promise<Coupon> => {
  const response = await axios.put(`${API_URL}/coupons/${id}`, payload, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const deleteCoupon = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/coupons/${id}`, {
    headers: getAuthHeaders(),
  });
};

export const validateCoupon = async (
  code: string,
  orderAmount: number,
  applicableTo: "all" | "room" | "service" = "all"
): Promise<{
  coupon: Coupon;
  discountAmount: number;
  finalAmount: number;
}> => {
  const response = await axios.post(
    `${API_URL}/coupons/validate/${code}`,
    { orderAmount, applicableTo }
  );
  return response.data.data;
};

