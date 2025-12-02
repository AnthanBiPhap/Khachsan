'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Star, Wifi, Car, Coffee, Waves, Users, ArrowRight, Search, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Footer } from '@/components/footer';

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
  status: 'available' | 'booked' | 'maintenance' | 'occupied' | 'checked_in';
  amenities: string[];
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [capacityFilter, setCapacityFilter] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [searchTerm, capacityFilter, priceRange, rooms]);

  const fetchRooms = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const API_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/v1`;
      
      const response = await fetch(`${API_URL}/rooms?limit=100`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result.statusCode === 200 && result.data?.rooms) {
        setRooms(result.data.rooms);
        setFilteredRooms(result.data.rooms);
      } else {
        console.error('Unexpected API response format:', result);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRooms = () => {
    let filtered = [...rooms];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (room) =>
          room.roomNumber.toLowerCase().includes(term) ||
          room.typeId.name.toLowerCase().includes(term) ||
          room.amenities.some((amenity) => amenity.toLowerCase().includes(term))
      );
    }

    // Filter by capacity
    if (capacityFilter > 0) {
      filtered = filtered.filter((room) => room.typeId.capacity >= capacityFilter);
    }

    // Filter by price range
    if (priceRange !== 'all') {
      switch (priceRange) {
        case 'under-500k':
          filtered = filtered.filter((room) => room.typeId.pricePerNight < 500000);
          break;
        case '500k-1m':
          filtered = filtered.filter(
            (room) => room.typeId.pricePerNight >= 500000 && room.typeId.pricePerNight <= 1000000
          );
          break;
        case '1m-2m':
          filtered = filtered.filter(
            (room) => room.typeId.pricePerNight > 1000000 && room.typeId.pricePerNight <= 2000000
          );
          break;
        case '2m-3m':
          filtered = filtered.filter(
            (room) => room.typeId.pricePerNight > 2000000 && room.typeId.pricePerNight <= 3000000
          );
          break;
        case 'over-3m':
          filtered = filtered.filter((room) => room.typeId.pricePerNight > 3000000);
          break;
      }
    }

    setFilteredRooms(filtered);
  };

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
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return null; // Không hiển thị badge cho phòng còn trống
      case 'booked':
        return <Badge className="bg-blue-500 text-white">Đã đặt</Badge>;
      case 'occupied':
        return <Badge className="bg-purple-500 text-white">Đang sử dụng</Badge>;
      case 'checked_in':
        return <Badge className="bg-indigo-500 text-white">Đã check-in</Badge>;
      case 'maintenance':
        return <Badge className="bg-orange-500 text-white">Bảo trì</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Đang tải danh sách phòng...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6">
              <Star className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Tất cả phòng nghỉ</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Khám phá tất cả các phòng nghỉ với tiện nghi hiện đại và dịch vụ đẳng cấp
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Số phòng, loại phòng, tiện ích..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Capacity Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số người
                </label>
                <select
                  value={capacityFilter}
                  onChange={(e) => setCapacityFilter(Number(e.target.value))}
                  className="w-full h-11 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="0">Tất cả</option>
                  <option value="1">1 người</option>
                  <option value="2">2 người</option>
                  <option value="3">3 người</option>
                  <option value="4">4 người</option>
                  <option value="5">5 người trở lên</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Khoảng giá
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full h-11 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">Tất cả mức giá</option>
                  <option value="under-500k">Dưới 500.000 VNĐ</option>
                  <option value="500k-1m">500.000 - 1.000.000 VNĐ</option>
                  <option value="1m-2m">1.000.000 - 2.000.000 VNĐ</option>
                  <option value="2m-3m">2.000.000 - 3.000.000 VNĐ</option>
                  <option value="over-3m">Trên 3.000.000 VNĐ</option>
                </select>
              </div>
            </div>

            {/* Results and Clear Filter */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Tìm thấy <span className="font-bold text-blue-600 text-base">{filteredRooms.length}</span> phòng phù hợp
              </div>
              {(capacityFilter > 0 || priceRange !== 'all' || searchTerm) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCapacityFilter(0);
                    setPriceRange('all');
                    setSearchTerm('');
                  }}
                  className="text-gray-600 hover:bg-gray-50 border-gray-300"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>

          {/* Rooms Grid */}
          {filteredRooms.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <div className="max-w-md mx-auto">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Không tìm thấy phòng
                </h3>
                <p className="text-gray-600 mb-6">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setCapacityFilter(0);
                    setPriceRange('all');
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRooms.map((room) => (
                <Card
                  key={room._id}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 shadow-lg group"
                >
                  <div className="relative overflow-hidden">
                    <div className="relative h-56 w-full">
                      <Image
                        src={room.images?.[0] || `https://via.placeholder.com/400x300?text=Phòng+${encodeURIComponent(room.roomNumber)}`}
                        alt={`Phòng ${room.roomNumber}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/400x300?text=Phòng+${encodeURIComponent(room.roomNumber)}`;
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 left-4">
                      {getStatusBadge(room.status)}
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 mb-1">
                          Phòng {room.roomNumber}
                        </h3>
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
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-3 mb-6">
                        {room.amenities.slice(0, 4).map((amenity, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-gray-50 px-3 py-2 rounded-full"
                          >
                            <div className="text-blue-500 mr-2">
                              {getAmenityIcon(amenity)}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {amenity}
                            </span>
                          </div>
                        ))}
                        {room.amenities.length > 4 && (
                          <div className="flex items-center bg-gray-50 px-3 py-2 rounded-full">
                            <span className="text-sm font-medium text-gray-700">
                              +{room.amenities.length - 4} khác
                            </span>
                          </div>
                        )}
                      </div>
                    )}

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
                          router.push(`/room-detail/${room._id}`);
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
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}

