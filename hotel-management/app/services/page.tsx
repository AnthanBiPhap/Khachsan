'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, Search, Award, Clock, Dumbbell, Flower2, Heart, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Footer } from '@/components/footer';

type ServiceStatus = 'active' | 'hidden' | 'deleted';

interface Service {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  workingHours?: {
    startTime: string;
    endTime: string;
  };
  slots: string[];
  images: string[];
  status: ServiceStatus;
  createdAt?: string;
  updatedAt?: string;
}

const statusMap = {
  active: { text: 'Đang mở', color: 'bg-green-100 text-green-800' },
  hidden: { text: 'Tạm ẩn', color: 'bg-yellow-100 text-yellow-800' },
  deleted: { text: 'Đã xóa', color: 'bg-red-100 text-red-800' }
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchTerm, services]);

  const fetchServices = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const API_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/v1`;
      
      const response = await fetch(`${API_URL}/services?limit=100`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result.statusCode === 200 && result.data?.data) {
        // Lọc chỉ lấy dịch vụ active
        const activeServices = result.data.data.filter((service: Service) => 
          service.status === 'active'
        );
        setServices(activeServices);
        setFilteredServices(activeServices);
      } else {
        console.error('Unexpected API response format:', result);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    if (!searchTerm) {
      setFilteredServices(services);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = services.filter(
      (service) =>
        service.name.toLowerCase().includes(term) ||
        service.description.toLowerCase().includes(term)
    );
    setFilteredServices(filtered);
  };

  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('gym') || name.includes('thể hình')) return <Dumbbell className="h-10 w-10 text-blue-600" />;
    if (name.includes('spa') || name.includes('massage')) return <Flower2 className="h-10 w-10 text-pink-500" />;
    return <Heart className="h-10 w-10 text-green-500" />;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Đang tải danh sách dịch vụ...</p>
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
              <Award className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Tất cả dịch vụ</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Khám phá các dịch vụ cao cấp với tiêu chuẩn 5 sao tại Miko Hotel
            </p>
          </div>

          {/* Search */}
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm dịch vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Tìm thấy <span className="font-bold text-blue-600 text-base">{filteredServices.length}</span> dịch vụ
            </div>
          </div>

          {/* Services Grid */}
          {filteredServices.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <div className="max-w-md mx-auto">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Không tìm thấy dịch vụ
                </h3>
                <p className="text-gray-600 mb-6">
                  Thử thay đổi từ khóa tìm kiếm
                </p>
                <Button
                  onClick={() => setSearchTerm('')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => (
                <Card
                  key={service._id}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 shadow-lg group flex flex-col h-full"
                >
                  <div className="h-56 bg-gray-100 overflow-hidden relative">
                    {service.images?.[0] ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={service.images[0]}
                          alt={service.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                        {getServiceIcon(service.name)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusMap[service.status].color} backdrop-blur-sm`}>
                        {statusMap[service.status].text}
                      </span>
                    </div>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </div>
                  </div>

                  <CardContent className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                      <div className="text-2xl font-bold text-blue-600 whitespace-nowrap ml-4">
                        {formatPrice(service.basePrice)}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-6 line-clamp-3 flex-grow leading-relaxed">
                      {service.description}
                    </p>

                    {service.workingHours && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-blue-500" />
                          Giờ hoạt động:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <Clock className="h-4 w-4 mr-1.5" />
                            <span>từ {service.workingHours.startTime} đến {service.workingHours.endTime}</span>
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
                      <Button
                        variant="outline"
                        className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-full font-medium"
                        onClick={() => router.push(`/service-detail/${service._id}`)}
                      >
                        Xem chi tiết
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        onClick={() => router.push(`/service-detail/${service._id}`)}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Đặt ngay
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

