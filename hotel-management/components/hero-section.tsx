"use client"

import { Button } from "@/components/ui/button"
import { Star, MapPin, Wifi, Utensils, WashingMachine, Dumbbell, ParkingCircle, Users } from "lucide-react"

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <div className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
              Chào mừng đến với Miko Hotel
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Trải Nghiệm Nghỉ Dưỡng Đẳng Cấp Tại Miko Hotel
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Khách sạn Miko - Điểm đến lý tưởng cho kỳ nghỉ hoàn hảo với dịch vụ đẳng cấp, 
              tiện nghi hiện đại và không gian sang trọng ngay trung tâm thành phố.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center space-x-2">
                <Wifi className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Wifi tốc độ cao</span>
              </div>
              <div className="flex items-center space-x-2">
                <Utensils className="h-5 w-5 text-orange-500" />
                <span className="text-sm">Nhà hàng đa ẩm thực</span>
              </div>
              <div className="flex items-center space-x-2">
                <WashingMachine className="h-5 w-5 text-purple-600" />
                <span className="text-sm">Dịch vụ giặt ủi</span>
              </div>
              <div className="flex items-center space-x-2">
                <Dumbbell className="h-5 w-5 text-green-600" />
                <span className="text-sm">Phòng tập thể hình</span>
              </div>
              <div className="flex items-center space-x-2">
                <ParkingCircle className="h-5 w-5 text-gray-600" />
                <span className="text-sm">Bãi đỗ xe rộng rãi</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-red-500" />
                <span className="text-sm">Vị trí trung tâm</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                Đặt phòng ngay
              </Button>
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Xem thêm ảnh
              </Button>
            </div>
          </div>

          {/* Right content - Featured room */}
          <div className="relative group">
            <div className="relative overflow-hidden rounded-2xl shadow-xl bg-white">
              <img
                src="https://decoxdesign.com/upload/images/hotel-caitilin-1952m2-phong-ngu-04-decox-design.jpg "
                alt="Phòng Deluxe Hướng Biển"
                className="w-full h-[320px] object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+Q2hcdTFlYWRjIGNcdTFlYzNvIGhpbmggXHUxZTAzMW5oPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Phòng Deluxe Hướng Biển</h3>
                    <p className="text-gray-600 flex items-center mt-1">
                      <Users className="h-4 w-4 mr-1" />
                      Tối đa 3 người
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Giá mỗi đêm từ</p>
                    <p className="text-2xl font-bold text-blue-600">1,200,000₫</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Tiện ích phòng:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Wifi
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Ban công
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Máy lạnh
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Tivi màn hình phẳng
                    </span>
                  </div>
                </div>
                
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
