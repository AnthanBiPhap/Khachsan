"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { MapPin, Utensils } from "lucide-react"
import { locationService, Location } from "@/services/locationService"
import Image from "next/image"

// Hàm lấy màu gradient ngẫu nhiên
const getRandomGradient = () => {
  const gradients = [
    "from-blue-500 to-purple-600",
    "from-green-500 to-teal-600",
    "from-orange-500 to-red-600",
    "from-pink-500 to-rose-600",
    "from-indigo-500 to-blue-600",
    "from-amber-500 to-orange-600",
  ]
  return gradients[Math.floor(Math.random() * gradients.length)]
}

export function PopularDestinations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true)
        const { locations } = await locationService.getLocationsByType("an_uong")
        setLocations(locations)
      } catch (err) {
        console.error("Failed to fetch locations:", err)
        setError("Không thể tải dữ liệu địa điểm")
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Đang tải địa điểm...</div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Địa điểm ăn uống tại Đà Nẵng</h2>
          <p className="text-xl text-muted-foreground">Khám phá những địa điểm ẩm thực hấp dẫn</p>
        </div>

        {locations.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location) => (
              <Card key={location._id} className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
                <div className="relative h-48">
                  <Image
                    src={location.images?.[0] || "/placeholder-food.jpg"}
                    alt={location.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${getRandomGradient()} opacity-80`}></div>
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <h3 className="text-xl font-bold flex items-center">
                      <Utensils className="w-5 h-5 mr-2" />
                      {location.name}
                    </h3>
                    {location.address && (
                      <p className="text-sm flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{location.address}</span>
                      </p>
                    )}
                    {location.ratingAvg > 0 && (
                      <div className="flex items-center mt-1">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.round(location.ratingAvg) ? 'fill-current' : 'fill-gray-300'}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-1 text-sm">{location.ratingAvg.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
                {location.description && (
                  <div className="p-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{location.description}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">Không tìm thấy địa điểm nào</div>
        )}
      </div>
    </section>
  )
}
