import React, { useEffect, useState } from 'react';
import { Drawer, List, Badge, Typography, Space, Tag, Empty, Button, Spin, message } from 'antd';
import { BellOutlined, CalendarOutlined, UserOutlined, HomeOutlined, DollarOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { fetchMyNotifications, deleteNotification, fetchUnreadCount, type Notification } from '../../services/notifications.service';
import { useAuthStore } from '../../stores/authStore';

const { Text } = Typography;

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  onNotificationClick?: (bookingId: string) => void;
  onRefresh?: (count?: number) => void;
}

const toUserIdString = (val: unknown): string => {
  if (typeof val === 'string') return val;
  const obj = val as { _id?: string };
  return obj?._id?.toString?.() || '';
};

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  open,
  onClose,
  onNotificationClick,
  onRefresh,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuthStore();

  const isNotificationRead = (notification: Notification) => {
    if (!user?._id) return false;
    
    const currentUserId = user._id.toString();
    const recipient = notification.recipients.find((r) => toUserIdString(r.userId) === currentUserId);
    return recipient?.read || false;
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const [result, count] = await Promise.all([
        fetchMyNotifications(1, 50),
        fetchUnreadCount(),
      ]);
      setNotifications(result.data);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
      message.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, user?._id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getPaymentStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      partial_paid: { color: 'orange', text: 'Đã đặt cọc' },
      paid: { color: 'green', text: 'Đã thanh toán' },
      pending: { color: 'default', text: 'Chưa thanh toán' },
      cancelled: { color: 'red', text: 'Đã hủy' },
    };
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const getSourceTag = (source: string) => {
    return source === 'online' ? (
      <Tag color="blue">Online</Tag>
    ) : (
      <Tag color="purple">Walk-in</Tag>
    );
  };

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      await loadNotifications();
      if (onRefresh) onRefresh();
      message.success('Đã xóa thông báo');
    } catch (error) {
      console.error('Error delete notification:', error);
      message.error('Không thể xóa thông báo');
    }
  };

  return (
    <Drawer
      title={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <BellOutlined />
            <span>Thông báo đặt phòng</span>
            {unreadCount > 0 && (
              <Badge count={unreadCount} style={{ backgroundColor: '#52c41a' }} />
            )}
          </Space>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={480}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : notifications.length === 0 ? (
        <Empty
          description="Chưa có thông báo nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          itemLayout="vertical"
          dataSource={[...notifications].sort((a, b) => 
            dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
          )}
          renderItem={(notif) => {
            const isRead = isNotificationRead(notif);
            const bookingData = notif.bookingData;
            const isGroupBooking = !!notif.metadata?.groupBookingId;
            const isPaymentNotification = notif.type === 'payment_received' && isGroupBooking;
            
            let customerName = 'Khách hàng';
            let roomNumber = 'N/A';
            let checkInDate = 'N/A';
            let checkOutDate = 'N/A';

            if (isGroupBooking && notif.metadata) {
              // Group booking
              customerName = notif.metadata.requesterName || 'Khách hàng';
              roomNumber = `${notif.metadata.roomCount || 0} phòng`;
              checkInDate = bookingData?.checkIn ? dayjs(bookingData.checkIn).format('DD/MM/YYYY') : 'N/A';
              checkOutDate = bookingData?.checkOut ? dayjs(bookingData.checkOut).format('DD/MM/YYYY') : 'N/A';
            } else if (bookingData) {
              // Regular booking
              customerName =
                bookingData?.customerId?.fullName ||
                bookingData?.guests?.find((g: { isMainGuest?: boolean; fullName?: string }) => g.isMainGuest)?.fullName ||
                'Khách hàng';
              roomNumber = bookingData?.roomId?.roomNumber || 'N/A';
              checkInDate = bookingData?.checkIn ? dayjs(bookingData.checkIn).format('DD/MM/YYYY') : 'N/A';
              checkOutDate = bookingData?.checkOut ? dayjs(bookingData.checkOut).format('DD/MM/YYYY') : 'N/A';
            }

            const notificationTime = dayjs(notif.createdAt).format('DD/MM/YYYY HH:mm');
            const paidAmount = notif.metadata?.paidAmount || 0;
            const remainingAmount = notif.metadata?.remainingAmount || 0;
            const isDeposit = notif.metadata?.isDeposit || false;
            const isFullPayment = notif.metadata?.isFullPayment || false;

            return (
              <List.Item
                key={notif._id}
                style={{
                  padding: '16px',
                  marginBottom: '12px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  backgroundColor: isRead ? '#fafafa' : '#fff',
                  opacity: isRead ? 0.8 : 1,
                }}
                onClick={() => {
                  if (onNotificationClick) {
                    if (isGroupBooking && notif.metadata?.groupBookingId) {
                      // Navigate to group bookings page
                      window.location.href = '/group-bookings';
                    } else if (bookingData?.bookingId) {
                      onNotificationClick(bookingData.bookingId);
                    }
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isRead ? '#fafafa' : '#fff';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                actions={[
                  <Button
                    key="delete"
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => handleDelete(notif._id, e)}
                  >
                    Xóa
                  </Button>,
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ 
                      fontSize: '24px', 
                      color: isPaymentNotification ? '#52c41a' : '#1890ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isPaymentNotification ? '💳' : <BellOutlined />}
                    </div>
                  }
                  title={
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <div>
                        <Text strong style={{ fontSize: '16px', color: isPaymentNotification ? '#52c41a' : undefined }}>
                          {notif.title}
                        </Text>
                        {!isRead && <Badge dot style={{ marginLeft: '8px' }} />}
                      </div>
                      {bookingData && (
                        <Space>
                          {getSourceTag(bookingData.source)}
                          {getPaymentStatusTag(bookingData.paymentStatus)}
                          {isPaymentNotification && (
                            <Tag color={isDeposit ? 'orange' : isFullPayment ? 'green' : 'blue'}>
                              {isDeposit ? 'Đặt cọc' : isFullPayment ? 'Thanh toán đủ' : 'Thanh toán'}
                            </Tag>
                          )}
                        </Space>
                      )}
                    </Space>
                  }
                  description={
                    bookingData || isGroupBooking ? (
                      <Space direction="vertical" size={8} style={{ width: '100%', marginTop: '8px' }}>
                        <div>
                          <Text>{notif.message}</Text>
                        </div>
                        <div>
                          <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                          <Text>{isGroupBooking ? 'Người yêu cầu' : 'Khách hàng'}: {customerName}</Text>
                        </div>
                        {isGroupBooking && notif.metadata?.requesterPhone && (
                          <div>
                            <Text type="secondary">SĐT: {notif.metadata.requesterPhone}</Text>
                          </div>
                        )}
                        <div>
                          <HomeOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                          <Text>Phòng: {roomNumber}</Text>
                        </div>
                        <div>
                          <CalendarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                          <Text>
                            {checkInDate} - {checkOutDate}
                          </Text>
                        </div>
                        {bookingData?.totalPrice && (
                          <div>
                            <DollarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                            <Text>Tổng giá: <Text strong>{formatPrice(bookingData.totalPrice)}</Text></Text>
                          </div>
                        )}
                        {isPaymentNotification && paidAmount > 0 && (
                          <div style={{ 
                            padding: '8px 12px', 
                            background: '#f6ffed', 
                            borderRadius: '4px',
                            border: '1px solid #b7eb8f'
                          }}>
                            <DollarOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                            <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
                              Đã thanh toán: {formatPrice(paidAmount)}
                            </Text>
                            {remainingAmount > 0 && (
                              <div style={{ marginTop: '4px' }}>
                                <Text type="secondary" style={{ fontSize: '13px' }}>
                                  Còn lại: <Text strong style={{ color: '#fa8c16' }}>{formatPrice(remainingAmount)}</Text>
                                </Text>
                              </div>
                            )}
                            {remainingAmount === 0 && (
                              <div style={{ marginTop: '4px' }}>
                                <Tag color="success" style={{ fontSize: '12px' }}>✅ Đã thanh toán đủ</Tag>
                              </div>
                            )}
                          </div>
                        )}
                        <div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {isGroupBooking 
                              ? `Số người: ${notif.metadata?.peopleCount || 0} • ${notificationTime}`
                              : `Số khách: ${bookingData?.guestCount || 0} • ${notificationTime}`
                            }
                          </Text>
                        </div>
                      </Space>
                    ) : (
                      <Text>{notif.message}</Text>
                    )
                  }
                />
              </List.Item>
            );
          }}
        />
      )}
    </Drawer>
  );
};

export default NotificationCenter;

