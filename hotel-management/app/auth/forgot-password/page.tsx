'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_URL = `${API_ORIGIN.replace(/\/$/, '')}/api/v1`;

type Step = 'email' | 'otp' | 'password';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Bước 1: Gửi email OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setMessage(response.data?.data?.message || response.data?.message || 'Đã gửi mã xác nhận đến email của bạn');
      setStep('otp');
    } catch (error: any) {
      console.error('Request OTP error:', error);
      setError(error.response?.data?.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 2: Xác nhận OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Vui lòng nhập mã xác nhận 6 số');
      return;
    }

    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
      setMessage(response.data?.data?.message || response.data?.message || 'Mã xác nhận hợp lệ');
      setStep('password');
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      setError(error.response?.data?.message || 'Mã xác nhận không hợp lệ. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 3: Đặt lại mật khẩu
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ mật khẩu mới');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        otp,
        newPassword
      });
      setMessage(response.data?.data?.message || response.data?.message || 'Mật khẩu đã được đặt lại thành công');
      
      // Redirect đến trang đăng nhập sau 2 giây
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {step === 'email' && 'Quên mật khẩu'}
            {step === 'otp' && 'Nhập mã xác nhận'}
            {step === 'password' && 'Đặt lại mật khẩu'}
          </h1>
          <p className="text-sm text-gray-600">
            {step === 'email' && 'Nhập email để nhận mã xác nhận'}
            {step === 'otp' && 'Nhập mã 6 số đã gửi đến email của bạn'}
            {step === 'password' && 'Nhập mật khẩu mới cho tài khoản'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}

        {/* Bước 1: Nhập email */}
        {step === 'email' && (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Nhập email của bạn"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
            </Button>
          </form>
        )}

        {/* Bước 2: Nhập OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <Label htmlFor="otp" className="text-sm font-semibold text-gray-700">
                Mã xác nhận (6 số)
              </Label>
              <Input
                id="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="mt-2 h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-center text-2xl font-bold tracking-widest"
                placeholder="000000"
              />
              <p className="text-xs text-gray-500 mt-2">
                Mã xác nhận đã được gửi đến <strong>{email}</strong>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('email')}
                className="flex-1"
              >
                Quay lại
              </Button>
              <Button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? 'Đang xác nhận...' : 'Xác nhận'}
              </Button>
            </div>
          </form>
        )}

        {/* Bước 3: Nhập mật khẩu mới */}
        {step === 'password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">
                Mật khẩu mới
              </Label>
              <Input
                id="newPassword"
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-2 h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Nhập mật khẩu mới"
              />
              <p className="text-xs text-gray-500 mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                Xác nhận mật khẩu
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 h-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('otp')}
                className="flex-1"
              >
                Quay lại
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

