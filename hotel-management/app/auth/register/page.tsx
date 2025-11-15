'use client';

import { useState, useEffect } from 'react';
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

  // Cố định body để không có scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

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
      // Hiển thị thông báo thành công và yêu cầu xác nhận email
      setError('');
      // Redirect đến trang thông báo xác nhận email
      router.push('/auth/verify-email-pending');
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Đăng ký thất bại. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-3" style={{ overflow: 'hidden' }}>
      <div className="max-w-6xl w-full h-full max-h-screen grid md:grid-cols-2 gap-4 items-center" style={{ overflow: 'hidden' }}>
        {/* Left side - Header */}
        <div className="hidden md:flex flex-col justify-center text-center space-y-4">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tạo tài khoản mới
          </h2>
          <p className="text-sm text-gray-600">
            Tham gia cùng chúng tôi và khám phá những trải nghiệm tuyệt vời
          </p>
          <p className="text-xs text-gray-600">
            Đã có tài khoản?{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        {/* Right side - Form */}
        <div className="flex flex-col h-full justify-center">
          {/* Mobile header */}
          <div className="md:hidden text-center pb-2 mb-2 flex-shrink-0">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tạo tài khoản mới
            </h2>
            <p className="mt-1 text-xs text-gray-600">
              Đã có tài khoản?{' '}
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Đăng nhập ngay
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm animate-in slide-in-from-top-2 duration-300 mb-3 flex-shrink-0">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-red-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2">
                  <h3 className="text-xs font-semibold text-red-800 mb-0.5">Đăng ký thất bại</h3>
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-xl p-4 md:p-6 border border-gray-100">
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Left column - Basic information */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-gray-800 mb-2 pb-2 border-b border-gray-200">Thông tin cá nhân</h3>
                
                <div>
                  <Label htmlFor="fullName" className="text-xs font-semibold text-gray-700">Họ và tên</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="mt-1 h-9 text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-xs font-semibold text-gray-700">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 h-9 text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    placeholder="Nhập email"
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber" className="text-xs font-semibold text-gray-700">Số điện thoại</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="mt-1 h-9 text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-xs font-semibold text-gray-700">Mật khẩu</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 h-9 text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-700">Xác nhận mật khẩu</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 h-9 text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    placeholder="Nhập lại mật khẩu"
                  />
                </div>
              </div>

              {/* Right column - Preferences */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-gray-800 mb-2 pb-2 border-b border-gray-200">Sở thích của bạn</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  {DEFAULT_PREFERENCES.map((pref) => (
                    <div key={pref} className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                      <Checkbox 
                        id={`pref-${pref}`}
                        checked={formData.preferences.includes(pref)}
                        onCheckedChange={(checked: boolean) => 
                          handlePreferenceChange(pref, checked)
                        }
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4"
                      />
                      <label
                        htmlFor={`pref-${pref}`}
                        className="text-xs font-medium text-gray-700 cursor-pointer flex-1"
                      >
                        {pref.charAt(0).toUpperCase() + pref.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded-lg">
                  Chọn ít nhất 3 sở thích để chúng tôi có thể đề xuất phòng phù hợp
                </p>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center items-center py-3 px-6 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Đang tạo tài khoản...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Đăng ký</span>
                  </div>
                )}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}
