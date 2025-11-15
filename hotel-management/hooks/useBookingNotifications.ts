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

interface GroupBookingUpdateNotification {
  type: 'group_booking_approved' | 'group_booking_quoted' | 'group_booking_paid' | 'group_booking_confirmed' | 'group_booking_refunded';
  groupBooking: {
    _id: string;
    requesterName: string;
    checkIn: string;
    checkOut: string;
    roomCount: number;
    peopleCount: number;
    quoteAmount?: number;
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

    // Kích hoạt audio context khi user tương tác với trang (để tránh browser chặn autoplay)
    const activateAudioContext = async () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        console.log('✅ Audio context đã được kích hoạt');
      } catch (error) {
        console.error('❌ Lỗi kích hoạt audio context:', error);
      }
    };

    // Kích hoạt audio context khi user click hoặc scroll
    const handleUserInteraction = () => {
      activateAudioContext();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('scroll', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

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
      console.log('✅ User ID:', user._id);
      console.log('✅ User email:', user.email);
      
      // Đảm bảo join room user:userId
      const userRoom = `user:${user._id}`;
      socket.emit('join-room', userRoom);
      console.log(`📤 Đã gửi yêu cầu join room: ${userRoom}`);
    });
    
    // Lắng nghe event connected từ server
    socket.on('connected', (data: any) => {
      console.log('✅ Server confirmed connection:', data);
      console.log('✅ Server userId:', data.userId);
      console.log('✅ Server socketId:', data.socketId);
    });
    
    // Lắng nghe khi đã join room thành công
    socket.on('joined-room', (data: any) => {
      console.log('✅ Đã join room thành công:', data.room);
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
      
      // Hiển thị notification popup trên màn hình
      window.dispatchEvent(new CustomEvent('show-notification-popup', { detail: data }));

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

    // Lắng nghe group booking updates
    socket.on('group_booking_update', (data: GroupBookingUpdateNotification) => {
      console.log('📢 ========== NHẬN ĐƯỢC THÔNG BÁO GROUP BOOKING UPDATE ==========');
      console.log('📢 Full data:', JSON.stringify(data, null, 2));
      console.log('📢 Type:', data.type);
      console.log('📢 Message:', data.message);
      console.log('📢 Group Booking ID:', data.groupBooking?._id);
      console.log('📢 Current User ID:', user._id);
      console.log('📢 Current User ID type:', typeof user._id);
      console.log('📢 Socket ID:', socket.id);
      console.log('📢 Socket connected:', socket.connected);
      console.log('📢 ============================================================');
      
      // Phát âm thanh thông báo ngay lập tức
      console.log('🔊 Đang phát âm thanh thông báo...');
      playNotificationSound()
        .then(() => {
          console.log('✅ Đã phát âm thanh thành công');
        })
        .catch((error) => {
          console.error('❌ Lỗi phát âm thanh:', error);
          // Thử lại với fallback sau 100ms
          setTimeout(() => {
            console.log('🔊 Thử lại phát âm thanh...');
            playNotificationSound().catch(err => {
              console.error('❌ Lỗi phát âm thanh lần 2:', err);
            });
          }, 100);
        });

      // Refresh unread count
      window.dispatchEvent(new CustomEvent('notification-received'));
      
      // Hiển thị notification popup trên màn hình
      window.dispatchEvent(new CustomEvent('show-notification-popup', { detail: data }));

      // Hiển thị toast notification dựa trên loại
      switch (data.type) {
        case 'group_booking_approved':
          toast.success('Đặt phòng nhóm đã được duyệt!', {
            description: data.message,
            duration: 5000,
          });
          break;
        case 'group_booking_quoted':
          toast.info('Đã nhận báo giá đặt phòng nhóm', {
            description: data.message,
            duration: 5000,
          });
          break;
        case 'group_booking_paid':
          toast.success('Đã thanh toán đầy đủ đặt phòng nhóm!', {
            description: data.message,
            duration: 5000,
          });
          break;
        case 'group_booking_confirmed':
          toast.success('Đặt phòng nhóm đã được xác nhận hoàn tất!', {
            description: data.message,
            duration: 5000,
          });
          break;
        case 'group_booking_refunded':
          toast.info('Hoàn tiền đã được xử lý', {
            description: data.message,
            duration: 5000,
          });
          break;
        default:
          toast.info('Cập nhật đặt phòng nhóm', {
            description: data.message,
            duration: 5000,
          });
      }
    });

    // Cleanup khi component unmount hoặc user thay đổi
    return () => {
      // Sử dụng biến local để tránh race condition
      const socketToDisconnect = socketRef.current;
      if (socketToDisconnect) {
        try {
          // Chỉ disconnect nếu socket đã được tạo và chưa bị đóng
          if (socketToDisconnect.connected) {
            socketToDisconnect.disconnect();
          } else {
            // Nếu chưa connected, chỉ cần remove listeners và close
            socketToDisconnect.removeAllListeners();
            socketToDisconnect.close();
          }
        } catch (error) {
          // Ignore errors khi disconnect (có thể socket đã bị đóng)
          console.warn('⚠️ Lỗi khi cleanup socket (có thể đã bị đóng):', error);
        }
        socketRef.current = null;
      }
    };
  }, [user?._id]);

  return socketRef.current;
}

