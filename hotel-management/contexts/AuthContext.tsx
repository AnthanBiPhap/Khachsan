'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';
import { User } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
    dateOfBirth?: string;
    preferences?: string[];
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
        } else {
          // Nếu không lấy được user (có thể bị block hoặc token hết hạn)
          // Xóa user và redirect về login
          setUser(null);
          const token = localStorage.getItem('token');
          if (token) {
            // Có token nhưng không lấy được user -> có thể bị block
            authService.logout();
            router.push('/auth/login');
          }
        }
      } catch (error: any) {
        console.error('Failed to load user', error);
        setUser(null);
        // Nếu lỗi 403 (blocked) hoặc 401 (unauthorized), logout và redirect
        if (error?.response?.status === 403 || error?.response?.status === 401) {
          authService.logout();
          router.push('/auth/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await authService.login(email, password);
      setUser(result.user);
      router.push('/');
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
    dateOfBirth?: string;
    preferences?: string[];
  }) => {
    try {
      setIsLoading(true);
      await authService.register(userData);
      // Không tự động đăng nhập sau khi đăng ký
      // User cần xác nhận email trước khi có thể đăng nhập
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
