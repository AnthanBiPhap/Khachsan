import React, { useEffect, useState } from 'react';
import { Drawer, List, Badge, Typography, Space, Tag, Empty, Button, Spin, message } from 'antd';
import { BellOutlined, CalendarOutlined, UserOutlined, HomeOutlined, DollarOutlined, CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { fetchMyNotifications, markAsRead, markAllAsRead, deleteNotification, fetchUnreadCount, type Notification } from '../../services/notifications.service';
import { useAuthStore } from '../../stores/authStore';

const { Text } = Typography;

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  onNotificationClick?: (bookingId: string) => void;
  onRefresh?: () => void;
}

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
    const recipient = notification.recipients.find(
      (r: any) => {
        const recipientUserId = r.userId?.toString() || r.userId?._id?.toString() || r.userId;
        return recipientUserId === currentUserId;
      }
    );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      const count = await fetchUnreadCount();
      setUnreadCount(count);
      await loadNotifications();
      if (onRefresh) onRefresh();
      message.success('Đã đánh dấu đã đọc');
    } catch (error) {
      message.error('Không thể đánh dấu đã đọc');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      const count = await fetchUnreadCount();
      setUnreadCount(count);
      await loadNotifications();
      if (onRefresh) onRefresh();
      message.success('Đã đánh dấu tất cả đã đọc');
    } catch (error) {
      message.error('Không thể đánh dấu tất cả đã đọc');
    }
  };

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      await loadNotifications();
      if (onRefresh) onRefresh();
      message.success('Đã xóa thông báo');
    } catch (error) {
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
          {unreadCount > 0 && (
            <Button
              type="link"
              size="small"
              onClick={handleMarkAllAsRead}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
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
            const customerName =
              bookingData?.customerId?.fullName ||
              bookingData?.guests?.find((g: any) => g.isMainGuest)?.fullName ||
              'Khách hàng';
            const roomNumber = bookingData?.roomId?.roomNumber || 'N/A';
            const checkInDate = bookingData?.checkIn ? dayjs(bookingData.checkIn).format('DD/MM/YYYY') : 'N/A';
            const checkOutDate = bookingData?.checkOut ? dayjs(bookingData.checkOut).format('DD/MM/YYYY') : 'N/A';
            const notificationTime = dayjs(notif.createdAt).format('DD/MM/YYYY HH:mm');

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
                  if (onNotificationClick && bookingData?.bookingId) {
                    onNotificationClick(bookingData.bookingId);
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
                  !isRead && (
                    <Button
                      key="mark-read"
                      type="text"
                      size="small"
                      icon={<CheckCircleOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif._id);
                      }}
                    >
                      Đánh dấu đã đọc
                    </Button>
                  ),
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
                  avatar={<BellOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                  title={
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <div>
                        <Text strong style={{ fontSize: '16px' }}>
                          {notif.title}
                        </Text>
                        {!isRead && <Badge dot style={{ marginLeft: '8px' }} />}
                      </div>
                      {bookingData && (
                        <Space>
                          {getSourceTag(bookingData.source)}
                          {getPaymentStatusTag(bookingData.paymentStatus)}
                        </Space>
                      )}
                    </Space>
                  }
                  description={
                    bookingData ? (
                      <Space direction="vertical" size={8} style={{ width: '100%', marginTop: '8px' }}>
                        <div>
                          <Text>{notif.message}</Text>
                        </div>
                        <div>
                          <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                          <Text>Khách hàng: {customerName}</Text>
                        </div>
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
                        <div>
                          <DollarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                          <Text strong style={{ color: '#52c41a' }}>
                            {formatPrice(bookingData.totalPrice)}
                          </Text>
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Số khách: {bookingData.guestCount} • {notificationTime}
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

