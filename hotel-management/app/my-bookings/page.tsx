'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { message } from 'antd';
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
import { bookingService } from '@/services/bookingService';

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
  paymentStatus: 'pending' | 'paid' | 'cancelled' | 'completed' | 'refunded' | 'failed' | 'refund_requested';
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
  const { user, isLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // ✅ Chờ AuthContext load xong (tránh báo lỗi nhầm khi chưa có user)
  useEffect(() => {
    if (isLoading) return; // đợi auth load xong

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
  }, [user, isLoading]);

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
      case 'refunded':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-4 h-4 mr-1" /> Đã hoàn tiền
          </span>
        );
      case 'refund_requested':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
            <ClockIcon className="w-4 h-4 mr-1" /> Đang yêu cầu hoàn tiền
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" /> Thất bại
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

  // ✅ Loading khi AuthContext đang tải
  if (isLoading) {
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

                      {/* Thẻ thông tin hoàn tiền */}
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <CreditCard className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-blue-900 mb-2">
                              Thông tin hoàn tiền
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-blue-700">Trạng thái hoàn tiền:</span>
                                {booking.paymentStatus === 'refunded' ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Đã hoàn tiền
                                  </span>
                                ) : booking.paymentStatus === 'refund_requested' ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    Đang xử lý hoàn tiền
                                  </span>
                                ) : booking.paymentStatus === 'paid' ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Đã thanh toán
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    Chưa hoàn tiền
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-blue-700">Số tiền hoàn:</span>
                                <span className="text-sm font-medium text-blue-900">
                                  {booking.paymentStatus === 'refunded' 
                                    ? formatCurrency(booking.totalPrice)
                                    : '0 VND'
                                  }
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-blue-700">Phương thức hoàn:</span>
                                <span className="text-sm font-medium text-blue-900">
                                  {booking.paymentStatus === 'refunded' 
                                    ? 'Stripe / Thẻ tín dụng'
                                    : 'Chưa áp dụng'
                                  }
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-blue-700">Thời gian hoàn:</span>
                                <span className="text-sm font-medium text-blue-900">
                                  {booking.paymentStatus === 'refunded' 
                                    ? formatDate(booking.updatedAt)
                                    : 'Chưa có'
                                  }
                                </span>
                              </div>
                            </div>
                            
                            {booking.paymentStatus === 'refunded' && (
                              <div className="mt-3 p-2 bg-green-50 rounded-md border border-green-200">
                                <p className="text-xs text-green-700">
                                  ✅ Tiền đã được hoàn về thẻ tín dụng của bạn. 
                                  Thời gian xử lý từ 3-7 ngày làm việc.
                                </p>
                              </div>
                            )}
                            
                            {booking.paymentStatus === 'refund_requested' && (
                              <div className="mt-3 p-2 bg-yellow-50 rounded-md border border-yellow-200">
                                <p className="text-xs text-yellow-700">
                                  ⏳ Yêu cầu hoàn tiền đang được xử lý. 
                                  Chúng tôi sẽ thông báo khi hoàn tất.
                                </p>
                              </div>
                            )}
                          </div>
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
                  <Link href="/contact">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Liên hệ hỗ trợ
                    </Button>
                  </Link>
                  {booking.paymentStatus === 'pending' && (
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto"
                      disabled={actionLoadingId === booking._id}
                      onClick={async () => {
                        try {
                          setActionLoadingId(booking._id);
                          await bookingService.updateBooking(booking._id, {
                            paymentStatus: 'failed',
                            status: 'cancelled',
                            note: 'Khách hàng hủy đặt phòng',
                          });
                          // cập nhật lại danh sách
                          const res = await fetch(`http://localhost:8080/api/v1/bookings?customerId=${user?._id}`);
                          const data = await res.json();
                          setBookings((data.data.bookings || []).filter((b: any) => b.customerId?._id === user?._id));
                        } catch (e) {
                          console.error(e);
                          alert('Hủy đặt phòng thất bại');
                        } finally {
                          setActionLoadingId(null);
                        }
                      }}
                    >
                      {actionLoadingId === booking._id ? 'Đang hủy...' : 'Hủy đặt phòng'}
                    </Button>
                  )}
                  {booking.paymentStatus === 'paid' && (
                    <Button
                      variant="outline"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 w-full sm:w-auto"
                      disabled={actionLoadingId === booking._id}
                      onClick={async () => {
                        try {
                          setActionLoadingId(booking._id);
                          console.log('🔄 Bắt đầu yêu cầu hoàn tiền cho booking:', booking._id);
                          
                          const response = await bookingService.updateBooking(booking._id, {
                            paymentStatus: 'refund_requested',
                            note: 'Khách hàng yêu cầu hoàn tiền',
                          });
                          
                          console.log('✅ Yêu cầu hoàn tiền thành công:', response);
                          
                          // Refresh danh sách bookings
                          const res = await fetch(`http://localhost:8080/api/v1/bookings?customerId=${user?._id}`);
                          if (!res.ok) {
                            throw new Error(`HTTP error! status: ${res.status}`);
                          }
                          const data = await res.json();
                          setBookings((data.data.bookings || []).filter((b: any) => b.customerId?._id === user?._id));
                          
                          // Thông báo thành công
                          message.success('Yêu cầu hoàn tiền đã được gửi thành công!', 5);
                          
                        } catch (e: any) {
                          console.error('❌ Lỗi yêu cầu hoàn tiền:', e);
                          console.error('Error details:', {
                            message: e.message,
                            status: e.status,
                            response: e.response
                          });
                          
                          // Hiển thị lỗi cụ thể hơn
                          const errorMessage = e.message || 'Yêu cầu hoàn tiền thất bại';
                          alert(`Lỗi: ${errorMessage}`);
                        } finally {
                          setActionLoadingId(null);
                        }
                      }}
                    >
                      {actionLoadingId === booking._id ? 'Đang gửi yêu cầu...' : 'Yêu cầu hoàn tiền'}
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
