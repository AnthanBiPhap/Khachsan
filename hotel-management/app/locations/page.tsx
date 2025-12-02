'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, MapPin, Camera, Compass, ArrowRight, Search, Loader2, Heart, Share2 } from 'lucide-react';
import Image from 'next/image';
import { Footer } from '@/components/footer';

interface Location {
  _id: string;
  name: string;
  type: string;
  description: string;
  address: string;
  images: string[];
  ratingAvg: number;
  status: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    filterLocations();
  }, [searchTerm, typeFilter, locations]);

  const fetchLocations = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const API_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/v1`;
      
      const response = await fetch(`${API_URL}/locations?status=active&limit=100`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result.statusCode === 200 && result.data?.locations) {
        setLocations(result.data.locations);
        setFilteredLocations(result.data.locations);
      } else {
        console.error('Unexpected API response format:', result);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLocations = () => {
    let filtered = [...locations];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (location) =>
          location.name.toLowerCase().includes(term) ||
          location.description.toLowerCase().includes(term) ||
          location.address.toLowerCase().includes(term)
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((location) => location.type === typeFilter);
    }

    setFilteredLocations(filtered);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'du_lich':
        return 'Du lịch';
      case 'dich_vu':
        return 'Dịch vụ';
      case 'an_uong':
        return 'Ăn uống';
      case 'the_thao':
        return 'Thể thao';
      case 'phim_anh':
        return 'Phim ảnh';
      case 'sach':
        return 'Sách';
      case 'game':
        return 'Game';
      case 'thu_gian':
        return 'Thư giãn';
      case 'bao_tang':
        return 'Bảo tàng';
      case 'vuon_quoc_gia':
        return 'Vườn quốc gia';
      case 'tham_quan':
        return 'Tham quan';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'du_lich':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'dich_vu':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'an_uong':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'the_thao':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'phim_anh':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'sach':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'game':
        return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
      case 'thu_gian':
        return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
      case 'bao_tang':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'vuon_quoc_gia':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
      case 'tham_quan':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Đang tải danh sách địa điểm...</p>
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
              <Compass className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Tất cả địa điểm</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Khám phá những địa điểm du lịch, dịch vụ và ăn uống tuyệt vời xung quanh khách sạn
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tên địa điểm, mô tả, địa chỉ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Loại địa điểm
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full h-11 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">Tất cả loại</option>
                  <option value="du_lich">Du lịch</option>
                  <option value="tham_quan">Tham quan</option>
                  <option value="an_uong">Ăn uống</option>
                  <option value="dich_vu">Dịch vụ</option>
                  <option value="the_thao">Thể thao</option>
                  <option value="phim_anh">Phim ảnh</option>
                  <option value="sach">Sách</option>
                  <option value="game">Game</option>
                  <option value="thu_gian">Thư giãn</option>
                  <option value="bao_tang">Bảo tàng</option>
                  <option value="vuon_quoc_gia">Vườn quốc gia</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Tìm thấy <span className="font-bold text-blue-600 text-base">{filteredLocations.length}</span> địa điểm
              </div>
              {(typeFilter !== 'all' || searchTerm) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTypeFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-gray-600 hover:bg-gray-50 border-gray-300"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>

          {/* Locations Grid */}
          {filteredLocations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <div className="max-w-md mx-auto">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Không tìm thấy địa điểm
                </h3>
                <p className="text-gray-600 mb-6">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <Button
                  onClick={() => {
                    setTypeFilter('all');
                    setSearchTerm('');
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredLocations.map((location) => (
                <Card
                  key={location._id}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 shadow-lg group"
                >
                  <div className="relative h-56 overflow-hidden">
                    {location.images && location.images.length > 0 ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={location.images[0]}
                          alt={location.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(location.name)}`;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                        <Camera className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 left-4">
                      <Badge className={`${getTypeColor(location.type)} border-0 shadow-lg backdrop-blur-sm`}>
                        {getTypeLabel(location.type)}
                      </Badge>
                    </div>
                    {location.ratingAvg && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold text-gray-700">{location.ratingAvg}</span>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2">
                      {location.name}
                    </h3>

                    <div className="flex items-start gap-2 mb-4">
                      <MapPin className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 line-clamp-1 font-medium">
                        {location.address}
                      </p>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-3 mb-6 leading-relaxed">
                      {location.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            location.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        ></div>
                        <span className="text-xs font-medium text-gray-600">
                          {location.status === 'active' ? 'Đang hoạt động' : 'Tạm đóng'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 px-3 py-1.5 h-auto font-medium rounded-full"
                          onClick={() => router.push(`/location-detail/${location._id}`)}
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          Xem
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 h-auto font-medium rounded-full"
                          onClick={() => router.push(`/location-detail/${location._id}`)}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
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

