'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { io, Socket } from 'socket.io-client';
import { playNotificationSound } from '@/utils/soundNotification';
import { toast } from 'sonner';
import notificationService from '@/services/notificationService';

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface BookingUpdateNotification {
  type: 'booking_paid' | 'booking_cancelled' | 'booking_refunded';
  booking: {
    _id: string;
    roomNumber: string;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    paidAmount?: number;
    refundAmount?: number;
  };
  message: string;
  timestamp: string;
}

export function useBookingNotifications() {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Chỉ kết nối nếu user đã đăng nhập
    if (!user?._id) {
      return;
    }

    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    // Tạo kết nối WebSocket
    const socket = io(API_ORIGIN, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Xử lý kết nối thành công
    socket.on('connect', () => {
      console.log('✅ WebSocket connected for booking notifications:', socket.id);
    });

    // Xử lý kết nối thất bại
    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
    });

    // Lắng nghe booking updates
    socket.on('booking_update', (data: BookingUpdateNotification) => {
      console.log('📢 Nhận được thông báo cập nhật booking:', data);
      
      // Phát âm thanh thông báo
      playNotificationSound().catch((error) => {
        console.error('❌ Lỗi phát âm thanh:', error);
      });

      // Refresh unread count (trigger re-render ở Header)
      // Dispatch custom event để Header có thể lắng nghe
      window.dispatchEvent(new CustomEvent('notification-received'));

      // Hiển thị toast notification dựa trên loại
      switch (data.type) {
        case 'booking_paid':
          toast.success('Thanh toán thành công!', {
            description: data.message,
            duration: 5000,
          });
          break;
        case 'booking_cancelled':
          toast.error('Đặt phòng đã bị hủy', {
            description: data.message,
            duration: 5000,
          });
          break;
        case 'booking_refunded':
          toast.info('Hoàn tiền thành công', {
            description: data.message,
            duration: 5000,
          });
          break;
        default:
          toast.info('Cập nhật đặt phòng', {
            description: data.message,
            duration: 5000,
          });
      }
    });

    // Cleanup khi component unmount hoặc user thay đổi
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?._id]);

  return socketRef.current;
}

