import React, { useEffect, useRef } from 'react';
import { notification, Button, Space } from 'antd';
import { BellOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { NotificationArgsProps } from 'antd';

interface BookingNotificationData {
  type: string;
  booking?: {
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
  groupBooking?: {
    _id: string;
    requesterId: any;
    requesterName: string;
    requesterPhone: string;
    checkIn: string;
    checkOut: string;
    peopleCount: number;
    roomCount: number;
    status: string;
    quoteAmount?: number;
    paidAmount?: number;
    remainingAmount?: number;
  };
  message: string;
  timestamp: string;
  isDeposit?: boolean;
  isFullPayment?: boolean;
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
    
    // Kiểm tra xem có AudioContext không
    if (!AudioContextClass) {
      console.warn('Web Audio API không được hỗ trợ. Sử dụng beep đơn giản.');
      playSimpleBeep();
      return;
    }
    
    const audioContext = new AudioContextClass();
    
    // Resume audio context nếu bị suspended (cần user interaction)
    if (audioContext.state === 'suspended') {
      audioContext.resume()
        .then(() => {
          console.log('✅ Audio context đã được resume');
          playTone(audioContext);
        })
        .catch((err) => {
          console.error('❌ Không thể resume audio context:', err);
          // Fallback: sử dụng beep đơn giản
          playSimpleBeep();
        });
    } else {
      playTone(audioContext);
    }
  } catch (error) {
    console.error('❌ Lỗi phát âm thanh:', error);
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
      // Xác định notification ID và loại
      const isGroupBooking = !!notif.groupBooking;
      const isPaymentNotification = notif.type === 'group_booking_payment';
      
      // Tạo notification ID duy nhất dựa trên loại notification
      let notificationId: string;
      if (isPaymentNotification && notif.groupBooking) {
        // Notification thanh toán có ID riêng để phân biệt với notification đặt phòng mới
        notificationId = `payment-group-${notif.groupBooking._id}-${notif.timestamp}`;
      } else if (isGroupBooking) {
        notificationId = `group-${notif.groupBooking._id}-${notif.timestamp}`;
      } else {
        notificationId = `${notif.booking?._id}-${notif.timestamp}`;
      }
      
      // Chỉ hiển thị notification một lần
      if (shownNotificationsRef.current.has(notificationId)) {
        return;
      }

      shownNotificationsRef.current.add(notificationId);

      // Kiểm tra loại notification để hiển thị
      const notificationType = isPaymentNotification 
        ? 'Payment' 
        : isGroupBooking 
          ? 'Group Booking' 
          : 'Booking';
      
      // Phát âm thanh cho thông báo mới
      console.log(`🔔 Hiển thị notification: ${notificationType} - ${notificationId}`);
      try {
        playNotificationSound();
        console.log('✅ Đã phát âm thanh thông báo');
      } catch (soundError) {
        console.error('❌ Lỗi phát âm thanh:', soundError);
        // Vẫn hiển thị notification dù không phát được âm thanh
      }

      let descriptionContent: React.ReactNode;
      let navigateUrl = '/bookings';
      let notificationTitle = '🔔 Đặt phòng mới';

      if (isPaymentNotification && notif.groupBooking) {
        // Group booking payment notification
        const isDeposit = notif.isDeposit || false;
        const isFullPayment = notif.isFullPayment || false;
        notificationTitle = isDeposit 
          ? '💳 Nhận đặt cọc đặt phòng nhóm' 
          : isFullPayment
            ? '✅ Thanh toán đủ đặt phòng nhóm'
            : '💳 Thanh toán đặt phòng nhóm';
        
        const checkInDate = new Date(notif.groupBooking.checkIn).toLocaleDateString('vi-VN');
        const checkOutDate = new Date(notif.groupBooking.checkOut).toLocaleDateString('vi-VN');
        const formattedTotalPrice = notif.groupBooking.quoteAmount 
          ? new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(notif.groupBooking.quoteAmount)
          : 'Chưa có báo giá';
        const formattedPaidAmount = notif.groupBooking.paidAmount 
          ? new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(notif.groupBooking.paidAmount)
          : '0 VND';
        const formattedRemainingAmount = notif.groupBooking.remainingAmount 
          ? new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(notif.groupBooking.remainingAmount)
          : '0 VND';

        descriptionContent = (
          <div>
            <p><strong>{notif.message}</strong></p>
            <p>Người yêu cầu: {notif.groupBooking.requesterName}</p>
            <p>Số điện thoại: {notif.groupBooking.requesterPhone}</p>
            <p>Số phòng: {notif.groupBooking.roomCount}</p>
            <p>Số người: {notif.groupBooking.peopleCount}</p>
            <p>Tổng giá: {formattedTotalPrice}</p>
            <p style={{ color: '#52c41a', fontWeight: 'bold' }}>
              Đã thanh toán: {formattedPaidAmount}
            </p>
            {notif.groupBooking.remainingAmount && notif.groupBooking.remainingAmount > 0 && (
              <p style={{ color: '#fa8c16', fontWeight: 'bold' }}>
                Còn lại: {formattedRemainingAmount}
              </p>
            )}
            <p>Check-in: {checkInDate} - Check-out: {checkOutDate}</p>
            <p>Trạng thái: {
              notif.groupBooking.status === 'deposit_paid' 
                ? 'Đã đặt cọc' 
                : notif.groupBooking.status === 'paid'
                  ? 'Đã thanh toán đủ'
                  : notif.groupBooking.status
            }</p>
          </div>
        );
        navigateUrl = '/group-bookings';
      } else if (isGroupBooking && notif.groupBooking) {
        // Group booking notification
        notificationTitle = '🔔 Yêu cầu đặt phòng nhóm mới';
        const checkInDate = new Date(notif.groupBooking.checkIn).toLocaleDateString('vi-VN');
        const checkOutDate = new Date(notif.groupBooking.checkOut).toLocaleDateString('vi-VN');
        const formattedPrice = notif.groupBooking.quoteAmount 
          ? new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(notif.groupBooking.quoteAmount)
          : 'Chưa có báo giá';

        descriptionContent = (
          <div>
            <p><strong>{notif.message}</strong></p>
            <p>Người yêu cầu: {notif.groupBooking.requesterName}</p>
            <p>Số điện thoại: {notif.groupBooking.requesterPhone}</p>
            <p>Số phòng: {notif.groupBooking.roomCount}</p>
            <p>Số người: {notif.groupBooking.peopleCount}</p>
            <p>Giá dự kiến: {formattedPrice}</p>
            <p>Check-in: {checkInDate} - Check-out: {checkOutDate}</p>
            <p>Trạng thái: {notif.groupBooking.status === 'pending_approval' ? 'Chờ duyệt' : notif.groupBooking.status}</p>
          </div>
        );
        navigateUrl = '/group-bookings';
      } else if (notif.booking) {
        // Regular booking notification
        const customerName = notif.booking.customerId?.fullName || 
                            notif.booking.guests?.find((g: any) => g.isMainGuest)?.fullName || 
                            'Khách hàng';
        const roomNumber = notif.booking.roomId?.roomNumber || 'N/A';
        const formattedPrice = new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(notif.booking.totalPrice);
        const checkInDate = new Date(notif.booking.checkIn).toLocaleDateString('vi-VN');
        const checkOutDate = new Date(notif.booking.checkOut).toLocaleDateString('vi-VN');

        descriptionContent = (
          <div>
            <p><strong>{notif.message}</strong></p>
            <p>Khách hàng: {customerName}</p>
            <p>Phòng: {roomNumber}</p>
            <p>Giá: {formattedPrice}</p>
            <p>Check-in: {checkInDate} - Check-out: {checkOutDate}</p>
            <p>Số khách: {notif.booking.guestCount}</p>
            <p>Trạng thái: {notif.booking.paymentStatus === 'partial_paid' ? 'Đã đặt cọc' : 'Chưa thanh toán'}</p>
          </div>
        );
      } else {
        // Fallback
        descriptionContent = <div><p><strong>{notif.message}</strong></p></div>;
      }

      // Hiển thị notification
      notification.open({
        message: notificationTitle,
        description: descriptionContent,
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
          window.location.href = navigateUrl;
        },
        onClose: () => {
          onNotificationShown(notificationId);
        },
      });
    });
  }, [notifications, onNotificationShown]);

  return null; // Component này không render gì, chỉ xử lý notifications
};

export default BookingNotification;

