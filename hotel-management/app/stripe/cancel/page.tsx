'use client';

import { useRouter } from 'next/navigation';
import { CloseCircleOutlined } from '@ant-design/icons';
import { Button } from '@/components/ui/button';

export default function StripeCancelPage() {
  const router = useRouter();

  const handleGoBack = () => {
    // Xóa dữ liệu tạm thời nếu có
    localStorage.removeItem('stripe_booking_data');
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
        <CloseCircleOutlined style={{ fontSize: '64px', color: '#ff4d4f' }} />
        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          Thanh toán bị hủy
        </h1>
        <p className="text-gray-600 mt-2">
          Bạn đã hủy quá trình thanh toán. Đặt phòng của bạn chưa được xác nhận.
        </p>
        <div className="mt-6">
          <Button
            onClick={handleGoBack}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Quay lại trang đặt phòng
          </Button>
        </div>
      </div>
    </div>
  );
}
