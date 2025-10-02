'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';

// Danh sách sở thích mặc định
const DEFAULT_PREFERENCES = [
  'tham quan',
  'ăn uống',
  'thể thao',
  'phim ảnh',
  'sách',
  'game',
  'du lịch',
  'thư giãn',
  'thăm bảo tàng',
  'thăm vườn quốc gia'
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    preferences: [] as string[]
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (pref: string, isChecked: boolean) => {
    setFormData(prev => {
      const newPreferences = isChecked
        ? [...prev.preferences, pref]
        : prev.preferences.filter(p => p !== pref);
      
      return {
        ...prev,
        preferences: newPreferences
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      router.push('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Đăng ký thất bại. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div className="space-y-2 pt-2">
              <Label>Sở thích của bạn</Label>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_PREFERENCES.map((pref) => (
                  <div key={pref} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`pref-${pref}`}
                      checked={formData.preferences.includes(pref)}
                      onCheckedChange={(checked: boolean) => 
                        handlePreferenceChange(pref, checked)
                      }
                    />
                    <label
                      htmlFor={`pref-${pref}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {pref.charAt(0).toUpperCase() + pref.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Chọn ít nhất 3 sở thích để chúng tôi có thể đề xuất phòng phù hợp
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
