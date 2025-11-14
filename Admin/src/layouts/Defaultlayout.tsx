import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  PieChartOutlined,
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
  HomeOutlined,
  AppstoreOutlined,
  ToolOutlined,
  ShoppingCartOutlined,
  EnvironmentOutlined,
  StarOutlined,
  FileDoneOutlined,
  CreditCardOutlined,
  UserOutlined,
  LogoutOutlined,
  DeploymentUnitOutlined,
  BellOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, theme, Button, Space, Badge } from 'antd';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useWebSocket } from '../hooks/useWebSocket';
import BookingNotification from '../components/Notification/BookingNotification';
import NotificationCenter from '../components/Notification/NotificationCenter';
import { fetchUnreadCount } from '../services/notifications.service';

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number] & {
  label: string;
  key: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
};

function createMenuItem(
  label: string,
  key: string,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const allMenuItems = [
  createMenuItem('Dashboard', '/', <PieChartOutlined />),
  createMenuItem('Users', '/users', <TeamOutlined />),
  createMenuItem('Bookings', '/bookings', <BookOutlined />),
  createMenuItem('Booking Status', '/bookingStatus', <FileDoneOutlined />),
  createMenuItem('Guests', '/guests', <UserOutlined />),
  createMenuItem('Rooms', '/rooms', <HomeOutlined />),
  createMenuItem('Room Types', '/room-types', <AppstoreOutlined />),
  createMenuItem('Services', '/services', <ToolOutlined />),
  createMenuItem('Service Bookings', '/service-bookings', <ShoppingCartOutlined />),
  createMenuItem('Locations', '/locations', <EnvironmentOutlined />),
  createMenuItem('Reviews', '/reviews', <StarOutlined />),
  createMenuItem('Invoices', '/invoices', <FileTextOutlined />),
  createMenuItem('Payments', '/payments', <CreditCardOutlined />),
  createMenuItem('Group Bookings', '/group-bookings', <DeploymentUnitOutlined />),
  createMenuItem('Chat', '/chat', <MessageOutlined />),
  // createMenuItem('Invoice Items', '/invoiceitems', <FileTextOutlined />),
];

// Function to get menu items based on user role
const getMenuItemsByRole = (userRole: string): MenuItem[] => {
  if (userRole === 'admin') {
    return allMenuItems;
  } else if (userRole === 'staff') {
    // Staff chỉ được xem: Dashboard, Bookings, Booking Status, Guests, Service Bookings, Users, Invoices, Chat
    return allMenuItems.filter(item => 
      ['/', '/bookings', '/bookingStatus', '/guests', '/service-bookings', '/users', '/invoices', '/chat'].includes(item.key)
    );
  } else {
    // User thường chỉ xem Dashboard
    return allMenuItems.filter(item => item.key === '/');
  }
};

const Defaultlayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // WebSocket connection và notifications
  const { isConnected, notifications, clearNotifications } = useWebSocket();
  const [shownNotificationIds, setShownNotificationIds] = useState<Set<string>>(new Set());
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load unread count từ API
  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, []);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'staff')) {
      loadUnreadCount();
      // Refresh mỗi 30 giây
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user, loadUnreadCount]);

  // Refresh unread count khi có WebSocket notification mới
  useEffect(() => {
    if (notifications.length > 0) {
      loadUnreadCount();
    }
  }, [notifications.length, loadUnreadCount]);

  const handleNotificationShown = useCallback((notificationId: string) => {
    setShownNotificationIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(notificationId);
      return newSet;
    });
  }, []);

  // Lọc notifications chưa được hiển thị
  const unshownNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      const isGroupBooking = !!notif.groupBooking;
      const isPaymentNotification = notif.type === 'group_booking_payment';
      
      // Tạo notification ID duy nhất dựa trên loại notification
      let notificationId: string;
      if (isPaymentNotification && notif.groupBooking) {
        notificationId = `payment-group-${notif.groupBooking?._id}-${notif.timestamp}`;
      } else if (isGroupBooking) {
        notificationId = `group-${notif.groupBooking?._id}-${notif.timestamp}`;
      } else {
        notificationId = `${notif.booking?._id}-${notif.timestamp}`;
      }
      return !shownNotificationIds.has(notificationId);
    });
  }, [notifications, shownNotificationIds]);

  const handleNotificationCenterRefresh = useCallback(() => {
    // Refresh unread count khi có thay đổi
    loadUnreadCount();
  }, [loadUnreadCount]);

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key);
  };

  // Get menu items based on user role
  const menuItems = useMemo(() => {
    return getMenuItemsByRole(user?.role || 'user');
  }, [user?.role]);

  const currentPageTitle = useMemo(() => {
    const currentItem = menuItems.find(item => item.key === location.pathname);
    return currentItem?.label || 'Dashboard';
  }, [location.pathname, menuItems]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div 
          className="demo-logo-vertical" 
          style={{ 
            height: collapsed ? 32 : 'auto', 
            margin: 16, 
            background: 'rgba(255, 255, 255, 0.2)',
            padding: collapsed ? '8px' : '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: '6px'
          }}
        >
          {collapsed ? (
            <UserOutlined style={{ color: 'white', fontSize: '16px' }} />
          ) : (
            <div style={{ color: 'white', textAlign: 'center', width: '100%' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                {user?.fullName || 'Admin'}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>
                {user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'staff' ? 'Nhân viên' : 'Người dùng'}
              </div>
            </div>
          )}
        </div>
        
        <Menu 
          theme="dark" 
          selectedKeys={[location.pathname]} 
          mode="inline" 
          items={menuItems} 
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer, paddingLeft: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: 'rgba(0, 0, 0, 0.88)', margin: 0, lineHeight: '64px', fontWeight: 600 }}>
            {currentPageTitle}
          </h2>
          <Space style={{ paddingRight: 16 }}>
            {/* WebSocket connection status */}
            <Badge 
              status={isConnected ? 'success' : 'error'} 
              text={isConnected ? 'Đã kết nối' : 'Mất kết nối'}
              style={{ color: 'rgba(0, 0, 0, 0.88)' }}
            />
            {/* Notification Center Button */}
            <Badge count={unreadCount} size="small" offset={[-5, 5]}>
              <Button
                type="text"
                icon={<BellOutlined />}
                onClick={() => setNotificationCenterOpen(true)}
                style={{ color: 'rgba(0, 0, 0, 0.88)' }}
              >
                Thông báo
              </Button>
            </Badge>
            <span style={{ color: 'rgba(0, 0, 0, 0.88)' }}>
              Xin chào, {user?.fullName}
            </span>
            <Button 
              type="primary" 
              danger 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 'calc(100vh - 160px)',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        {/* Booking Notification Component */}
        <BookingNotification
          notifications={unshownNotifications}
          onNotificationShown={handleNotificationShown}
        />
        {/* Notification Center Drawer */}
        <NotificationCenter
          open={notificationCenterOpen}
          onClose={() => setNotificationCenterOpen(false)}
          onNotificationClick={(bookingId) => {
            setNotificationCenterOpen(false);
            // Navigate sẽ được xử lý trong NotificationCenter component
          }}
          onRefresh={handleNotificationCenterRefresh}
        />
        <Footer style={{ textAlign: 'center', padding: '10px 50px' }}>
          Trang khách sạn của Miko Hotel {new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Defaultlayout;