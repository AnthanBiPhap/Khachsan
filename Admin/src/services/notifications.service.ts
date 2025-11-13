import { env } from "../constanst/getEnvs";
import { useAuthStore } from "../stores/authStore";

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  bookingId?: string;
  userId?: string;
  bookingData?: {
    bookingId: string;
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
  recipients: Array<{
    userId: string;
    role: string;
    read: boolean;
    readAt?: string;
  }>;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Lấy notifications của user hiện tại
export const fetchMyNotifications = async (page = 1, limit = 20, read?: boolean) => {
  try {
    const tokens = useAuthStore.getState().tokens;
    if (!tokens?.accessToken) {
      throw new Error("No access token");
    }

    let url = `${env.API_URL}/api/v1/notifications/me?page=${page}&limit=${limit}`;
    if (read !== undefined) {
      url += `&read=${read}`;
    }

    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch notifications");
    }

    const response = await res.json();
    const { data } = response;

    return {
      data: data?.notifications || [],
      pagination: {
        page: data?.pagination?.page ?? page,
        limit: data?.pagination?.limit ?? limit,
        total: data?.pagination?.totalRecord ?? 0,
      },
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      data: [],
      pagination: { page, limit, total: 0 },
    };
  }
};

// Lấy số lượng notifications chưa đọc
export const fetchUnreadCount = async () => {
  try {
    const tokens = useAuthStore.getState().tokens;
    if (!tokens?.accessToken) {
      return 0;
    }

    const res = await fetch(`${env.API_URL}/api/v1/notifications/unread/count`, {
      headers: {
        "Authorization": `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return 0;
    }

    const response = await res.json();
    return response.data?.unreadCount || 0;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
};

// Đánh dấu notification là đã đọc
export const markAsRead = async (notificationId: string) => {
  try {
    const tokens = useAuthStore.getState().tokens;
    if (!tokens?.accessToken) {
      throw new Error("No access token");
    }

    const res = await fetch(`${env.API_URL}/api/v1/notifications/${notificationId}/read`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to mark as read");
    }

    return await res.json();
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Đánh dấu tất cả notifications là đã đọc
export const markAllAsRead = async () => {
  try {
    const tokens = useAuthStore.getState().tokens;
    if (!tokens?.accessToken) {
      throw new Error("No access token");
    }

    const res = await fetch(`${env.API_URL}/api/v1/notifications/read/all`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to mark all as read");
    }

    return await res.json();
  } catch (error) {
    console.error("Error marking all as read:", error);
    throw error;
  }
};

// Xóa notification
export const deleteNotification = async (notificationId: string) => {
  try {
    const tokens = useAuthStore.getState().tokens;
    if (!tokens?.accessToken) {
      throw new Error("No access token");
    }

    const res = await fetch(`${env.API_URL}/api/v1/notifications/${notificationId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete notification");
    }

    return await res.json();
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

