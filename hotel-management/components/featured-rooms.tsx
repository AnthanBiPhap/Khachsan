"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Wifi, Car, Coffee, Waves, Users, MapPin, Calendar, ArrowRight, Phone, MessageCircle, Clock } from "lucide-react"

interface RoomType {
  _id: string;
  name: string;
  pricePerNight: number;
  extraHourPrice: number;
  maxExtendHours: number;
  capacity: number;
}

interface Room {
  _id: string;
  roomNumber: string;
  typeId: RoomType;
  status: 'available' | 'booked' | 'maintenance';
  amenities: string[];
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export function FeaturedRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/rooms");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result.statusCode === 200 && result.data?.rooms) {
        // Sort by createdAt in descending order and take first 3 available rooms
        const availableRooms = result.data.rooms
          .filter((room: Room) => room.status === "available")
          .sort((a: Room, b: Room) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 3);
        setRooms(availableRooms);
      } else {
        console.error('Unexpected API response format:', result);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  }

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi')) return <Wifi className="h-4 w-4" />;
    if (lowerAmenity.includes('parking') || lowerAmenity.includes('đỗ xe')) 
      return <Car className="h-4 w-4" />;
    if (lowerAmenity.includes('breakfast') || lowerAmenity.includes('ăn sáng')) 
      return <Coffee className="h-4 w-4" />;
    if (lowerAmenity.includes('pool') || lowerAmenity.includes('bể bơi')) 
      return <Waves className="h-4 w-4" />;
    return null;
  }

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Đang tải phòng nổi bật...</h2>
            <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6">
            <Star className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Phòng nổi bật</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Khám phá những phòng nghỉ tuyệt vời nhất với tiện nghi hiện đại và dịch vụ đẳng cấp</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room, index) => (
            <Card key={room._id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 shadow-lg group">
              <div className="relative overflow-hidden">
                <img
                  src={room.images?.[0] || `https://via.placeholder.com/300x200?text=Phòng+${encodeURIComponent(room.roomNumber)}`}
                  alt={`Phòng ${room.roomNumber}`}
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://via.placeholder.com/300x200?text=Phòng+${encodeURIComponent(room.roomNumber)}`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Badge className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-lg">
                  <Star className="h-3 w-3 mr-1" />
                  Mới
                </Badge>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-1">Phòng {room.roomNumber}</h3>
                    <p className="text-gray-600 font-medium">{room.typeId.name}</p>
                  </div>
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                    <span className="text-sm font-bold text-yellow-700">4.8</span>
                  </div>
                </div>

                <div className="flex items-center text-gray-600 mb-4">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  <span className="font-medium">Tối đa {room.typeId.capacity} người</span>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {room.amenities.slice(0, 4).map((amenity, index) => (
                    <div key={index} className="flex items-center bg-gray-50 px-3 py-2 rounded-full">
                      <div className="text-blue-500 mr-2">
                        {getAmenityIcon(amenity)}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-3xl font-bold text-orange-500 mb-1">
                      {room.typeId.pricePerNight.toLocaleString()}₫
                    </div>
                    <div className="text-sm text-gray-500 font-medium">/đêm</div>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    onClick={() => {
                      window.location.href = `/room-detail/${room._id}`;
                    }}
                  >
                    <span>Xem chi tiết</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Tìm thấy phòng phù hợp?</h3>
              <p className="text-blue-100 mb-6">Khám phá thêm nhiều lựa chọn phòng nghỉ tuyệt vời khác</p>
              <Button
                variant="outline"
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 border-white font-medium px-8 py-3 rounded-full"
                onClick={() => router.push('/rooms')}
              >
                <MapPin className="h-5 w-5 mr-2" />
                Xem tất cả phòng
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        
      </div>
    </section>
  )
}
