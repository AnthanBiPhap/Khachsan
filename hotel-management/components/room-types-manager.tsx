"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit, Users } from "lucide-react"

interface RoomType {
  _id: string
  name: string
  description: string
  pricePerNight: number
  extraHourPrice: number
  maxExtendHours: number
  capacity: number
  amenities: string[]
  images: string[]
  createdAt: string
  updatedAt: string
}

export function RoomTypesManager() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchRoomTypes()
  }, [])

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/roomTypes")
      const data = await response.json()

      if (data.statusCode === 200) {
        setRoomTypes(data.data.roomTypes)
      }
    } catch (error) {
      console.error("Error fetching room types:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const filteredRoomTypes = roomTypes.filter(
    (roomType) =>
      roomType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roomType.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Đang tải dữ liệu...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Quản lý loại phòng</h1>
          <p className="text-muted-foreground">Cấu hình các loại phòng và giá cả</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Thêm loại phòng
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Room Types Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRoomTypes.map((roomType) => (
          <Card key={roomType._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{roomType.name}</CardTitle>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{roomType.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Sức chứa: {roomType.capacity} khách</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Giờ thêm: {formatCurrency(roomType.extraHourPrice)}/giờ
                  </div>
                  <div className="text-sm text-muted-foreground">Tối đa: {roomType.maxExtendHours} giờ</div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{formatCurrency(roomType.pricePerNight)}</div>
                  <div className="text-sm text-muted-foreground">mỗi đêm</div>
                </div>
              </div>

              {roomType.amenities.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium mb-2">Tiện nghi:</h5>
                  <div className="flex flex-wrap gap-1">
                    {roomType.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {roomType.images.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium mb-2">Hình ảnh:</h5>
                  <div className="text-sm text-muted-foreground">{roomType.images.length} hình ảnh</div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRoomTypes.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">Không tìm thấy loại phòng nào</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
