"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Wifi, Car, Coffee, Waves, Users } from "lucide-react"

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
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Đang tải...</h2>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Phòng nổi bật</h2>
          <p className="text-xl text-muted-foreground">Những lựa chọn tốt nhất cho kỳ nghỉ của bạn</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={room.images?.[0] || `https://via.placeholder.com/300x200?text=Phòng+${encodeURIComponent(room.roomNumber)}`}
                  alt={`Phòng ${room.roomNumber}`}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://via.placeholder.com/300x200?text=Phòng+${encodeURIComponent(room.roomNumber)}`;
                  }}
                />
                <Badge className="absolute top-3 left-3 bg-blue-500 text-white">
                  Mới
                </Badge>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">Phòng {room.roomNumber}</h3>
                    <p className="text-muted-foreground text-sm">{room.typeId.name}</p>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                </div>

                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Tối đa {room.typeId.capacity} người</span>
                </div>

                {/* Amenities */}
                <div className="flex items-center gap-2 mb-4">
                  {room.amenities.slice(0, 4).map((amenity, index) => (
                    <div key={index} className="flex items-center text-muted-foreground">
                      {getAmenityIcon(amenity)}
                      <span className="text-xs ml-1">{amenity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div>
                    <div className="text-2xl font-bold text-orange-500">
                      {room.typeId.pricePerNight.toLocaleString()}₫
                    </div>
                    <div className="text-sm text-muted-foreground">/đêm</div>
                  </div>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      window.location.href = `/room-detail/${room._id}`;
                    }}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
            onClick={() => router.push('/')}
          >
            Xem tất cả phòng
          </Button>
        </div> */}
      </div>
    </section>
  )
}
