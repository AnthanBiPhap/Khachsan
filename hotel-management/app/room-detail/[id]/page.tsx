"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RoomType {
  _id: string;
  name: string;
  pricePerNight: number;
  capacity: number;
  extraHourPrice?: number;
  maxExtendHours?: number;
}

interface Room {
  _id: string;
  roomNumber: string;
  typeId: RoomType;
  status: string;
  amenities: string[];
  images?: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function RoomDetailPage({ params }: { params: { id: string } }) {
  const { id: roomId } = params;
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  // Load room
  useEffect(() => {
    if (!roomId) return;
    fetch(`http://localhost:8080/api/v1/rooms/${roomId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.statusCode === 200 && data.data) {
          setRoom(data.data);
        } else {
          throw new Error(data.message || 'Không thể lấy thông tin phòng');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching room:', error);
        setLoading(false);
      });
  }, [roomId]);

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (!room)
    return <div className="p-6 text-red-500">Không tìm thấy phòng</div>;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white shadow rounded-lg space-y-6">
      <Button onClick={() => router.back()}>← Quay lại</Button>

      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Phòng {room.roomNumber} - {room.typeId.name}
        </h1>
        <p className="text-lg text-gray-600">
          {room.description || 'Không có mô tả chi tiết'}
        </p>
      </div>

      {/* Room Images */}
      {room.images && room.images.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Hình ảnh phòng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {room.images.map((image, idx) => (
              <div key={idx} className="relative">
                <img
                  src={image}
                  alt={`Phòng ${room.roomNumber} - Ảnh ${idx + 1}`}
                  className="w-full h-64 object-cover rounded-lg shadow"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+Q2hcdTFlYWRjIGNcdTFlYzNvIGhpbmggXHUxZTAzMW5oPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Room Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Thông tin phòng</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Số phòng:</span>
              <span>{room.roomNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Loại phòng:</span>
              <span>{room.typeId.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Giá/đêm:</span>
              <span className="text-green-600 font-semibold">
                {room.typeId.pricePerNight.toLocaleString()} VNĐ
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Sức chứa:</span>
              <span>{room.typeId.capacity} người</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Trạng thái:</span>
              <Badge
                variant={room.status === "available" ? "default" : "destructive"}
              >
                {room.status === "available" ? "Có sẵn" : "Đang bận"}
              </Badge>
            </div>
            {room.typeId.extraHourPrice && (
              <div className="flex justify-between">
                <span className="font-medium">Giá gia hạn/giờ:</span>
                <span>{room.typeId.extraHourPrice.toLocaleString()} VNĐ</span>
              </div>
            )}
            {room.typeId.maxExtendHours && (
              <div className="flex justify-between">
                <span className="font-medium">Giới hạn gia hạn:</span>
                <span>{room.typeId.maxExtendHours} giờ</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Tiện ích</h2>
          <div className="grid grid-cols-2 gap-2">
            {room.amenities.map((amenity, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timestamps */}
      {(room.createdAt || room.updatedAt) && (
        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-4">Thông tin bổ sung</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            {room.createdAt && (
              <div>
                <span className="font-medium">Ngày tạo:</span> {new Date(room.createdAt).toLocaleString('vi-VN')}
              </div>
            )}
            {room.updatedAt && (
              <div>
                <span className="font-medium">Cập nhật lần cuối:</span> {new Date(room.updatedAt).toLocaleString('vi-VN')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="border-t pt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Cần hỗ trợ đặt phòng? Liên hệ trực tiếp để được tư vấn miễn phí
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => {
            // Tìm và click vào chat bubble với retry logic
            const tryOpenChat = (attempts = 0) => {
              const chatBubble = document.querySelector('[data-chat-bubble]') as HTMLElement;
              if (chatBubble) {
                chatBubble.click();
                console.log('Chat bubble clicked successfully from room detail');
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
          Liên hệ đặt ngay
        </Button>
      </div>
    </div>
  );
}
