'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_URL = `${API_ORIGIN.replace(/\/$/, '')}/api/v1`;

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Đang xác nhận email...');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token xác nhận không hợp lệ. Vui lòng kiểm tra lại link trong email.');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/auth/verify-email`, {
          params: { token }
        });

        // Backend trả về { statusCode: 200, message: "...", data: {...} }
        const responseData = response.data?.data || response.data;
        
        if (response.status === 200 && responseData) {
          setStatus('success');
          setMessage(responseData?.message || response.data?.message || 'Email đã được xác nhận thành công! Bạn có thể đăng nhập ngay bây giờ.');
        } else {
          setStatus('error');
          setMessage(response.data?.message || 'Xác nhận email thất bại. Vui lòng thử lại.');
        }
      } catch (error: any) {
        console.error('Verify email error:', error);
        setStatus('error');
        setMessage(
          error.response?.data?.message || 
          'Token xác nhận không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại email xác nhận.'
        );
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Token xác nhận không hợp lệ. Vui lòng kiểm tra lại link trong email.');
    }
  }, [token]);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Đang xác nhận...
              </h1>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto h-20 w-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-green-600 mb-4">
                Xác nhận thành công!
              </h1>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto h-20 w-20 bg-red-500 rounded-full flex items-center justify-center mb-6">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                Xác nhận thất bại
              </h1>
            </>
          )}

          <p className={`text-gray-600 mb-6 ${status === 'error' ? 'text-red-600' : ''}`}>
            {message}
          </p>

          {status === 'success' && (
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/auth/login')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Đăng nhập ngay
              </Button>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Về trang chủ
                </Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/auth/login')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Đến trang đăng nhập
              </Button>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Về trang chủ
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Đang tải...</h1>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

