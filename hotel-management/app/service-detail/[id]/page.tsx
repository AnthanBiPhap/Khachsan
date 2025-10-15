"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Heart, Flower2, Clock, Clock3, Clock4, Clock5, Clock6, Clock7, Clock8, Clock9, Clock10, Clock11, Clock12 } from "lucide-react";

type ServiceStatus = 'active' | 'hidden' | 'deleted';

interface Service {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
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

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
  const { id: serviceId } = params;
  const router = useRouter();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load service
  useEffect(() => {
    if (!serviceId) return;

    const fetchService = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/services/${serviceId}`);

        if (!response.ok) {
          throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        }

        const result = await response.json();

        if (result.statusCode === 200 && result.data) {
          setService(result.data);
        } else {
          throw new Error(result.message || 'Không thể lấy thông tin dịch vụ');
        }
      } catch (err) {
        console.error('Error fetching service:', err);
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải thông tin dịch vụ');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  // Hàm xử lý lỗi khi tải ảnh
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    target.nextElementSibling?.classList.remove('hidden');
  };

  // Hàm lấy icon phù hợp cho từng loại dịch vụ
  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('gym') || name.includes('thể hình')) return <Dumbbell className="h-12 w-12 text-blue-600" />;
    if (name.includes('spa') || name.includes('massage')) return <Flower2 className="h-12 w-12 text-pink-500" />;
    if (name.includes('pool') || name.includes('bơi')) return <div className="h-12 w-12 bg-cyan-500 rounded-full flex items-center justify-center"><span className="text-white font-bold">🏊</span></div>;
    return <Heart className="h-12 w-12 text-green-500" />;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

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
    ];
    return clocks[index % clocks.length];
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-6 rounded-lg text-center">
          <h3 className="font-bold text-lg mb-2">Đã xảy ra lỗi</h3>
          <p className="mb-4">{error}</p>
          <Button
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
            onClick={() => router.back()}
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-6 rounded-lg text-center">
          <h3 className="font-bold text-lg mb-2">Không tìm thấy dịch vụ</h3>
          <p className="mb-4">Dịch vụ bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Button
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={() => router.back()}
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white shadow rounded-lg space-y-6">
      <Button onClick={() => router.back()}>← Quay lại</Button>

      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-shrink-0">
            {getServiceIcon(service.name)}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{service.name}</h1>
            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusMap[service.status].color}`}>
                {statusMap[service.status].text}
              </span>
              <span className="text-2xl font-bold text-green-600">
                {formatPrice(service.basePrice)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      {service.images && service.images.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Hình ảnh dịch vụ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {service.images.map((image, idx) => (
              <div key={idx} className="relative">
                <img
                  src={image}
                  alt={`${service.name} - Ảnh ${idx + 1}`}
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Mô tả chi tiết</h2>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {service.description}
          </p>
        </div>
      </div>

      {/* Service Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Thông tin dịch vụ</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Giá cơ bản:</span>
              <span className="text-green-600 font-semibold">
                {formatPrice(service.basePrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Trạng thái:</span>
              <Badge className={statusMap[service.status].color}>
                {statusMap[service.status].text}
              </Badge>
            </div>
          </div>
        </div>

        {/* Time Slots */}
        {service.slots.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Khung giờ phục vụ</h2>
            <div className="grid grid-cols-2 gap-2">
              {service.slots.map((slot, index) => (
                <div key={index} className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                  {getClockIcon(index)}
                  <span className="font-medium">{slot}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Timestamps */}
      {(service.createdAt || service.updatedAt) && (
        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-4">Thông tin bổ sung</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            {service.createdAt && (
              <div>
                <span className="font-medium">Ngày tạo:</span> {new Date(service.createdAt).toLocaleString('vi-VN')}
              </div>
            )}
            {service.updatedAt && (
              <div>
                <span className="font-medium">Cập nhật lần cuối:</span> {new Date(service.updatedAt).toLocaleString('vi-VN')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="border-t pt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Nếu bạn muốn đặt dịch vụ này, hãy liên hệ trực tiếp với khách sạn
        </div>
        <div className="space-x-2">
          <Button
            onClick={() => router.back()}
            variant="outline"
          >
            Quay lại danh sách
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              // Có thể thêm logic đặt dịch vụ ở đây
              alert('Chức năng đặt dịch vụ sẽ được triển khai tiếp!');
            }}
          >
            Liên hệ đặt dịch vụ
          </Button>
        </div>
      </div>
    </div>
  );
}
