"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useRoomSearch } from "@/hooks/useRoomSearch";
import {
  Calendar,
  Users,
  Bed,
  MapPin,
  Wifi,
  Tv,
  Coffee,
  WashingMachine,
  Utensils,
  Dumbbell,
  ParkingCircle,
  Snowflake,
  Phone,
  MessageCircle,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function RoomSearch() {
  const router = useRouter();
  const {
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
    availableRooms,
    loading,
    error,
    searchRooms,
  } = useRoomSearch();

  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    searchRooms();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto mt-8 relative z-10">
      <h2 className="text-2xl font-bold text-center mb-6">Tìm kiếm phòng</h2>
      
      {/* Liên hệ đặt phòng ngay */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Cần hỗ trợ đặt phòng?</h3>
              <p className="text-sm text-gray-600">Liên hệ trực tiếp để được tư vấn miễn phí</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => window.open('tel:1900123456')}
            >
              <Phone className="h-4 w-4 mr-2" />
              Gọi ngay
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                // Tìm và click vào chat bubble với retry logic
                const tryOpenChat = (attempts = 0) => {
                  const chatBubble = document.querySelector('[data-chat-bubble]') as HTMLElement;
                  if (chatBubble) {
                    chatBubble.click();
                    console.log('Chat bubble clicked successfully');
                  } else if (attempts < 3) {
                    // Retry sau 500ms nếu không tìm thấy
                    setTimeout(() => tryOpenChat(attempts + 1), 500);
                  } else {
                    // Fallback: tìm button chat khác
                    const chatButton = document.querySelector('button[class*="chat"], [class*="chat-bubble"]') as HTMLElement;
                    if (chatButton) {
                      chatButton.click();
                    } else {
                      // Nếu không tìm thấy, thông báo cho user
                      alert('Chat đang được khởi tạo, vui lòng thử lại sau vài giây...');
                    }
                  }
                };
                
                tryOpenChat();
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat ngay
            </Button>
          </div>
        </div>
        <div className="mt-3 flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          <span>Hỗ trợ 24/7 - Phản hồi trong 5 phút</span>
        </div>
      </div>
      
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Ngày nhận phòng
            </label>
            <Input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Ngày trả phòng
            </label>
            <Input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || new Date().toISOString().split("T")[0]}
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Số khách
            </label>
            <Select
              value={guests.toString()}
              onValueChange={(value) => setGuests(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn số khách" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 khách</SelectItem>
                <SelectItem value="2">2 khách</SelectItem>
                <SelectItem value="3">3 khách</SelectItem>
                <SelectItem value="4">4 khách</SelectItem>
                <SelectItem value="5">5+ khách</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Đang tìm..." : "Tìm kiếm"}
            </Button>
          </div>
        </div>
        {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
      </form>
      
      <div className="mt-4 text-center">
        <Link href="/group-booking">
          <Button
            variant="outline"
            className="w-full md:w-auto border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          >
            Hoặc đặt phòng theo tour
          </Button>
        </Link>
      </div>

      {availableRooms.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Các phòng có sẵn:</h3>
          <div className="space-y-4">
            {availableRooms
              .filter((room) => room.typeId.capacity >= guests) // lọc theo số khách
              .sort((a, b) => {
                // ưu tiên capacity = guests trước
                const aDiff = Math.abs(a.typeId.capacity - guests);
                const bDiff = Math.abs(b.typeId.capacity - guests);
                if (aDiff !== bDiff) return aDiff - bDiff;
                // nếu cùng độ chênh lệch capacity thì giá giảm dần
                return b.typeId.pricePerNight - a.typeId.pricePerNight;
              })
              .map((room) => (
                <div key={room._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-transform hover:-translate-y-1">
                  <div className="flex flex-col md:flex-row">
                    {/* Room Image */}
                    <div className="w-full md:w-1/3 h-48 bg-gray-100 relative">
                      {room.images?.[0] ? (
                        <img
                          src={room.images[0]?.startsWith?.('http') ? room.images[0] : `${process.env.NEXT_PUBLIC_API_URL || ''}${room.images[0] || ''}`}
                          alt={`Phòng ${room.roomNumber}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+Q2hcdTFlYWRjIGNcdTFlYzNvIGhpbmggXHUxZTAzMW5oPC90ZXh0Pjwvc3ZnPg==';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span>Chưa có hình ảnh</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Room Info */}
                    <div className="p-4 flex-1">
                      <div className="flex flex-col h-full">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">
                            Phòng {room.roomNumber} - {room.typeId.name}
                          </h4>
                          <div className="mt-2">
                            <div className="flex items-center text-gray-600 mb-2">
                              <Users className="w-4 h-4 mr-1" />
                              <span className="text-sm">Sức chứa: {room.typeId.capacity} người</span>
                            </div>
                            <p className="text-gray-800 font-medium text-lg mb-3">
                              {room.typeId.pricePerNight.toLocaleString()} VNĐ
                              <span className="text-sm text-gray-500 font-normal">/đêm</span>
                            </p>
                            <div>
                              <span className="text-sm font-medium">Tiện ích:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {room.amenities?.slice(0, 4).map(
                                  (amenity: string, index: number) => (
                                    <span
                                      key={index}
                                      className="bg-gray-100 px-2 py-1 rounded text-xs"
                                    >
                                      {amenity}
                                    </span>
                                  )
                                )}
                                {room.amenities && room.amenities.length > 4 && (
                                  <span className="text-xs text-gray-500">+{room.amenities.length - 4} khác</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <Button
                            onClick={() =>
                              router.push(
                                `/room-detail/${room._id}` 
                              )
                            }
                            variant="outline"
                            className="whitespace-nowrap"
                          >
                            Chi tiết phòng
                          </Button>
                          <Button
                            onClick={() =>
                              router.push(
                                `/rooms/${room._id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}` 
                              )
                            }
                            className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                          >
                            Đặt ngay
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {hasSearched && availableRooms.length === 0 && !loading && (
        <div className="mt-8 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Đã hết phòng trong khoảng thời gian này</h3>
            <p className="text-yellow-700">Vui lòng chọn ngày khác hoặc liên hệ chúng tôi để được hỗ trợ.</p>
          </div>
        </div>
      )}
    </div>
  );
}
