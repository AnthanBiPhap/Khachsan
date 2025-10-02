import axios from 'axios';

// Sử dụng cổng 8080 để khớp với backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

console.log('API Base URL:', API_URL);

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Thêm interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => {
    // Nếu response có data và data có data (trường hợp API trả về {data: {...}})
    if (response.data && response.data.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    console.error('API Error:', {
      config: error.config,
      response: error.response?.data,
      status: error.response?.status,
    });
    return Promise.reject(error);
  }
);

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: 'customer' | 'staff' | 'admin';
  phoneNumber?: string;
  status?: 'active' | 'blocked';
  preferences?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User | null;
  token: string;
  refreshToken: string;
}

const authService = {
  // Đăng ký
  register: async (userData: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
  }): Promise<void> => {
    try {
      await api.post('/users', userData);
    } catch (error: any) {
      console.error('Registration error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  // Đăng nhập
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      console.log('Gọi API đăng nhập:', `${api.defaults.baseURL}/auth/login`);
      
      // Gọi API đăng nhập
      const response = await api.post('/auth/login', { 
        email, 
        password 
      });
      
      // Lưu token vào localStorage
      if (response.data.accessToken) {
        // Lấy thông tin user
        const userResponse = await api.get('/auth/get-profile', {
          headers: {
            'Authorization': `Bearer ${response.data.accessToken}`
          }
        });
        
        // Lưu thông tin user vào localStorage
        if (userResponse.data) {
          localStorage.setItem('user', JSON.stringify(userResponse.data));
          localStorage.setItem('token', response.data.accessToken);
          
          // Thêm token vào header mặc định
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
        }
        
        return {
          user: userResponse.data,
          token: response.data.accessToken,
          refreshToken: response.data.refreshToken
        };
      }
      
      throw new Error('Đăng nhập thất bại');
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  // Lấy thông tin người dùng hiện tại
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      // Thêm token vào header nếu chưa có
      if (!api.defaults.headers.common['Authorization']) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      const response = await api.get('/auth/get-profile');
      return response.data;
    } catch (error: any) {
      console.error('Lỗi khi lấy thông tin người dùng:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      // Xóa token nếu không hợp lệ
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
      }
      return null;
    }
  },

  // Đăng xuất
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Lấy token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Lấy thông tin user từ localStorage
  getUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export default authService;
