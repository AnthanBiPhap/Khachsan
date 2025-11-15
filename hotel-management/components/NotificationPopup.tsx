'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import notificationService from '@/services/notificationService';

interface NotificationPopupData {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  bookingId?: string;
  groupBookingId?: string;
}

export default function NotificationPopup() {
  const router = useRouter();
  const [notification, setNotification] = useState<NotificationPopupData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Lắng nghe custom event khi có notification mới
    const handleNewNotification = async (event: CustomEvent) => {
      const data = event.detail;
      
      // Hiển thị popup
      setNotification({
        id: data.booking?._id || data.groupBooking?._id || Date.now().toString(),
        type: data.type,
        title: getNotificationTitle(data.type),
        message: data.message,
        timestamp: data.timestamp,
        bookingId: data.booking?._id,
        groupBookingId: data.groupBooking?._id,
      });
      
      setIsVisible(true);
      
      // Tự động ẩn sau 8 giây
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setNotification(null), 300); // Đợi animation kết thúc
      }, 8000);
    };

    window.addEventListener('show-notification-popup', handleNewNotification as EventListener);
    
    return () => {
      window.removeEventListener('show-notification-popup', handleNewNotification as EventListener);
    };
  }, []);

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'booking_paid':
        return 'Thanh toán thành công';
      case 'booking_cancelled':
        return 'Đặt phòng đã bị hủy';
      case 'booking_refunded':
        return 'Hoàn tiền thành công';
      case 'group_booking_approved':
        return 'Đặt phòng nhóm đã được duyệt';
      case 'group_booking_quoted':
        return 'Đã nhận báo giá';
      case 'group_booking_paid':
        return 'Đã thanh toán đầy đủ đặt phòng nhóm';
      case 'group_booking_confirmed':
        return 'Đặt phòng nhóm đã được xác nhận hoàn tất';
      default:
        return 'Thông báo mới';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking_paid':
        return 'bg-green-50 border-green-200';
      case 'booking_cancelled':
        return 'bg-red-50 border-red-200';
      case 'booking_refunded':
        return 'bg-blue-50 border-blue-200';
      case 'group_booking_approved':
        return 'bg-green-50 border-green-200';
      case 'group_booking_quoted':
        return 'bg-purple-50 border-purple-200';
      case 'group_booking_paid':
        return 'bg-green-50 border-green-200';
      case 'group_booking_confirmed':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setNotification(null), 300);
  };

  const handleView = () => {
    handleClose();
    if (notification?.bookingId) {
      router.push('/my-bookings');
    } else if (notification?.groupBookingId) {
      router.push('/group-booking');
    } else {
      router.push('/notifications');
    }
  };

  if (!notification) return null;

  return (
    <div
      className={`fixed top-20 right-4 z-50 transition-all duration-300 ${
        isVisible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-full pointer-events-none'
      }`}
    >
      <div
        className={`w-96 bg-white rounded-xl shadow-2xl border-2 ${getNotificationColor(
          notification.type
        )} overflow-hidden`}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">{notification.title}</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-2">
                {format(new Date(notification.timestamp), 'dd/MM/yyyy HH:mm', { locale: vi })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleView}
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
            >
              Xem chi tiết
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="px-3"
            >
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

