"use client";

import { Button } from "@/components/ui/button";
import { User, Menu, Bell } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import notificationService from "@/services/notificationService";

export function Header() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchUnreadCount = async () => {
        try {
          const count = await notificationService.getUnreadCount();
          setUnreadCount(count);
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      };
      fetchUnreadCount();
      
      // Refresh mỗi 30 giây
      const interval = setInterval(fetchUnreadCount, 30000);
      
      // Lắng nghe event khi có notification mới
      const handleNotificationReceived = () => {
        fetchUnreadCount();
      };
      window.addEventListener('notification-received', handleNotificationReceived);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('notification-received', handleNotificationReceived);
      };
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="animate-pulse h-6 w-32 bg-gray-200 rounded"></div>
            <div className="hidden md:flex space-x-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 w-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="https://i.pinimg.com/736x/71/8f/64/718f64e051ef2e1e1390493be6f8a29b.jpg"
                alt="Miko Hotel Logo"
                className="h-12 w-12 rounded-full object-cover"
              />
              <span className="text-2xl font-bold text-blue-600">Miko Hotel</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-foreground hover:text-blue-600 font-medium border-b-2 border-blue-600 pb-1">
              Phòng & Giá
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground font-medium">
              Liên hệ
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground font-medium">
              Về chúng tôi
            </Link>
            <Link href="/my-bookings" className="text-muted-foreground hover:text-foreground font-medium">
              Đặt phòng của tôi
            </Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground font-medium">
              Địa điểm gợi ý
            </Link>
          </nav>

          {/* User actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/notifications" className="relative inline-block">
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <span className="text-sm font-medium">Xin chào, {user.fullName || user.email}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-foreground"
                >
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-foreground">
                    <User className="h-4 w-4 mr-2" />
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Đăng ký
                  </Button>
                </Link>
              </>
            )}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
