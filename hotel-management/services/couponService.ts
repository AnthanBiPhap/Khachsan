// Lấy API URL từ env, nếu không có thì dùng default
const getApiUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  // Đảm bảo không có trailing slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  return `${cleanBaseUrl}/api/v1`;
};

const API_URL = getApiUrl();
console.log('🔗 Coupon Service API URL:', API_URL);

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
}

export interface ValidateCouponResponse {
  coupon: Coupon;
  discountAmount: number;
  roomDiscount?: number;
  serviceDiscount?: number;
  finalAmount: number;
}

/**
 * Validate coupon code
 */
export const validateCoupon = async (
  code: string,
  orderAmount: number,
  applicableTo: "all" | "room" | "service" = "all",
  roomAmount?: number,
  serviceAmount?: number,
  pricePerNight?: number,
  checkInDate?: string | Date
): Promise<ValidateCouponResponse> => {
  try {
    const url = `${API_URL}/coupons/validate/${code.toUpperCase()}`;
    console.log('🔗 Validating coupon - URL:', url);
    console.log('🔗 Validating coupon - Body:', { orderAmount, applicableTo, roomAmount, serviceAmount, pricePerNight, checkInDate });
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderAmount,
        applicableTo,
        roomAmount,
        serviceAmount,
        pricePerNight,
        checkInDate: checkInDate ? (typeof checkInDate === 'string' ? checkInDate : checkInDate.toISOString()) : undefined,
      }),
    });

    console.log('📡 Validate coupon response status:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Validate coupon error:', error);
      throw new Error(error.message || "Không thể validate coupon");
    }

    const data = await response.json();
    console.log('✅ Validate coupon success:', data);
    return data.data;
  } catch (error: any) {
    console.error('❌ Validate coupon exception:', error);
    throw new Error(error.message || "Lỗi khi validate coupon");
  }
};

/**
 * Get coupon by code (for display purposes)
 */
export const getCouponByCode = async (code: string): Promise<Coupon> => {
  try {
    const response = await fetch(`${API_URL}/coupons/code/${code.toUpperCase()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Không tìm thấy coupon");
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    throw new Error(error.message || "Lỗi khi lấy thông tin coupon");
  }
};

