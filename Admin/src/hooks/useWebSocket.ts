import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { env } from '../constanst/getEnvs';

interface BookingNotification {
  type: string;
  booking: {
    _id: string;
    customerId: any;
    roomId: any;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    paymentStatus: string;
    source: string;
    guestCount: number;
    guests: any[];
  };
  message: string;
  timestamp: string;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  notifications: BookingNotification[];
  clearNotifications: () => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const { tokens, user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Chỉ kết nối nếu user là admin hoặc staff và có token
    if (!tokens?.accessToken || !user || (user.role !== 'admin' && user.role !== 'staff')) {
      return;
    }

    // Tạo kết nối WebSocket
    const newSocket = io(env.API_URL, {
      auth: {
        token: tokens.accessToken,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;

    // Xử lý kết nối thành công
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected:', newSocket.id);
      setIsConnected(true);
    });

    // Xử lý kết nối thất bại
    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Xử lý ngắt kết nối
    newSocket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    // Lắng nghe thông báo đặt phòng mới
    newSocket.on('new_booking', (data: BookingNotification) => {
      console.log('📢 Nhận được thông báo đặt phòng mới:', data);
      setNotifications((prev) => [data, ...prev]);
    });

    // Xử lý kết nối thành công từ server
    newSocket.on('connected', (data) => {
      console.log('✅ Server confirmed connection:', data);
    });

    setSocket(newSocket);

    // Cleanup khi component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, [tokens?.accessToken, user]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    socket,
    isConnected,
    notifications,
    clearNotifications,
  };
};

