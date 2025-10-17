"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Camera, Compass, ArrowRight, Sparkles, Navigation, Heart, Phone, MessageCircle, Clock, Share2, Bookmark } from "lucide-react";

interface Location {
  _id: string
  name: string
  type: string
  description: string
  address: string
  images: string[]
  ratingAvg: number
  status: string
}

interface LocationsResponse {
  statusCode: number
  message: string
  data: {
    locations: Location[]
    pagination: {
      totalRecord: number
      limit: number
      page: number
    }
  }
}

export function NearbyAttractions() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/locations")
        const data: LocationsResponse = await response.json()
        if (data.statusCode === 200) {
          setLocations(data.data.locations)
        }
      } catch (error) {
        console.error("Error fetching locations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "du_lich":
        return "Du lịch"
      case "dich_vu":
        return "Dịch vụ"
      case "an_uong":
        return "Ăn uống"
      case "the_thao":
        return "Thể thao"
      case "phim_anh":
        return "Phim ảnh"
      case "sach":
        return "Sách"
      case "game":
        return "Game"
      case "thu_gian":
        return "Thư giãn"
      case "bao_tang":
        return "Bảo tàng"
      case "vuon_quoc_gia":
        return "Vườn quốc gia"
      case "tham_quan":
        return "Tham quan"
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "du_lich":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "dich_vu":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "an_uong":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      case "the_thao":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "phim_anh":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "sach":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "game":
        return "bg-pink-100 text-pink-800 hover:bg-pink-200"
      case "thu_gian":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
      case "bao_tang":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      case "vuon_quoc_gia":
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
      case "tham_quan":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    }
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Đang tải địa điểm...</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Vui lòng chờ trong giây lát để khám phá những địa điểm thú vị</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden bg-white rounded-2xl shadow-lg">
                <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
                <CardContent className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6">
            <Compass className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Khám phá xung quanh</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá những địa điểm du lịch, dịch vụ và ăn uống tuyệt vời xung quanh khách sạn của chúng tôi
          </p>
        </div>

        {locations.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Navigation className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Chưa có địa điểm nào</h3>
            <p className="text-gray-600 mb-6">Chúng tôi đang cập nhật thông tin các địa điểm thú vị xung quanh</p>
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-full font-medium"
              onClick={() => window.location.reload()}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Tải lại trang
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.map((location) => (
              <Card key={location._id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 shadow-lg group">
                <div className="relative h-56 overflow-hidden">
                  {location.images && location.images.length > 0 ? (
                    <img
                      src={location.images[0] || "/placeholder.svg"}
                      alt={location.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(location.name)}`
                      }}
                    />
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
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <Heart className="h-4 w-4 text-red-500" />
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2">{location.name}</h3>

                  <div className="flex items-start gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 line-clamp-1 font-medium">{location.address}</p>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-3 mb-6 leading-relaxed">{location.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${location.status === "active" ? "bg-green-500" : "bg-red-500"}`}></div>
                      <span className="text-xs font-medium text-gray-600">
                        {location.status === "active" ? "Đang hoạt động" : "Tạm đóng"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-red-500 hover:bg-red-50 p-2 h-auto font-medium rounded-full"
                        onClick={() => {
                          // Thêm vào yêu thích
                          console.log('Added to favorites:', location.name);
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
                              title: location.name,
                              text: location.description,
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

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Sẵn sàng khám phá?</h3>
              <p className="text-blue-100 mb-6">Tìm hiểu thêm về các địa điểm thú vị và lập kế hoạch cho chuyến du lịch của bạn</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 border-white font-medium px-8 py-3 rounded-full"
                  onClick={() => router.push('/locations')}
                >
                  <Compass className="h-5 w-5 mr-2" />
                  Xem tất cả địa điểm
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 text-white hover:bg-white/20 border-white/30 font-medium px-8 py-3 rounded-full"
                  onClick={() => {
                    // Lập kế hoạch du lịch
                    console.log('Plan trip clicked');
                  }}
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Lập kế hoạch
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 text-white hover:bg-white/20 border-white/30 font-medium px-8 py-3 rounded-full"
                  onClick={() => {
                    // Tải app
                    console.log('Download app clicked');
                  }}
                >
                  <Bookmark className="h-5 w-5 mr-2" />
                  Tải app
                </Button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
