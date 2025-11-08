'use client';

import { useCallback, useEffect, useState } from 'react';
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
  Copy,
  ClipboardCheck,
} from 'lucide-react';
import Link from 'next/link';
import { bookingService } from '@/services/bookingService';
import { groupBookingService, type GroupBooking } from '@/services/groupBookingService';

type GuestInfo = {
  fullName: string;
  phoneNumber: string;
  idNumber?: string;
  dateOfBirth?: string;
  email?: string;
  isMainGuest?: boolean;
  _id?: string;
};

type Booking = {
  _id: string;
  customerId?: {
    _id: string;
    fullName: string;
    email?: string;
    phoneNumber?: string;
  };
  guests: GuestInfo[]; // Mảng khách hàng mới
  guestCount: number; // Số lượng khách
  roomId: {
    _id: string;
    roomNumber: string;
    typeId: string;
  };
  checkIn: string;
  checkOut: string;
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
  const [groupBookings, setGroupBookings] = useState<GroupBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [copiedGroupId, setCopiedGroupId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      setError(null);

      const bookingUrl = `http://localhost:8080/api/v1/bookings?customerId=${user._id}`;
      const [bookingResponse, groupResults] = await Promise.all([
        fetch(bookingUrl, { cache: 'no-store' }),
        groupBookingService.list({ requesterId: user._id }),
      ]);

      if (!bookingResponse.ok) {
        throw new Error('Không thể tải thông tin đặt phòng');
      }

      const bookingJson = await bookingResponse.json();
      const allBookings = bookingJson.data.bookings || [];
      const userBookings = allBookings.filter(
        (b: any) => b.customerId?._id === user._id
      );

      setBookings(userBookings);
      setGroupBookings(groupResults || []);
    } catch (err) {
      console.error('Lỗi khi tải đặt phòng:', err);
      setError('Đã xảy ra lỗi khi tải thông tin đặt phòng');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  // ✅ Chờ AuthContext load xong (tránh báo lỗi nhầm khi chưa có user)
  useEffect(() => {
    if (isLoading) return; // đợi auth load xong

    if (!user?._id) {
      setLoading(false);
      setError('Bạn cần đăng nhập để xem trang này');
      return;
    }

    fetchBookings();
  }, [user?._id, isLoading, fetchBookings]);

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

  // Kiểm tra có thể hủy phòng/hoàn tiền hay không dựa trên thời gian từ khi đặt phòng
  // Chỉ cho phép hủy trong vòng 1 ngày (24 giờ) kể từ khi đặt phòng
  const canCancel = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursSinceCreated = (now.getTime() - created.getTime()) / (1000 * 60 * 60); // Tính theo giờ
    return hoursSinceCreated <= 24; // Cho phép hủy trong 24 giờ đầu
  };

  // Tính số giờ còn lại để có thể hủy phòng (từ khi đặt phòng)
  const getHoursRemainingForCancel = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursSinceCreated = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    const hoursRemaining = 24 - hoursSinceCreated;
    return Math.max(0, Math.ceil(hoursRemaining)); // Làm tròn lên, không âm
  };

  const renderGroupStatusBadge = (status: GroupBooking['status']) => {
    switch (status) {
      case 'pending_approval':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            Chờ duyệt
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            Đã duyệt
          </span>
        );
      case 'info_uploaded':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
            Đã cập nhật danh sách
          </span>
        );
      case 'quoted':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
            Đã báo giá
          </span>
        );
      case 'awaiting_payment':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
            Chờ thanh toán
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Đã thanh toán
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800">
            Đã xác nhận
          </span>
        );
      case 'refund_requested':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            Đang xử lý hoàn tiền
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Đã hoàn tiền
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
            Đang xử lý
          </span>
        );
    }
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

  if (bookings.length === 0 && groupBookings.length === 0) {
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
            Lịch sử đặt phòng
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
                      Phòng {String(booking.roomId?.roomNumber || '')}
                    </h2>
                    <div className="mt-1">
                      {getStatusBadge(booking.paymentStatus)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Mã đặt phòng</p>
                    <p className="font-mono font-medium">
                      {String(booking._id || '').slice(-8).toUpperCase()}
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
                          <p className="font-medium">{String(booking.guestCount || booking.guests?.length || 0)} người</p>
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
                        <span>{formatCurrency(Number(booking.totalPrice) || 0)}</span>
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
                          <span>{formatCurrency(Number(booking.totalPrice) || 0)}</span>
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
                                <span className="text-sm text-blue-700">Có thể hủy phòng:</span>
                                <span className={`text-sm font-medium ${canCancel(booking.createdAt) ? 'text-green-600' : 'text-red-600'}`}>
                                  {canCancel(booking.createdAt) ? '✅ Có thể hủy phòng' : '❌ Không thể hủy phòng'}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-blue-700">Thời gian còn lại để hủy:</span>
                                <span className="text-sm font-medium text-blue-900">
                                  {canCancel(booking.createdAt) 
                                    ? `${getHoursRemainingForCancel(booking.createdAt)} giờ`
                                    : 'Đã hết hạn'
                                  }
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-blue-700">Số tiền hoàn:</span>
                                <span className="text-sm font-medium text-blue-900">
                                  {booking.paymentStatus === 'refunded' 
                                    ? formatCurrency(Number(booking.totalPrice) || 0)
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
                            
                            {/* Thông báo chính sách hủy phòng */}
                            <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-200">
                              <p className="text-xs text-blue-700">
                                📋 <strong>Chính sách hủy phòng:</strong> Chỉ có thể hủy phòng trong vòng 24 giờ (1 ngày) kể từ khi đặt phòng. Sau thời gian này, không thể hủy phòng nữa.
                              </p>
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
                            
                            {booking.paymentStatus === 'paid' && !canCancel(booking.createdAt) && (
                              <div className="mt-3 p-2 bg-red-50 rounded-md border border-red-200">
                                <p className="text-xs text-red-700">
                                  ⚠️ Không thể hủy phòng vì đã quá 24 giờ kể từ khi đặt phòng. Thời gian hủy phòng đã hết hạn.
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
                      {String(booking.notes || '')}
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
                  {booking.paymentStatus === 'pending' && canCancel(booking.createdAt) && (
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto"
                      disabled={actionLoadingId === booking._id}
                      onClick={async () => {
                        try {
                          setActionLoadingId(booking._id);
                          await bookingService.updateBooking(booking._id, {
                            paymentStatus: 'cancelled',
                            note: 'Khách hàng hủy đặt phòng',
                          });
                          // cập nhật lại danh sách
                          await fetchBookings();
                          message.success('Đã hủy đặt phòng thành công!');
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
                  
                  {booking.paymentStatus === 'pending' && !canCancel(booking.createdAt) && (
                    <Button
                      variant="outline"
                      className="text-gray-400 border-gray-200 cursor-not-allowed w-full sm:w-auto"
                      disabled={true}
                    >
                      Không thể hủy phòng (đã quá 24 giờ)
                    </Button>
                  )}
                  {booking.paymentStatus === 'paid' && canCancel(booking.createdAt) && (
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto"
                      disabled={actionLoadingId === booking._id}
                      onClick={async () => {
                        try {
                          setActionLoadingId(booking._id);
                          console.log('🔄 Bắt đầu yêu cầu hủy phòng và hoàn tiền cho booking:', booking._id);
                          
                          const response = await bookingService.updateBooking(booking._id, {
                            paymentStatus: 'refund_requested',
                            note: 'Khách hàng yêu cầu hủy phòng và hoàn tiền',
                          });
                          
                          console.log('✅ Yêu cầu hủy phòng và hoàn tiền thành công:', response);
                          
                          // Refresh danh sách bookings
                          await fetchBookings();
                          
                          // Thông báo thành công
                          message.success('Yêu cầu hủy phòng và hoàn tiền đã được gửi thành công!', 5);
                          
                        } catch (e: any) {
                          console.error('❌ Lỗi yêu cầu hủy phòng và hoàn tiền:', e);
                          console.error('Error details:', {
                            message: e.message,
                            status: e.status,
                            response: e.response
                          });
                          
                          // Hiển thị lỗi cụ thể hơn
                          const errorMessage = e.message || 'Yêu cầu hủy phòng thất bại';
                          alert(`Lỗi: ${errorMessage}`);
                        } finally {
                          setActionLoadingId(null);
                        }
                      }}
                    >
                      {actionLoadingId === booking._id ? 'Đang xử lý...' : 'Hủy phòng & Hoàn tiền'}
                    </Button>
                  )}
                  
                  {booking.paymentStatus === 'paid' && !canCancel(booking.createdAt) && (
                    <Button
                      variant="outline"
                      className="text-gray-400 border-gray-200 cursor-not-allowed w-full sm:w-auto"
                      disabled={true}
                    >
                      Không thể hủy phòng (đã quá 24 giờ)
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {groupBookings.length > 0 && (
          <div className="mt-12 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">Đặt đoàn của bạn</h2>
              <p className="text-gray-600">Theo dõi tiến độ xử lý các yêu cầu đặt đoàn</p>
            </div>
            {groupBookings.map((group) => {
              const groupCanCancel = canCancel(group.createdAt);
              const hoursRemaining = getHoursRemainingForCancel(group.createdAt);
              const isPaid = group.status === 'paid';
              const requiresRefund = ['paid', 'confirmed'].includes(group.status);
              const isRefundRequested = group.status === 'refund_requested';
              const isRefunded = group.status === 'refunded';
              const cancellableStatuses = [
                'pending_approval',
                'approved',
                'info_uploaded',
                'quoted',
                'awaiting_payment',
              ];
              const canCancelRequest = cancellableStatuses.includes(group.status);
              const refundAmount = Number(group.refundAmount ?? group.quoteAmount ?? 0);
              const paymentStatusLabel = (() => {
                if (isRefundRequested) return 'Đang xử lý hoàn tiền';
                if (isRefunded) return 'Đã hoàn tiền';
                if (group.status === 'confirmed') return 'Hoàn tất';
                if (group.status === 'paid') return 'Đã thanh toán';
                if (group.status === 'awaiting_payment') return 'Chờ thanh toán';
                if (group.status === 'quoted') return 'Đang chờ xác nhận';
                if (group.status === 'cancelled') return 'Đã hủy';
                return 'Đang xử lý';
              })();

              return (
                <div
                  key={group._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                      <div className="mb-4 sm:mb-0">
                        <h2 className="text-xl font-semibold text-gray-900">
                          Đặt đoàn {String(group._id || '').slice(-8).toUpperCase()}
                        </h2>
                        <div className="mt-2">
                          {renderGroupStatusBadge(group.status)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {group._id}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(group._id);
                                setCopiedGroupId(group._id);
                                message.success('Đã sao chép mã yêu cầu đặt đoàn');
                                setTimeout(() => setCopiedGroupId(null), 2000);
                              } catch (copyError) {
                                console.error(copyError);
                                message.error('Không thể sao chép mã, vui lòng thử lại');
                              }
                            }}
                          >
                            {copiedGroupId === group._id ? (
                              <ClipboardCheck className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Ngày tạo: {formatDate(group.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      <p>Cập nhật lần cuối: {formatDate(group.updatedAt)}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Thông tin đoàn</h3>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <Users className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500">Số khách</p>
                              <p className="font-medium">{group.peopleCount} người</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <Users className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500">Số phòng yêu cầu</p>
                              <p className="font-medium">{group.roomCount} phòng</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500">Nhận phòng</p>
                              <p className="font-medium">{formatDate(group.checkIn)}</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500">Trả phòng</p>
                              <p className="font-medium">{formatDate(group.checkOut)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Chi tiết báo giá</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tổng báo giá</span>
                            <span>{formatCurrency(Number(group.quoteAmount) || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Trạng thái thanh toán</span>
                            <span className="font-medium">{paymentStatusLabel}</span>
                          </div>
                          {group.paymentLink && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                              <p className="text-sm text-blue-700">
                                Liên kết thanh toán: <a href={group.paymentLink} className="underline" target="_blank" rel="noopener noreferrer">Mở liên kết</a>
                              </p>
                            </div>
                          )}
                          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <div className="space-y-2 text-sm text-blue-900">
                              <div className="flex justify-between items-center">
                                <span className="text-blue-700">Trạng thái hoàn tiền:</span>
                                {isRefunded ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" /> Đã hoàn tiền
                                  </span>
                                ) : isRefundRequested ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <ClockIcon className="h-3 w-3 mr-1" /> Đang xử lý hoàn tiền
                                  </span>
                                ) : isPaid ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <CheckCircle className="h-3 w-3 mr-1" /> Đã thanh toán
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    <ClockIcon className="h-3 w-3 mr-1" /> Chưa hoàn tiền
                                  </span>
                                )}
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-blue-700">Có thể hủy đoàn:</span>
                                <span className={`font-medium ${groupCanCancel ? 'text-green-600' : 'text-red-600'}`}>
                                  {groupCanCancel ? '✅ Có thể hủy/ hoàn tiền' : '❌ Không thể hủy (đã quá 24 giờ)'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-blue-700">Thời gian còn lại:</span>
                                <span className="font-medium text-blue-900">
                                  {groupCanCancel ? `${hoursRemaining} giờ` : 'Đã hết hạn'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-blue-700">Số tiền hoàn:</span>
                                <span className="font-medium text-blue-900">
                                  {isRefunded ? formatCurrency(refundAmount || 0) : requiresRefund ? formatCurrency(refundAmount || 0) : '0 VND'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-blue-700">Phương thức hoàn:</span>
                                <span className="font-medium text-blue-900">
                                  {requiresRefund || isRefunded ? 'Stripe / Thẻ tín dụng' : 'Chưa áp dụng'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-blue-700">Thời gian hoàn:</span>
                                <span className="font-medium text-blue-900">
                                  {isRefunded
                                    ? formatDate(group.refundProcessedAt || group.updatedAt)
                                    : 'Chưa có'}
                                </span>
                              </div>
                            </div>
                            <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-200 text-xs text-blue-700">
                              📋 <strong>Chính sách:</strong> Chỉ có thể hủy/hoàn tiền trong 24 giờ đầu từ khi tạo yêu cầu đặt đoàn.
                            </div>
                            {isRefundRequested && (
                              <div className="mt-3 p-2 bg-yellow-50 rounded-md border border-yellow-200 text-xs text-yellow-700">
                                ⏳ Yêu cầu hoàn tiền đang được xử lý. Chúng tôi sẽ liên hệ ngay khi hoàn tất.
                              </div>
                            )}
                            {isRefunded && (
                              <div className="mt-3 p-2 bg-green-50 rounded-md border border-green-200 text-xs text-green-700">
                                ✅ Tiền hoàn đã được khởi tạo. Vui lòng chờ 3-7 ngày làm việc để ngân hàng xử lý.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {group.notes && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">Ghi chú:</span> {String(group.notes || '')}
                        </p>
                      </div>
                    )}

                    {group.allocatedRoomIds && group.allocatedRoomIds.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Phòng đã được phân bổ</h3>
                        <div className="flex flex-wrap gap-2">
                          {group.allocatedRoomIds.map((room) => (
                            <span
                              key={room._id}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                            >
                              Phòng {room.roomNumber}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                      {canCancelRequest && (
                        groupCanCancel ? (
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto"
                            disabled={actionLoadingId === group._id}
                            onClick={async () => {
                              try {
                                setActionLoadingId(group._id);
                                await groupBookingService.cancel(group._id, {
                                  reason: 'Khách hàng hủy yêu cầu đặt đoàn',
                                });
                                await fetchBookings();
                                message.success('Đã hủy yêu cầu đặt đoàn thành công!');
                              } catch (e: any) {
                                console.error('❌ Lỗi hủy đặt đoàn:', e);
                                message.error(e?.message || 'Hủy đặt đoàn thất bại');
                              } finally {
                                setActionLoadingId(null);
                              }
                            }}
                          >
                            {actionLoadingId === group._id ? 'Đang xử lý...' : 'Hủy yêu cầu đặt đoàn'}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="text-gray-400 border-gray-200 cursor-not-allowed w-full sm:w-auto"
                            disabled
                          >
                            Không thể hủy (đã quá 24 giờ)
                          </Button>
                        )
                      )}

                      {requiresRefund && (
                        groupCanCancel ? (
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto"
                            disabled={actionLoadingId === group._id}
                            onClick={async () => {
                              try {
                                setActionLoadingId(group._id);
                                await groupBookingService.cancel(group._id, {
                                  reason: 'khách hàng yêu cầu hoàn tiền đặt đoàn',
                                });
                                await fetchBookings();
                                message.success('Đã gửi yêu cầu hoàn tiền đặt đoàn!');
                              } catch (e: any) {
                                console.error('❌ Lỗi yêu cầu hoàn tiền đặt đoàn:', e);
                                message.error(e?.message || 'Yêu cầu hoàn tiền thất bại');
                              } finally {
                                setActionLoadingId(null);
                              }
                            }}
                          >
                            {actionLoadingId === group._id ? 'Đang xử lý...' : 'Yêu cầu hoàn tiền đặt đoàn'}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="text-gray-400 border-gray-200 cursor-not-allowed w-full sm:w-auto"
                            disabled
                          >
                            Không thể hoàn tiền (đã quá 24 giờ)
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
