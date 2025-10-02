"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Camera } from "lucide-react"

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
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

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
    }
  }

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Khám phá xung quanh</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Đang tải thông tin các địa điểm thú vị...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Khám phá xung quanh</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Khám phá những địa điểm du lịch, dịch vụ và ăn uống tuyệt vời xung quanh khách sạn
          </p>
        </div>

        {locations.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có thông tin địa điểm nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location) => (
              <Card key={location._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                <div className="relative h-48 overflow-hidden">
                  {location.images && location.images.length > 0 ? (
                    <img
                      src={location.images[0] || "/placeholder.svg"}
                      alt={location.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(location.name)}`
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                      <Camera className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className={getTypeColor(location.type)}>{getTypeLabel(location.type)}</Badge>
                  </div>
                  {location.ratingAvg && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{location.ratingAvg}</span>
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{location.name}</h3>

                  <div className="flex items-start gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 line-clamp-1">{location.address}</p>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">{location.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {location.status === "active" ? "Đang hoạt động" : "Tạm đóng"}
                    </span>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                      Xem chi tiết →
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
