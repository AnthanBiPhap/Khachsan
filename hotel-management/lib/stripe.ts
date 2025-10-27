import { loadStripe } from '@stripe/stripe-js';

// Khởi tạo Stripe với publishable key
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SFQ8PDuSkPZFda2132JoomoaL6bcAHx5Dc91u2mKeHTFDnF1V5VuEd75lo98l1cv7tqRbXIf9umz5I3xuHaAD9u00vIbQpM5i';

export const stripePromise = loadStripe(stripePublishableKey);

// Định dạng giá tiền cho Stripe (chuyển từ VNĐ sang cent)
export const formatPriceForStripe = (amountInVND: number): number => {
  // Stripe sử dụng cent (1 USD = 100 cent), nhưng chúng ta dùng VNĐ
  // Để đơn giản, tạm thời giữ nguyên giá trị VNĐ (sẽ cần chuyển đổi tỷ giá thật)
  return Math.round(amountInVND);
};

// Tạo mô tả sản phẩm cho Stripe
export const createProductDescription = (roomName: string, nights: number, guests: number): string => {
  return `Dat phong ${roomName} - ${nights} dem cho ${guests} khach`;
};
