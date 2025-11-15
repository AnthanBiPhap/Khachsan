import axios from 'axios';

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_URL = `${API_ORIGIN.replace(/\/$/, '')}/api/v1`;

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  bookingId?: string;
  userId?: string;
  bookingData?: any;
  recipients: Array<{
    userId: string;
    role: string;
    read: boolean;
    readAt?: string;
  }>;
  status: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    refundAmount?: number;
    paidAmount?: number;
  };
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    totalRecord: number;
    limit: number;
    page: number;
  };
}

class NotificationService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  // Lấy tất cả notifications của user hiện tại
  async getMyNotifications(page = 1, limit = 20, read?: boolean): Promise<NotificationResponse> {
    const params: any = { page, limit };
    if (read !== undefined) {
      params.read = read;
    }
    
    const response = await axios.get(`${API_URL}/notifications/me`, {
      ...this.getAuthHeaders(),
      params,
    });
    
    return response.data.data;
  }

  // Lấy số lượng notifications chưa đọc
  async getUnreadCount(): Promise<number> {
    const response = await axios.get(`${API_URL}/notifications/unread/count`, {
      ...this.getAuthHeaders(),
    });
    
    // Backend trả về { unreadCount: count } trong data.data
    return response.data.data?.unreadCount || response.data.data?.count || 0;
  }

  // Đánh dấu notification là đã đọc
  async markAsRead(notificationId: string): Promise<void> {
    await axios.patch(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      this.getAuthHeaders()
    );
  }

  // Đánh dấu tất cả notifications là đã đọc
  async markAllAsRead(): Promise<void> {
    await axios.patch(
      `${API_URL}/notifications/read/all`,
      {},
      this.getAuthHeaders()
    );
  }

  // Xóa notification
  async deleteNotification(notificationId: string): Promise<void> {
    await axios.delete(
      `${API_URL}/notifications/${notificationId}`,
      this.getAuthHeaders()
    );
  }

  // Xóa tất cả notifications đã đọc
  async deleteAllRead(): Promise<void> {
    await axios.delete(
      `${API_URL}/notifications/read/all`,
      this.getAuthHeaders()
    );
  }
}

export default new NotificationService();

