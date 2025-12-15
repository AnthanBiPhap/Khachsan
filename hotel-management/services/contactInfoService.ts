// contactInfoService.ts
import axios from "axios";

// Lấy API URL từ env, nếu không có thì dùng default
const getApiUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  // Đảm bảo không có trailing slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  return `${cleanBaseUrl}/api/v1`;
};

const API_URL = getApiUrl();
console.log('🔗 ContactInfo API URL:', API_URL);

export interface ContactInfo {
  _id?: string;
  phone: string;
  email: string;
  address: string;
  addressLink: string;
  workingHours: {
    reception: string;
    onlineSupport: string;
  };
  socialMedia: {
    facebook: string;
    zalo: string;
    instagram: string;
  };
  zaloQR: string;
  mapEmbedUrl: string;
  mapLink: string;
}

export const contactInfoService = {
  // Lấy thông tin liên hệ (public - không cần auth)
  async getContactInfo(): Promise<ContactInfo> {
    try {
      const url = `${API_URL}/contact-info`;
      console.log('🌐 Fetching from:', url);
      
      // Thêm timestamp để tránh cache
      const response = await axios.get(url, {
        params: {
          _t: Date.now() // Thêm timestamp để bypass cache
        },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        timeout: 10000 // 10 seconds timeout
      });
      
      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response data:', response.data);
      console.log('📞 Phone from API:', response.data?.data?.phone);
      
      if (!response.data) {
        throw new Error('API returned empty response');
      }
      
      if (!response.data.data) {
        throw new Error('Invalid API response format - missing data field');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error fetching contact info:', error);
      
      if (error.code === 'ECONNABORTED') {
        console.error('⏱️ Request timeout');
        throw new Error('Kết nối timeout. Vui lòng kiểm tra server có đang chạy không.');
      }
      
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        console.error('🔌 Connection refused - Server might be down');
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không (http://localhost:8080).');
      }
      
      if (error.response) {
        console.error('📋 Error response status:', error.response.status);
        console.error('📋 Error response data:', error.response.data);
        throw new Error(
          error.response?.data?.message || `Lỗi server (${error.response.status}). Vui lòng thử lại sau.`
        );
      }
      
      throw new Error(
        error.message || "Không thể tải thông tin liên hệ. Vui lòng thử lại sau."
      );
    }
  },
};

