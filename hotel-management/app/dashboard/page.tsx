'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Star, Heart } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

type Location = {
  _id: string;
  name: string;
  type: string;
  description: string;
  address: string;
  images: string[];
  ratingAvg: number;
};

export default function DashboardPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // nếu useAuth chưa load user (undefined), thì không fetch vội
    if (user === undefined) return;

    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Bạn cần đăng nhập để xem địa điểm gợi ý");
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:8080/api/v1/locations", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Không thể tải danh sách địa điểm");

        const data = await res.json();
        let allLocations = data.data?.locations || data.locations || [];

        // Lọc theo sở thích user
        if (user?.preferences && user.preferences.length > 0) {
          // Map từ tiếng Việt sang dạng enum trong location model
          const preferenceMap: { [key: string]: string } = {
            'tham quan': 'tham_quan',
            'ăn uống': 'an_uong',
            'thể thao': 'the_thao',
            'phim ảnh': 'phim_anh',
            'sách': 'sach',
            'game': 'game',
            'du lịch': 'du_lich',
            'thư giãn': 'thu_gian',
            'thăm bảo tàng': 'bao_tang',
            'thăm vườn quốc gia': 'vuon_quoc_gia'
          };

          const userTypes = (user as any).preferences.map((pref: string) => preferenceMap[pref]).filter(Boolean);
          allLocations = allLocations.filter((loc: Location) =>
            userTypes.includes(loc.type)
          );
        }

        setLocations(allLocations);
      } catch (err) {
        console.error("Error:", err);
        setError("Đã xảy ra lỗi khi tải dữ liệu địa điểm");
      } finally {
        setLoading(false);
      }
    };

    // Chỉ fetch khi user đã được load (không phải undefined)
    if (user !== undefined) {
      fetchLocations();
    }
  }, [user]);

  // 👇 nếu user đang load thì hiển thị Skeleton
  if (user === undefined || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Đang tải thông tin người dùng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }
  // render danh sách gợi ý
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Địa điểm gợi ý cho bạn
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Dựa trên sở thích của bạn:{" "}
            <span className="font-semibold text-indigo-600">
              {user?.preferences?.join(", ") || "Chưa có sở thích nào được chọn"}
            </span>
          </p>

          {user?.preferences && user.preferences.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {user.preferences.map((pref) => (
                <span
                  key={pref}
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200 shadow-sm"
                >
                  <Heart className="h-4 w-4 mr-2 text-indigo-600" />
                  {pref.charAt(0).toUpperCase() + pref.slice(1)}
                </span>
              ))}
            </div>
          )}
        </div>

        {locations.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <MapPin className="h-20 w-20 mx-auto text-indigo-400 mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Chưa có địa điểm phù hợp
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Chúng tôi sẽ cập nhật thêm địa điểm mới phù hợp với sở thích của bạn.
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Khám phá tất cả địa điểm
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Tìm thấy {locations.length} địa điểm phù hợp
              </h2>
              <p className="text-gray-600">
                Dựa trên sở thích của bạn, đây là những địa điểm chúng tôi gợi ý
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {locations.map((location) => (
                <Card
                  key={location._id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 shadow-lg"
                >
                  <div className="relative h-56 w-full">
                    <Image
                      src={location.images[0] || "/placeholder-location.jpg"}
                      alt={location.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/95 text-gray-800 shadow-sm border">
                        {location.type}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="flex items-center bg-white/95 rounded-full px-3 py-1 shadow-sm">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-sm font-medium text-gray-800">
                          {location.ratingAvg.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-semibold text-gray-900 line-clamp-1">
                      {location.name}
                    </CardTitle>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
                      <span className="line-clamp-1">{location.address}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 line-clamp-3 leading-relaxed">
                      {location.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
