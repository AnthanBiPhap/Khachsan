'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import notificationService, { Notification } from '@/services/notificationService';
import { Bell, Check, CheckCheck, Trash2, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const read = filter === 'all' ? undefined : filter === 'read';
      const response = await notificationService.getMyNotifications(page, 20, read);
      setNotifications(response.notifications);
      setTotalPages(Math.ceil(response.pagination.totalRecord / response.pagination.limit));
      
      // Lấy unread count
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, page, filter]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      await notificationService.deleteAllRead();
      await fetchNotifications();
    } catch (error) {
      console.error('Error deleting all read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_paid':
        return '✅';
      case 'booking_cancelled':
        return '❌';
      case 'booking_refunded':
        return '💰';
      case 'group_booking_approved':
        return '✅';
      case 'group_booking_quoted':
        return '💰';
      default:
        return '📢';
    }
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
      case 'group_booking_paid':
        return 'border-l-green-500';
      case 'group_booking_confirmed':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const getRecipientStatus = (notification: Notification) => {
    if (!user) return { read: false };
    const recipient = notification.recipients.find(
      (r) => r.userId === user._id
    );
    return recipient || { read: false };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Bell className="h-8 w-8 mr-3 text-primary" />
                Thông báo
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Bạn có <span className="font-semibold text-primary">{unreadCount}</span> thông báo chưa đọc
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  variant="outline"
                  size="sm"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
              {notifications.some((n) => getRecipientStatus(n).read) && (
                <Button
                  onClick={handleDeleteAllRead}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa đã đọc
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            onClick={() => setFilter('all')}
            size="sm"
            className={filter === 'all' ? 'bg-primary text-white hover:bg-primary/90' : ''}
          >
            Tất cả
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'ghost'}
            onClick={() => setFilter('unread')}
            size="sm"
            className={filter === 'unread' ? 'bg-primary text-white hover:bg-primary/90' : ''}
          >
            Chưa đọc
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </Button>
          <Button
            variant={filter === 'read' ? 'default' : 'ghost'}
            onClick={() => setFilter('read')}
            size="sm"
            className={filter === 'read' ? 'bg-primary text-white hover:bg-primary/90' : ''}
          >
            Đã đọc
          </Button>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <Bell className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg font-medium">
              {filter === 'unread' 
                ? 'Không có thông báo chưa đọc' 
                : filter === 'read'
                ? 'Không có thông báo đã đọc'
                : 'Chưa có thông báo nào'}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Các thông báo mới sẽ xuất hiện ở đây
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const recipientStatus = getRecipientStatus(notification);
              const isRead = recipientStatus.read;
              
              return (
                <div
                  key={notification._id}
                  className={`bg-white rounded-xl shadow-md border-l-4 transition-all hover:shadow-lg ${
                    !isRead 
                      ? `${getNotificationColor(notification.type)} shadow-lg ring-2 ring-primary/20` 
                      : getNotificationColor(notification.type)
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`text-lg font-bold ${
                                !isRead ? 'text-gray-900' : 'text-gray-600'
                              }`}>
                                {notification.title}
                              </h3>
                              {!isRead && (
                                <span className="px-2.5 py-0.5 text-xs font-bold bg-primary text-white rounded-full animate-pulse">
                                  Mới
                                </span>
                              )}
                            </div>
                            <p className={`text-base leading-relaxed ${
                              !isRead ? 'text-gray-800' : 'text-gray-600'
                            }`}>
                              {notification.message}
                            </p>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-1 flex-shrink-0">
                            {!isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification._id)}
                                title="Đánh dấu đã đọc"
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(notification._id)}
                              title="Xóa"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>
                              {format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </span>
                          </div>
                          {notification.bookingId && (
                            <Link
                              href={`/my-bookings`}
                              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              Xem đặt phòng
                            </Link>
                          )}
                          {notification.metadata?.groupBookingId && (
                            <Link
                              href={`/group-booking`}
                              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              Xem đặt phòng nhóm
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Trước
            </Button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Trang {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Sau
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

