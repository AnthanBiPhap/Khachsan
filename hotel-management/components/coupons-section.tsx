"use client";

import { useEffect, useState } from "react";
import { Tag, Sparkles, Copy, CheckCircle, Gift, Calendar, Users, Percent, DollarSign, Star, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Coupon } from "@/services/couponService";

// Lấy API URL từ env, nếu không có thì dùng default
const getApiUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  // Đảm bảo không có trailing slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  return `${cleanBaseUrl}/api/v1`;
};

const API_URL = getApiUrl();
console.log('🔗 Coupons API URL:', API_URL);

export function CouponsSection() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const url = `${API_URL}/coupons/public?limit=100`; // Lấy tất cả để đếm số lượng
        console.log('🔗 Fetching coupons from:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('📡 Response status:', response.status, response.statusText);

        if (response.ok) {
          const result = await response.json();
          console.log('📋 Coupons API full response:', JSON.stringify(result, null, 2));
          
          // Backend đã filter sẵn, chỉ cần lấy ra
          const couponsList = result.data?.coupons || [];
          console.log('📦 Coupons list:', couponsList);
          console.log('📊 Number of coupons received:', couponsList.length);
          
          if (couponsList.length > 0) {
            console.log('✅ First coupon sample:', JSON.stringify(couponsList[0], null, 2));
            couponsList.forEach((coupon: Coupon, index: number) => {
              console.log(`🎫 Coupon ${index + 1}:`, {
                code: coupon.code,
                name: coupon.name,
                status: coupon.status,
                startDate: coupon.startDate,
                endDate: coupon.endDate,
                usageLimit: coupon.usageLimit,
                usedCount: coupon.usedCount,
              });
            });
          } else {
            console.warn('⚠️ No coupons found in response');
          }
          
          setCoupons(couponsList);
        } else {
          console.error('❌ API error:', response.status, response.statusText);
          const errorData = await response.json().catch(() => ({}));
          console.error('Error data:', errorData);
          setCoupons([]);
        }
      } catch (error: any) {
        console.error("❌ Error fetching coupons:", error);
        console.error("Error details:", error.message, error.stack);
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchCoupons, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Đã sao chép mã: ${code}`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error("Không thể sao chép mã");
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-6">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Đang tải mã giảm giá...</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Vui lòng chờ trong giây lát để khám phá các ưu đãi hấp dẫn</p>
          </div>
        </div>
      </section>
    );
  }

  // Always show section, even if no coupons (for debugging)
  // if (coupons.length === 0) {
  //   return null; // Don't show section if no coupons
  // }

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-6">
            <Gift className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Mã Giảm Giá Đặc Biệt</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nhập mã khi đặt phòng để nhận ưu đãi hấp dẫn và tiết kiệm chi phí cho chuyến đi của bạn
          </p>
        </div>

        {/* Coupons Grid */}
        {coupons.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Gift className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Hiện chưa có mã giảm giá</h3>
            <p className="text-gray-600 mb-6">Chúng tôi đang chuẩn bị các ưu đãi hấp dẫn cho bạn. Vui lòng quay lại sau!</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coupons.slice(0, 3).map((coupon) => {
            const now = new Date();
            const startDate = new Date(coupon.startDate);
            const endDate = new Date(coupon.endDate);
            const isUpcoming = startDate > now;
            const isExpired = endDate < now;
            const isActive = startDate <= now && endDate >= now;
            const isExpiringSoon = !isExpired && (endDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000);

            return (
              <Card
                key={coupon._id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 shadow-lg group"
              >
                {/* Image/Header Section */}
                <div className={`relative h-36 overflow-hidden ${
                  isExpired 
                    ? 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600' 
                    : isUpcoming
                    ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500'
                    : 'bg-gradient-to-br from-purple-500 via-pink-500 to-red-500'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      {coupon.discountType === "percentage" ? (
                        <div className="text-4xl font-bold mb-2">
                          {coupon.discountValue}%
                        </div>
                      ) : (
                        <div className="text-3xl font-bold mb-2">
                          {coupon.discountValue.toLocaleString()}₫
                        </div>
                      )}
                      <div className="text-base font-medium opacity-90">GIẢM GIÁ</div>
                    </div>
                  </div>
                  {isUpcoming && (
                    <Badge className="absolute top-4 left-4 bg-blue-500 text-white border-0 shadow-lg">
                      <Calendar className="h-3 w-3 mr-1" />
                      Sắp diễn ra
                    </Badge>
                  )}
                  {isExpired && (
                    <Badge className="absolute top-4 left-4 bg-gray-600 text-white border-0 shadow-lg">
                      <Clock className="h-3 w-3 mr-1" />
                      Đã hết hạn
                    </Badge>
                  )}
                  {isExpiringSoon && !isExpired && (
                    <Badge className="absolute top-4 left-4 bg-red-500 text-white border-0 shadow-lg">
                      <Clock className="h-3 w-3 mr-1" />
                      Sắp hết hạn
                    </Badge>
                  )}
                  {isActive && !isExpiringSoon && (
                    <Badge className="absolute top-4 left-4 bg-green-500 text-white border-0 shadow-lg">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Đang hiệu lực
                    </Badge>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Coupon Info */}
                  <div className="mb-4">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">
                      {coupon.name}
                    </h3>
                    {coupon.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {coupon.description}
                      </p>
                    )}
                  </div>

                  {/* Conditions */}
                  <div className="space-y-2 mb-4">
                    {coupon.minOrderAmount > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2 text-blue-500" />
                        <span>Đơn hàng tối thiểu: {coupon.minOrderAmount.toLocaleString()} VNĐ</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-green-500" />
                      <span>HSD: {new Date(coupon.endDate).toLocaleDateString("vi-VN")}</span>
                    </div>
                    {coupon.usageLimit > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2 text-purple-500" />
                        <span>Còn lại: {coupon.usageLimit - coupon.usedCount} lượt</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Tag className="h-4 w-4 mr-2 text-pink-500" />
                      <span>Áp dụng cho: {
                        coupon.applicableTo === "all" 
                          ? "Tất cả" 
                          : coupon.applicableTo === "room" 
                          ? "Phòng" 
                          : "Dịch vụ"
                      }</span>
                    </div>
                    {coupon.maxDiscountAmount > 0 && coupon.discountType === "percentage" && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Percent className="h-4 w-4 mr-2 text-orange-500" />
                        <span>Tối đa: {coupon.maxDiscountAmount.toLocaleString()} VNĐ</span>
                      </div>
                    )}
                  </div>

                  {/* Coupon Code */}
                  <div className="border-t pt-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-300">
                        <div className="flex items-center justify-between">
                          <code className="text-xl font-bold text-purple-700 tracking-wider">
                            {coupon.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCode(coupon.code)}
                            className="ml-2 h-8 w-8 p-0 hover:bg-purple-100"
                          >
                            {copiedCode === coupon.code ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <Copy className="h-5 w-5 text-purple-600" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {copiedCode === coupon.code ? "✓ Đã sao chép!" : "Nhấn để sao chép mã"}
                    </p>
                  </div>

                </CardContent>
              </Card>
            );
          })}
            </div>
            
            {/* Xem tất cả button */}
            {coupons.length > 3 && (
              <div className="text-center mt-8">
                <Button
                  onClick={() => router.push('/coupons')}
                  variant="outline"
                  className="px-8 py-6 text-lg font-semibold border-2 border-purple-500 text-purple-600 hover:bg-purple-50 hover:border-purple-600 transition-all duration-300"
                >
                  Xem tất cả ({coupons.length} mã giảm giá)
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

