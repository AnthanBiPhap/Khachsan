'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPendingPage() {
  const router = useRouter();

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Kiểm tra email của bạn
          </h1>
          
          <p className="text-gray-600 mb-6">
            Chúng tôi đã gửi một email xác nhận đến địa chỉ email của bạn. 
            Vui lòng kiểm tra hộp thư và nhấp vào link xác nhận để kích hoạt tài khoản.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>💡 Lưu ý:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 text-left list-disc list-inside space-y-1">
              <li>Link xác nhận sẽ hết hạn sau 24 giờ</li>
              <li>Nếu không thấy email, vui lòng kiểm tra thư mục spam</li>
              <li>Sau khi xác nhận email, bạn có thể đăng nhập ngay</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Đến trang đăng nhập
            </Button>
            
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Về trang chủ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

