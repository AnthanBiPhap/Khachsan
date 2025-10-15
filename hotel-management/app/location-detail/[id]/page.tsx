"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Calendar, Clock } from "lucide-react";

type LocationType = 'tham_quan' | 'an_uong' | 'the_thao' | 'phim_anh' | 'sach' | 'game' | 'du_lich' | 'thu_gian' | 'bao_tang' | 'vuon_quoc_gia';

interface Location {
  _id: string;
  name: string;
  type: LocationType;
  description: string;
  address: string;
  images: string[];
  ratingAvg: number;
  status: 'active' | 'hidden' | 'deleted';
  createdAt?: string;
  updatedAt?: string;
}

const typeMap = {
  tham_quan: { text: 'Tham quan', color: 'bg-blue-100 text-blue-800' },
  an_uong: { text: 'Ăn uống', color: 'bg-orange-100 text-orange-800' },
  the_thao: { text: 'Thể thao', color: 'bg-green-100 text-green-800' },
  phim_anh: { text: 'Phim ảnh', color: 'bg-purple-100 text-purple-800' },
  sach: { text: 'Sách', color: 'bg-yellow-100 text-yellow-800' },
  game: { text: 'Game', color: 'bg-pink-100 text-pink-800' },
  du_lich: { text: 'Du lịch', color: 'bg-teal-100 text-teal-800' },
  thu_gian: { text: 'Thư giãn', color: 'bg-indigo-100 text-indigo-800' },
  bao_tang: { text: 'Bảo tàng', color: 'bg-gray-100 text-gray-800' },
  vuon_quoc_gia: { text: 'Vườn quốc gia', color: 'bg-emerald-100 text-emerald-800' }
};

const statusMap = {
  active: { text: 'Đang hoạt động', color: 'bg-green-100 text-green-800' },
  hidden: { text: 'Tạm ẩn', color: 'bg-yellow-100 text-yellow-800' },
  deleted: { text: 'Đã xóa', color: 'bg-red-100 text-red-800' }
};

export default function LocationDetailPage({ params }: { params: { id: string } }) {
  const { id: locationId } = params;
  const router = useRouter();

  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load location
  useEffect(() => {
    if (!locationId) return;

    const fetchLocation = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/locations/${locationId}`);

        if (!response.ok) {
          throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        }

        const result = await response.json();

        if (result.statusCode === 200 && result.data) {
          setLocation(result.data);
        } else {
          throw new Error(result.message || 'Không thể lấy thông tin địa điểm');
        }
      } catch (err) {
        console.error('Error fetching location:', err);
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải thông tin địa điểm');
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [locationId]);

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

  if (!location) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-6 rounded-lg text-center">
          <h3 className="font-bold text-lg mb-2">Không tìm thấy địa điểm</h3>
          <p className="mb-4">Địa điểm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
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
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{location.name}</h1>
            <div className="flex items-center gap-4 mb-3">
              <Badge className={typeMap[location.type].color}>
                {typeMap[location.type].text}
              </Badge>
              <Badge className={statusMap[location.status].color}>
                {statusMap[location.status].text}
              </Badge>
            </div>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{location.address}</span>
            </div>
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(location.ratingAvg) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-lg font-semibold text-gray-700">
                  {location.ratingAvg.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      {location.images && location.images.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Hình ảnh địa điểm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {location.images.map((image, idx) => (
              <div key={idx} className="relative">
                <img
                  src={image}
                  alt={`${location.name} - Ảnh ${idx + 1}`}
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
          <p className="text-gray-700 leading-relaxed">
            {location.description}
          </p>
        </div>
      </div>

      {/* Location Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Thông tin địa điểm</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Loại địa điểm:</span>
              <Badge className={typeMap[location.type].color}>
                {typeMap[location.type].text}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Địa chỉ:</span>
              <span className="text-right">{location.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Đánh giá trung bình:</span>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="font-semibold">{location.ratingAvg.toFixed(1)}/5</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Trạng thái:</span>
              <Badge className={statusMap[location.status].color}>
                {statusMap[location.status].text}
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Thông tin bổ sung</h2>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Ngày tạo: {location.createdAt ? new Date(location.createdAt).toLocaleDateString('vi-VN') : 'Không rõ'}
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Cập nhật lần cuối: {location.updatedAt ? new Date(location.updatedAt).toLocaleDateString('vi-VN') : 'Không rõ'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t pt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Khám phá thêm về địa điểm này để có trải nghiệm tốt nhất
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
              // Có thể thêm logic điều hướng đến bản đồ hoặc liên hệ
              alert('Chức năng điều hướng đến bản đồ sẽ được triển khai tiếp!');
            }}
          >
            Xem trên bản đồ
          </Button>
        </div>
      </div>
    </div>
  );
}
