"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Bed, Users, DollarSign } from "lucide-react"

interface DashboardStats {
  totalBookings: number
  availableRooms: number
  totalGuests: number
  revenue: number
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    availableRooms: 0,
    totalGuests: 0,
    revenue: 0,
  })
  const [recentBookings, setRecentBookings] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch bookings
      const bookingsRes = await fetch("http://localhost:8080/api/v1/bookings")
      const bookingsData = await bookingsRes.json()

      // Fetch rooms
      const roomsRes = await fetch("http://localhost:8080/api/v1/rooms")
      const roomsData = await roomsRes.json()

      if (bookingsData.statusCode === 200 && roomsData.statusCode === 200) {
        const bookings = bookingsData.data.bookings
        const rooms = roomsData.data.rooms

        const availableRooms = rooms.filter((room: any) => room.status === "available").length
        const totalGuests = bookings.reduce((sum: number, booking: any) => sum + booking.guests, 0)
        const revenue = bookings.reduce((sum: number, booking: any) => sum + booking.totalPrice, 0)

        setStats({
          totalBookings: bookings.length,
          availableRooms,
          totalGuests,
          revenue,
        })

        setRecentBookings(bookings.slice(0, 5))
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Tổng quan hệ thống</h1>
        <p className="text-muted-foreground">Quản lý khách sạn hiệu quả và chuyên nghiệp</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đặt phòng</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">Tất cả đặt phòng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phòng trống</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableRooms}</div>
            <p className="text-xs text-muted-foreground">Sẵn sàng đón khách</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng khách</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGuests}</div>
            <p className="text-xs text-muted-foreground">Khách đã đặt phòng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenue)}</div>
            <p className="text-xs text-muted-foreground">Tổng doanh thu</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Đặt phòng gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{booking.guestInfo.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    Phòng {booking.roomId.roomNumber} • {booking.guests} khách
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-medium">{formatCurrency(booking.totalPrice)}</p>
                  <Badge variant={booking.paymentStatus === "paid" ? "default" : "secondary"}>
                    {booking.paymentStatus === "paid" ? "Đã thanh toán" : "Chờ thanh toán"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
