"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Clock, Heart, Flower2, Clock3, Clock4, Clock5, Clock6, Clock7, Clock8, Clock9, Clock10, Clock11, Clock12, Star, ArrowRight, Sparkles, Shield, Award, Phone, MessageCircle, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

type ServiceStatus = 'active' | 'hidden' | 'deleted'

interface Service {
  _id: string
  name: string
  description: string
  basePrice: number
  workingHours?: {
    startTime: string
    endTime: string
  }
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
        
        // Sắp xếp theo createdAt (mới nhất trước) và chỉ lấy 3 dịch vụ đầu tiên
        const sortedServices = validServices.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA; // Mới nhất trước
        });
        
        const latestServices = sortedServices.slice(0, 3);
        
        console.log('3 dịch vụ mới nhất:', latestServices);
        setServices(latestServices);
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

  const formatTimeSlot = (slot: string) => {
    // Nếu slot đã có format "từ X giờ đến Y giờ" thì giữ nguyên
    if (slot.includes('từ') && slot.includes('đến')) {
      return slot;
    }
    
    // Nếu slot có format "X:XX - Y:YY" hoặc "X-Y" thì convert
    if (slot.includes('-') || slot.includes('–')) {
      const parts = slot.split(/[-–]/).map(p => p.trim());
      if (parts.length === 2) {
        const startTime = parts[0].replace(/[^\d:]/g, '');
        const endTime = parts[1].replace(/[^\d:]/g, '');
        return `từ ${startTime} đến ${endTime}`;
      }
    }
    
    // Nếu slot chỉ có 1 thời gian, giả sử là thời gian bắt đầu
    if (slot.match(/\d{1,2}:\d{2}/)) {
      return `từ ${slot}`;
    }
    
    // Mặc định trả về slot gốc
    return slot;
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Đang tải dịch vụ...</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Vui lòng chờ trong giây lát để khám phá các dịch vụ tuyệt vời</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <Skeleton className="h-56 w-full" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-red-50 to-pink-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <Shield className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-red-800 mb-4">Đã xảy ra lỗi</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <Button 
              variant="outline" 
              className="border-red-300 text-red-700 hover:bg-red-50 px-6 py-3 rounded-full font-medium"
              onClick={() => window.location.reload()}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </div>
      </section>
    )
  }

  if (services.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <Sparkles className="h-10 w-10 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-blue-800 mb-4">Hiện chưa có dịch vụ nào</h3>
            <p className="text-blue-600 mb-6">Vui lòng quay lại sau để xem các dịch vụ mới nhất của chúng tôi</p>
            <Button 
              variant="outline" 
              className="border-blue-300 text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-full font-medium"
              onClick={() => window.location.reload()}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Tải lại trang
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6">
            <Award className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Dịch vụ đẳng cấp</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Trải nghiệm các dịch vụ cao cấp dành riêng cho quý khách tại Miko Hotel với tiêu chuẩn 5 sao
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={service._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 flex flex-col h-full group"
            >
              <div className="h-56 bg-gray-100 overflow-hidden relative">
                {service.images?.[0] ? (
                  <img
                    src={service.images[0]}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
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
              
              <div className="p-6 flex flex-col flex-grow">
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
                
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${service.status === "active" ? "bg-green-500" : "bg-red-500"}`}></div>
                      <span className="text-xs font-medium text-gray-600">
                        {service.status === "active" ? "Đang hoạt động" : "Tạm đóng"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-red-500 hover:bg-red-50 p-2 h-auto font-medium rounded-full"
                        onClick={() => {
                          // Thêm vào yêu thích
                          console.log('Added to favorites:', service.name);
                        }}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-blue-500 hover:bg-blue-50 p-2 h-auto font-medium rounded-full"
                        onClick={() => {
                          // Chia sẻ
                          if (navigator.share) {
                            navigator.share({
                              title: service.name,
                              text: service.description,
                              url: window.location.href
                            });
                          } else {
                            // Fallback: copy to clipboard
                            navigator.clipboard.writeText(window.location.href);
                            alert('Đã sao chép link vào clipboard!');
                          }
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-full font-medium"
                      onClick={() => router.push(`/service-detail/${service._id}`)}
                    >
                      Xem chi tiết
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Đặt ngay
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Sẵn sàng trải nghiệm?</h3>
              <p className="text-blue-100 mb-6">Đặt ngay các dịch vụ cao cấp để có những phút giây thư giãn tuyệt vời</p>
              <Button
                variant="outline"
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 border-white font-medium px-8 py-3 rounded-full"
                onClick={() => router.push('/services')}
              >
                <Award className="h-5 w-5 mr-2" />
                Xem tất cả dịch vụ
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
