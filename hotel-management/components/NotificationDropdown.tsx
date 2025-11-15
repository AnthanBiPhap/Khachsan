'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import notificationService, { Notification } from '@/services/notificationService';
import { Bell, Check, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';

interface NotificationDropdownProps {
  unreadCount: number;
  onCountChange?: (count: number) => void;
}

export default function NotificationDropdown({ unreadCount, onCountChange }: NotificationDropdownProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Fetch notifications khi mở dropdown
  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  // Lắng nghe notification mới
  useEffect(() => {
    const handleNotificationReceived = () => {
      if (isOpen) {
        fetchNotifications();
      }
    };
    window.addEventListener('notification-received', handleNotificationReceived);
    return () => window.removeEventListener('notification-received', handleNotificationReceived);
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getMyNotifications(1, 5, false); // Chỉ lấy 5 thông báo chưa đọc
      setNotifications(response.notifications);
      
      // Cập nhật unread count
      const count = await notificationService.getUnreadCount();
      if (onCountChange) {
        onCountChange(count);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getRecipientStatus = (notification: Notification) => {
    if (!user) return { read: false };
    const recipient = notification.recipients.find(
      (r) => r.userId === user._id
    );
    return recipient || { read: false };
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking_paid':
        return 'border-l-green-500';
      case 'booking_cancelled':
        return 'border-l-red-500';
      case 'booking_refunded':
        return 'border-l-blue-500';
      case 'group_booking_approved':
        return 'border-l-green-500';
      case 'group_booking_quoted':
        return 'border-l-purple-500';
      default:
        return 'border-l-gray-300';
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-900">Thông báo</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="text-sm text-gray-600">
                  {unreadCount} chưa đọc
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Không có thông báo mới</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const recipientStatus = getRecipientStatus(notification);
                  const isRead = recipientStatus.read;
                  
                  return (
                    <div
                      key={notification._id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
                        !isRead ? getNotificationColor(notification.type) : 'border-l-transparent'
                      }`}
                      onClick={() => {
                        if (!isRead) {
                          handleMarkAsRead(notification._id, {} as React.MouseEvent);
                        }
                        setIsOpen(false);
                        router.push('/notifications');
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-semibold ${!isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                              {notification.title}
                            </h4>
                            {!isRead && (
                              <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          <p className={`text-sm ${!isRead ? 'text-gray-800' : 'text-gray-600'} line-clamp-2`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                          </p>
                        </div>
                        {!isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleMarkAsRead(notification._id, e)}
                            className="h-6 w-6 p-0 flex-shrink-0 hover:bg-green-50"
                            title="Đánh dấu đã đọc"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200">
            <Link href="/notifications">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                Xem tất cả thông báo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

