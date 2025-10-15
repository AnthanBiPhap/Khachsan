'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  Users,
  CreditCard,
  CheckCircle,
  Clock as ClockIcon,
  XCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

type Booking = {
  _id: string;
  guestInfo: {
    fullName: string;
    phoneNumber: string;
  };
  roomId: {
    _id: string;
    roomNumber: string;
    typeId: string;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'cancelled' | 'completed';
  services?: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Chờ AuthContext load xong (tránh reload mất user)
  useEffect(() => {
    if (user === undefined) return; // đợi auth load xong

    if (!user?._id) {
      setLoading(false);
      setError('Bạn cần đăng nhập để xem trang này');
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        // ✅ đổi userId -> customerId (backend chuẩn)
        const response = await fetch(
          `http://localhost:8080/api/v1/bookings?customerId=${user._id}`
        );

        if (!response.ok) {
          throw new Error('Không thể tải thông tin đặt phòng');
        }

        const data = await response.json();
        const allBookings = data.data.bookings || [];

        // ✅ Nếu backend chưa filter, lọc client-side
        const userBookings = allBookings.filter(
          (b: any) => b.customerId?._id === user._id
        );

        setBookings(userBookings);
      } catch (err) {
        console.error('Lỗi khi tải đặt phòng:', err);
        setError('Đã xảy ra lỗi khi tải thông tin đặt phòng');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" /> Đã thanh toán
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-4 h-4 mr-1" /> Chờ thanh toán
          </span>
        );
    }
  };

  // ✅ Thêm loading AuthContext riêng
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Đang xác thực tài khoản...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Đang tải thông tin đặt phòng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Đã xảy ra lỗi
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="bg-blue-50 p-4 rounded-full inline-block mb-4">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Chưa có đặt phòng nào
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn chưa có đặt phòng nào. Hãy bắt đầu đặt phòng ngay hôm nay!
          </p>
          <Link href="/" className="inline-block">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Đặt phòng ngay
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đặt phòng của tôi
          </h1>
          <p className="text-gray-600">Xem và quản lý các đặt phòng của bạn</p>
        </div>

        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <div className="mb-4 sm:mb-0">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Phòng {booking.roomId.roomNumber}
                    </h2>
                    <div className="mt-1">
                      {getStatusBadge(booking.paymentStatus)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Mã đặt phòng</p>
                    <p className="font-mono font-medium">
                      {booking._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <p>Tạo lúc: {formatDate(booking.createdAt)}</p>
                  <p>Cập nhật: {formatDate(booking.updatedAt)}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Thông tin đặt phòng
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">Nhận phòng</p>
                          <p className="font-medium">
                            {formatDate(booking.checkIn)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">Trả phòng</p>
                          <p className="font-medium">
                            {formatDate(booking.checkOut)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Số khách</p>
                          <p className="font-medium">{booking.guests} người</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Chi tiết thanh toán
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giá phòng</span>
                        <span>{formatCurrency(booking.totalPrice)}</span>
                      </div>

                      {booking.services && booking.services.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            Dịch vụ đã đặt:
                          </p>
                          {booking.services.map((service, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-gray-600">
                                {service.name} (x{service.quantity})
                              </span>
                              <span>
                                {formatCurrency(
                                  service.price * service.quantity
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 mt-2 border-t border-gray-200">
                        <div className="flex justify-between font-semibold">
                          <span>Tổng cộng</span>
                          <span>{formatCurrency(booking.totalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {booking.notes && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Ghi chú:</span>{' '}
                      {booking.notes}
                    </p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                  {booking.paymentStatus === 'pending' && (
                    <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                      Thanh toán ngay
                    </Button>
                  )}
                  <Button variant="outline" className="w-full sm:w-auto">
                    Liên hệ hỗ trợ
                  </Button>
                  {booking.paymentStatus === 'pending' && (
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto"
                    >
                      Hủy đặt phòng
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
