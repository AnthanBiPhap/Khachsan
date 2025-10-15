"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Star, Heart, User } from "lucide-react";
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

export function ExploreLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [recommendedLocations, setRecommendedLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRecommended, setShowRecommended] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Lấy tất cả địa điểm
        const response = await fetch('http://localhost:8080/api/v1/locations');
        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu địa điểm');
        }
        const data = await response.json();
        setLocations(data.data.locations);

        // Nếu user đã đăng nhập và có sở thích, lấy địa điểm gợi ý
        if (user && user.preferences && user.preferences.length > 0) {
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const recommendedResponse = await fetch('http://localhost:3000/api/recommendations', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (recommendedResponse.ok) {
                const recommendedData = await recommendedResponse.json();
                setRecommendedLocations(recommendedData.locations || []);
              }
            } catch (recommendedError) {
              console.error('Error fetching recommended locations:', recommendedError);
              // Không hiển thị lỗi này vì không phải lỗi nghiêm trọng
            }
          }
        }
      } catch (err) {
        setError('Đã xảy ra lỗi khi tải dữ liệu');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <div className="flex items-center">
                <Skeleton className="h-4 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Khám phá xung quanh
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Những địa điểm tham quan hấp dẫn gần khách sạn
          </p>

          {/* Nút chuyển đổi giữa tất cả địa điểm và địa điểm gợi ý */}
          {user && user.preferences && user.preferences.length > 0 && recommendedLocations.length > 0 && (
            <div className="mt-6 flex justify-center">
              <div className="inline-flex rounded-lg bg-gray-100 p-1">
                <Button
                  variant={!showRecommended ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowRecommended(false)}
                  className="px-4 py-2"
                >
                  Tất cả địa điểm
                </Button>
                <Button
                  variant={showRecommended ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowRecommended(true)}
                  className="px-4 py-2"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Gợi ý cho bạn ({recommendedLocations.length})
                </Button>
              </div>
            </div>
          )}

          {/* Hiển thị sở thích của user nếu đã đăng nhập */}
          {user && user.preferences && user.preferences.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Sở thích của bạn:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {user.preferences.map((pref) => (
                  <span
                    key={pref}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                  >
                    {pref.charAt(0).toUpperCase() + pref.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hiển thị địa điểm gợi ý hoặc tất cả địa điểm */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(showRecommended ? recommendedLocations : locations).map((location) => (
            <Card key={location._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 w-full">
                <Image
                  src={location.images[0] || '/placeholder-location.jpg'}
                  alt={location.name}
                  fill
                  className="object-cover"
                />
                {showRecommended && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-pink-100 text-pink-800">
                      <Heart className="h-3 w-3 mr-1" />
                      Gợi ý
                    </span>
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{location.name}</CardTitle>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {location.address}
                </div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(location.ratingAvg) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-500">
                    ({location.ratingAvg.toFixed(1)})
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-3 mb-4">{location.description}</p>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push(`/location-detail/${location._id}`)}
                >
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Thông báo nếu chưa có địa điểm gợi ý */}
        {showRecommended && recommendedLocations.length === 0 && user && user.preferences && user.preferences.length > 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Heart className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có địa điểm phù hợp với sở thích của bạn
            </h3>
            <p className="text-gray-600 mb-6">
              Chúng tôi sẽ cập nhật thêm địa điểm mới phù hợp với sở thích của bạn.
            </p>
            <Button
              onClick={() => setShowRecommended(false)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Xem tất cả địa điểm
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
