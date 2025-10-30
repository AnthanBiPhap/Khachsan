"use client";

import { Button } from "@/components/ui/button";
import { User, Menu } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export function Header() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

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
            <Link href="/group-booking" className="text-muted-foreground hover:text-foreground font-medium">
              Đặt phòng theo tour
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
