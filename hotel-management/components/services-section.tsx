"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Clock, Heart, Flower2, Clock3, Clock4, Clock5, Clock6, Clock7, Clock8, Clock9, Clock10, Clock11, Clock12 } from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

type ServiceStatus = 'active' | 'hidden' | 'deleted'

interface Service {
  _id: string
  name: string
  description: string
  basePrice: number
  slots: string[]
  images: string[]
  status: ServiceStatus
  createdAt?: string
  updatedAt?: string
}

const statusMap = {
  active: { text: 'Đang mở', color: 'bg-green-100 text-green-800' },
  hidden: { text: 'Tạm ẩn', color: 'bg-yellow-100 text-yellow-800' },
  deleted: { text: 'Đã xóa', color: 'bg-red-100 text-red-800' }
}

export function ServicesSection() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchServices = async () => {
      try {
        console.log('Bắt đầu gọi API services...');
        const response = await fetch('http://localhost:8080/api/v1/services', { 
          signal,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Dữ liệu nhận được từ API:', result);
        
        // Kiểm tra cấu trúc dữ liệu
        if (!result || !result.data || !Array.isArray(result.data.data)) {
          throw new Error('Định dạng dữ liệu không hợp lệ');
        }
        
        // Lọc và kiểm tra dữ liệu
        const validServices = result.data.data.filter((service: any) => {
          return (
            service && 
            service._id && 
            service.name && 
            service.status === 'active'
          );
        });
        
        console.log('Dịch vụ hợp lệ:', validServices);
        setServices(validServices);
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            console.log('Yêu cầu đã bị hủy');
            return;
          }
          console.error('Lỗi khi tải dịch vụ:', err);
          setError(err.message);
        } else {
          console.error('Lỗi không xác định khi tải dịch vụ');
          setError('Đã xảy ra lỗi không xác định khi tải dữ liệu');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchServices();

    // Hủy yêu cầu khi component unmount
    return () => {
      controller.abort();
      console.log('Hủy yêu cầu API services');
    };
  }, [])

  // Hàm lấy icon phù hợp cho từng loại dịch vụ
  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase()
    if (name.includes('gym') || name.includes('thể hình')) return <Dumbbell className="h-10 w-10 text-blue-600" />
    if (name.includes('spa') || name.includes('massage')) return <Flower2 className="h-10 w-10 text-pink-500" />
    return <Heart className="h-10 w-10 text-green-500" />
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const getClockIcon = (index: number) => {
    const clocks = [
      <Clock3 key="3" className="h-4 w-4" />,
      <Clock4 key="4" className="h-4 w-4" />,
      <Clock5 key="5" className="h-4 w-4" />,
      <Clock6 key="6" className="h-4 w-4" />,
      <Clock7 key="7" className="h-4 w-4" />,
      <Clock8 key="8" className="h-4 w-4" />,
      <Clock9 key="9" className="h-4 w-4" />,
      <Clock10 key="10" className="h-4 w-4" />,
      <Clock11 key="11" className="h-4 w-4" />,
      <Clock12 key="12" className="h-4 w-4" />
    ]
    return clocks[index % clocks.length]
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Dịch vụ đẳng cấp</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trải nghiệm các dịch vụ cao cấp dành riêng cho quý khách tại Miko Hotel
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[400px] rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-2xl mx-auto">
          <h3 className="font-bold text-lg mb-1">Đã xảy ra lỗi</h3>
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4 border-red-300 text-red-700 hover:bg-red-50"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-8 rounded-lg max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-2">Hiện chưa có dịch vụ nào</h3>
          <p className="mb-4">Vui lòng quay lại sau để xem các dịch vụ mới nhất của chúng tôi</p>
          <Button 
            variant="outline" 
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </Button>
        </div>
      </div>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Dịch vụ đẳng cấp</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trải nghiệm các dịch vụ cao cấp dành riêng cho quý khách tại Miko Hotel
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div 
              key={service._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
            >
              <div className="h-48 bg-gray-100 overflow-hidden relative">
                {service.images?.[0] ? (
                  <img
                    src={service.images[0]}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                    {getServiceIcon(service.name)}
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusMap[service.status].color}`}>
                    {statusMap[service.status].text}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                  <div className="text-xl font-bold text-blue-600 whitespace-nowrap ml-4">
                    {formatPrice(service.basePrice)}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                  {service.description}
                </p>
                
                {service.slots.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Khung giờ phục vụ:</h4>
                    <div className="flex flex-wrap gap-2">
                      {service.slots.slice(0, 4).map((slot, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {getClockIcon(index)}
                          <span className="ml-1">{slot}</span>
                        </span>
                      ))}
                      {service.slots.length > 4 && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          +{service.slots.length - 4} khác
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push(`/service-detail/${service._id}`)}
                  >
                    Xem chi tiết
                  </Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Đặt dịch vụ ngay
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
