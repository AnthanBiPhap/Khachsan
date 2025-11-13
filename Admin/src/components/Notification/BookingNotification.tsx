import React, { useEffect, useRef } from 'react';
import { notification, Button, Space } from 'antd';
import { BellOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { NotificationArgsProps } from 'antd';

interface BookingNotificationData {
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

interface BookingNotificationProps {
  notifications: BookingNotificationData[];
  onNotificationShown: (notificationId: string) => void;
}

// Tạo audio element để phát âm thanh
const playNotificationSound = () => {
  try {
    // Sử dụng Web Audio API để tạo âm thanh beep
    // Tạo audio context mới mỗi lần để tránh lỗi "suspended state"
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    
    // Resume audio context nếu bị suspended (cần user interaction)
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        playTone(audioContext);
      }).catch((err) => {
        console.error('Không thể resume audio context:', err);
        // Fallback: sử dụng beep đơn giản
        playSimpleBeep();
      });
    } else {
      playTone(audioContext);
    }
  } catch (error) {
    console.error('Lỗi phát âm thanh:', error);
    // Fallback: sử dụng beep đơn giản
    playSimpleBeep();
  }
};

// Hàm phát tone chính
const playTone = (audioContext: AudioContext) => {
  try {
    // Tạo oscillator cho tone chính
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Cấu hình âm thanh (tone cao, ngắn, vui vẻ)
    oscillator.frequency.value = 800; // Tần số 800Hz
    oscillator.type = 'sine';

    // Cấu hình volume với fade out
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    // Phát âm thanh
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);

    // Thêm một tone thứ hai để tạo âm thanh "ding-dong"
    setTimeout(() => {
      try {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        
        oscillator2.frequency.value = 1000; // Tần số cao hơn
        oscillator2.type = 'sine';
        
        gainNode2.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.15);
      } catch (e) {
        // Ignore errors for second tone
      }
    }, 100);
  } catch (e) {
    console.error('Lỗi phát tone:', e);
    playSimpleBeep();
  }
};

// Fallback: beep đơn giản sử dụng HTML5 Audio
const playSimpleBeep = () => {
  try {
    // Tạo một beep đơn giản bằng cách tạo audio buffer
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const duration = 0.2;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      data[i] = Math.sin(2 * Math.PI * 800 * t) * 0.3 * Math.exp(-t * 5);
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
  } catch (e) {
    console.log('Không thể phát âm thanh, nhưng thông báo vẫn hiển thị');
  }
};

const BookingNotification: React.FC<BookingNotificationProps> = ({
  notifications,
  onNotificationShown,
}) => {
  const shownNotificationsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    notifications.forEach((notif) => {
      const notificationId = `${notif.booking._id}-${notif.timestamp}`;
      
      // Chỉ hiển thị notification một lần
      if (shownNotificationsRef.current.has(notificationId)) {
        return;
      }

      shownNotificationsRef.current.add(notificationId);

      // Phát âm thanh
      playNotificationSound();

      // Lấy thông tin khách hàng
      const customerName = notif.booking.customerId?.fullName || 
                          notif.booking.guests?.find((g: any) => g.isMainGuest)?.fullName || 
                          'Khách hàng';
      
      // Lấy thông tin phòng
      const roomNumber = notif.booking.roomId?.roomNumber || 'N/A';
      
      // Format giá tiền
      const formattedPrice = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(notif.booking.totalPrice);

      // Format ngày
      const checkInDate = new Date(notif.booking.checkIn).toLocaleDateString('vi-VN');
      const checkOutDate = new Date(notif.booking.checkOut).toLocaleDateString('vi-VN');

      // Hiển thị notification
      notification.open({
        message: '🔔 Đặt phòng mới',
        description: (
          <div>
            <p><strong>{notif.message}</strong></p>
            <p>Khách hàng: {customerName}</p>
            <p>Phòng: {roomNumber}</p>
            <p>Giá: {formattedPrice}</p>
            <p>Check-in: {checkInDate} - Check-out: {checkOutDate}</p>
            <p>Số khách: {notif.booking.guestCount}</p>
            <p>Trạng thái: {notif.booking.paymentStatus === 'partial_paid' ? 'Đã đặt cọc' : 'Chưa thanh toán'}</p>
          </div>
        ),
        icon: <BellOutlined style={{ color: '#1890ff' }} />,
        duration: 10, // Hiển thị 10 giây, sau đó tự động đóng
        placement: 'topRight' as NotificationArgsProps['placement'],
        btn: (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                // Đóng notification ngay lập tức và đánh dấu đã xem
                notification.destroy(notificationId);
                onNotificationShown(notificationId);
              }}
            >
              Đã xem
            </Button>
          </Space>
        ),
        key: notificationId,
        onClick: () => {
          // Có thể navigate đến trang booking detail
          window.location.href = `/bookings`;
        },
        onClose: () => {
          // Khi notification tự đóng (sau 10 giây), đánh dấu đã hiển thị
          // nhưng không đánh dấu đã đọc (vẫn hiển thị trong Notification Center nếu có)
          onNotificationShown(notificationId);
        },
      });
    });
  }, [notifications, onNotificationShown]);

  return null; // Component này không render gì, chỉ xử lý notifications
};

export default BookingNotification;

