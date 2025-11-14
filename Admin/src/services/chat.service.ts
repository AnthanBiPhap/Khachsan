import axios from 'axios';
import { env } from '../constanst/getEnvs';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: `${env.API_URL}/api/v1/chat`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm token vào header
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().tokens?.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý response
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    console.error('Chat API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface Conversation {
  _id: string;
  participants: Array<{
    userId: {
      _id: string;
      fullName: string;
      email: string;
      phoneNumber?: string;
      role: string;
    };
    role: string;
    lastReadAt: string;
  }>;
  lastMessage?: Message;
  lastMessageAt: string;
  status: string;
  unreadCount: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    role: string;
  };
  content: string;
  messageType: string;
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
    size: number;
  }>;
  status: string;
  readBy: Array<{
    userId: string;
    readAt: string;
  }>;
  replyTo?: Message;
  createdAt: string;
  updatedAt: string;
}

const chatService = {
  // Lấy danh sách conversations
  getConversations: async (page: number = 1, limit: number = 20): Promise<{
    conversations: Conversation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const response = await api.get('/conversations', {
      params: { page, limit },
    });
    return response.data;
  },

  // Lấy conversation cụ thể
  getConversationById: async (id: string): Promise<Conversation> => {
    const response = await api.get(`/conversations/${id}`);
    return response.data;
  },

  // Lấy messages của conversation
  getMessages: async (
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    messages: Message[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const response = await api.get(`/conversations/${conversationId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Gửi message
  sendMessage: async (
    conversationId: string,
    content: string,
    messageType: string = 'text',
    attachments: any[] = [],
    replyTo?: string
  ): Promise<Message> => {
    const response = await api.post('/messages', {
      conversationId,
      content,
      messageType,
      attachments,
      replyTo,
    });
    return response.data;
  },

  // Tạo conversation mới và gửi message đầu tiên
  startConversation: async (
    otherUserId: string,
    content: string,
    messageType: string = 'text'
  ): Promise<{
    conversation: Conversation;
    message: Message;
  }> => {
    const response = await api.post('/conversations/start', {
      otherUserId,
      content,
      messageType,
    });
    return response.data;
  },

  // Xóa message
  deleteMessage: async (messageId: string): Promise<Message> => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  // Đánh dấu messages đã đọc
  markMessagesAsRead: async (conversationId: string): Promise<void> => {
    await api.post(`/conversations/${conversationId}/read`);
  },

  // Lấy số lượng unread messages
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/messages/unread-count');
    return response.data.unreadCount || 0;
  },
};

export default chatService;

