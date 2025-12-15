// contactService.ts
import axios from "axios";

// Lấy API URL từ env, nếu không có thì dùng default
const getApiUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  // Đảm bảo không có trailing slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  return `${cleanBaseUrl}/api/v1`;
};

const API_URL = getApiUrl();
console.log('🔗 Contact API URL:', API_URL);

export interface Contact {
  _id: string;
  name: string;
  contact: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormData {
  name: string;
  contact: string;
  subject: string;
  message: string;
}

export const contactService = {
  // Gửi tin nhắn liên hệ (public - không cần auth)
  async sendContact(data: ContactFormData): Promise<Contact> {
    try {
      const url = `${API_URL}/contacts`;
      console.log('📤 Sending contact message to:', url);
      console.log('📤 Data:', data);
      
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ Response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error sending contact:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error URL:', error.config?.url);
      
      if (error.response?.status === 404) {
        throw new Error('API endpoint không tồn tại. Vui lòng kiểm tra backend có đang chạy không.');
      }
      
      throw new Error(
        error.response?.data?.message || "Không thể gửi tin nhắn. Vui lòng thử lại."
      );
    }
  },
};

