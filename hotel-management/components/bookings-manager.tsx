"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Eye } from "lucide-react"

interface Booking {
  _id: string
  guestInfo: {
    fullName: string
    idNumber: string
    age: number
    phoneNumber: string
    email?: string
  }
  roomId: {
    _id: string
    roomNumber: string
    typeId: string
  }
  checkIn: string
  checkOut: string
  guests: number
  services: Array<{
    serviceId: string
    name: string
    price: number
    quantity: number
  }>
  totalPrice: number
  paymentStatus: string
  notes: string
  createdAt: string
}

export function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/bookings")
      const data = await response.json()

      if (data.statusCode === 200) {
        setBookings(data.data.bookings)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.guestInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.roomId.roomNumber.includes(searchTerm) ||
      booking.guestInfo.phoneNumber.includes(searchTerm),
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
          <h1 className="text-3xl font-bold text-balance">Quản lý đặt phòng</h1>
          <p className="text-muted-foreground">Theo dõi và quản lý tất cả đặt phòng</p>
        </div>
        <Button>Tạo đặt phòng mới</Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, số phòng, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="grid gap-4">
        {filteredBookings.map((booking) => (
          <Card key={booking._id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-lg">{booking.guestInfo.fullName}</h3>
                    <Badge variant={booking.paymentStatus === "paid" ? "default" : "secondary"}>
                      {booking.paymentStatus === "paid" ? "Đã thanh toán" : "Chờ thanh toán"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Phòng:</span> {booking.roomId.roomNumber}
                    </div>
                    <div>
                      <span className="font-medium">Khách:</span> {booking.guests} người
                    </div>
                    <div>
                      <span className="font-medium">Check-in:</span> {formatDate(booking.checkIn)}
                    </div>
                    <div>
                      <span className="font-medium">Check-out:</span> {formatDate(booking.checkOut)}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">SĐT:</span> {booking.guestInfo.phoneNumber} •
                    <span className="font-medium ml-2">CMND:</span> {booking.guestInfo.idNumber}
                  </div>

                  {booking.services.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Dịch vụ:</span> {booking.services.map((s) => s.name).join(", ")}
                    </div>
                  )}
                </div>

                <div className="text-right space-y-2">
                  <div className="text-2xl font-bold">{formatCurrency(booking.totalPrice)}</div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Chi tiết
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">Không tìm thấy đặt phòng nào</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
