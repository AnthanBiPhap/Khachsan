"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Settings } from "lucide-react"

interface Room {
  _id: string
  roomNumber: string
  typeId: {
    _id: string
    name: string
    pricePerNight: number
    capacity: number
  }
  status: string
  amenities: string[]
  createdAt: string
  updatedAt: string
}

export function RoomsManager() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/rooms")
      const data = await response.json()

      if (data.statusCode === 200) {
        setRooms(data.data.rooms)
      }
    } catch (error) {
      console.error("Error fetching rooms:", error)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-600">Sẵn sàng</Badge>
      case "occupied":
        return <Badge variant="destructive">Đã đặt</Badge>
      case "maintenance":
        return <Badge variant="secondary">Bảo trì</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredRooms = rooms.filter(
    (room) => room.roomNumber.includes(searchTerm) || room.typeId.name.toLowerCase().includes(searchTerm.toLowerCase()),
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
          <h1 className="text-3xl font-bold text-balance">Quản lý phòng</h1>
          <p className="text-muted-foreground">Theo dõi trạng thái và thông tin các phòng</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Thêm phòng mới
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo số phòng hoặc loại phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <Card key={room._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Phòng {room.roomNumber}</CardTitle>
                {getStatusBadge(room.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-primary">{room.typeId.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(room.typeId.pricePerNight)}/đêm • Tối đa {room.typeId.capacity} khách
                </p>
              </div>

              {room.amenities.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium mb-2">Tiện nghi:</h5>
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Settings className="h-4 w-4 mr-2" />
                  Cài đặt
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">Không tìm thấy phòng nào</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
