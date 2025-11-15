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
    dateOfBirth: '',
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
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 overflow-hidden">
      <div className="max-w-6xl w-full h-full max-h-[95vh] grid md:grid-cols-2 gap-6 items-center">
        {/* Left side - Header */}
        <div className="hidden md:flex flex-col justify-center text-center space-y-6">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tạo tài khoản mới
          </h2>
          <p className="text-base text-gray-600">
            Tham gia cùng chúng tôi và khám phá những trải nghiệm tuyệt vời
          </p>
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        {/* Right side - Form */}
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Mobile header */}
          <div className="md:hidden text-center pb-4 mb-4 flex-shrink-0">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tạo tài khoản mới
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Đăng nhập ngay
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm animate-in slide-in-from-top-2 duration-300 mb-4 flex-shrink-0">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-red-800 mb-1">Đăng ký thất bại</h3>
                  <p className="text-sm text-red-700">{error}</p>
                  <p className="text-xs text-red-600 mt-2">
                    💡 Vui lòng kiểm tra lại thông tin và thử lại
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left column - Basic information */}
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-3 border-b border-gray-200">Thông tin cá nhân</h3>
                
                <div>
                  <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Họ và tên</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="mt-2 h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    placeholder="Nhập họ và tên của bạn"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-2 h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    placeholder="Nhập email của bạn"
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700">Số điện thoại</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="mt-2 h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-700">Ngày sinh</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="mt-2 h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    placeholder="Chọn ngày sinh"
                  />
                  <p className="text-xs text-gray-500 mt-1">Ngày sinh không bắt buộc</p>
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Mật khẩu</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-2 h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    placeholder="Nhập mật khẩu"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Xác nhận mật khẩu</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-2 h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    placeholder="Nhập lại mật khẩu"
                  />
                </div>
              </div>

              {/* Right column - Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-3 border-b border-gray-200">Sở thích của bạn</h3>
                
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {DEFAULT_PREFERENCES.map((pref) => (
                    <div key={pref} className="flex items-center space-x-3 p-2.5 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                      <Checkbox 
                        id={`pref-${pref}`}
                        checked={formData.preferences.includes(pref)}
                        onCheckedChange={(checked: boolean) => 
                          handlePreferenceChange(pref, checked)
                        }
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <label
                        htmlFor={`pref-${pref}`}
                        className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                      >
                        {pref.charAt(0).toUpperCase() + pref.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-xl">
                  💡 Chọn ít nhất 3 sở thích để chúng tôi có thể đề xuất phòng phù hợp
                </p>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Đang tạo tài khoản...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
