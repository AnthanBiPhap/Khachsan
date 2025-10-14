"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, Row, Col, Statistic, Table, Tag, Space } from "antd"
import {
  DollarOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  CalendarOutlined,
  StarOutlined,
} from "@ant-design/icons"
import axios from "axios"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const API_URL = "http://localhost:8080/api/v1"

interface Customer {
  _id: string
  fullName: string
  email: string
  phoneNumber?: string
}

interface RoomType {
  _id: string
  name: string
  pricePerNight: number
  capacity: number
}

interface Room {
  _id: string
  roomNumber: string
  status: "available" | "occupied" | "maintenance"
  typeId: RoomType | string
}

interface Service {
  _id: string
  name: string
  description: string
  basePrice: number
  status: string
}

interface ServiceBooking {
  _id: string
  serviceId: Service | string
  bookingId: string
  customerId: string | Customer
  scheduledAt: string
  quantity: number
  price: number
  status: string
}

interface Booking {
  _id: string
  customerId: string | Customer
  roomId: string | Room
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  paymentStatus: "pending" | "paid" | "cancelled" | "refunded"
  status: string
  guestInfo?: {
    fullName: string
    phoneNumber?: string
    email?: string
  }
}

interface Invoice {
  _id: string
  bookingId: string | Booking
  customerId: string | Customer
  totalAmount: number
  status: "pending" | "paid" | "overdue" | "cancelled"
  issuedAt: string
  dueDate: string
  paymentMethod?: string
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    availableRooms: 0,
    totalServices: 0,
    upcomingCheckIns: 0,
    pendingInvoices: 0,
  })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [popularServices, setPopularServices] = useState<{ name: string; count: number }[]>([])
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([])
  const [bookingStatusData, setBookingStatusData] = useState<{ name: string; value: number }[]>([])
  const [roomStatusData, setRoomStatusData] = useState<{ status: string; count: number }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { data: bookingsData },
          { data: roomsData },
          { data: servicesData },
          { data: serviceBookingsData },
          { data: invoicesData },
        ] = await Promise.all([
          axios.get(`${API_URL}/bookings?limit=100`),
          axios.get(`${API_URL}/rooms`),
          axios.get(`${API_URL}/services`),
          axios.get(`${API_URL}/serviceBookings?limit=100`),
          axios.get(`${API_URL}/invoices?limit=100`),
        ])

        const bookings = Array.isArray(bookingsData?.data?.bookings)
          ? bookingsData.data.bookings
          : Array.isArray(bookingsData?.data)
            ? bookingsData.data
            : Array.isArray(bookingsData)
              ? bookingsData
              : []

        const rooms = Array.isArray(roomsData?.data?.rooms)
          ? roomsData.data.rooms
          : Array.isArray(roomsData?.data)
            ? roomsData.data
            : Array.isArray(roomsData)
              ? roomsData
              : []

        const services = Array.isArray(servicesData?.data?.data)
          ? servicesData.data.data
          : Array.isArray(servicesData?.data)
            ? servicesData.data
            : Array.isArray(servicesData)
              ? servicesData
              : []

        const serviceBookings = Array.isArray(serviceBookingsData?.data?.serviceBookings)
          ? serviceBookingsData.data.serviceBookings
          : Array.isArray(serviceBookingsData?.data)
            ? serviceBookingsData.data
            : Array.isArray(serviceBookingsData)
              ? serviceBookingsData
              : []

        const invoices = Array.isArray(invoicesData?.data?.invoices)
          ? invoicesData.data.invoices
          : Array.isArray(invoicesData?.data)
            ? invoicesData.data
            : Array.isArray(invoicesData)
              ? invoicesData
              : []

        const totalRevenue = invoices
          .filter((invoice: any) => invoice.status === "paid")
          .reduce((sum: number, invoice: any) => sum + (invoice.totalAmount || 0), 0)

        const availableRooms = rooms.filter(
          (room: any) => room.status === "available" || room.status === "ready",
        ).length

        const now = new Date()

        const upcomingCheckIns = bookings.filter((booking: any) => {
          try {
            const checkIn = new Date(booking.checkIn)
            return checkIn > now && checkIn <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          } catch (e) {
            console.error("Invalid checkIn date:", booking.checkIn)
            return false
          }
        }).length

        const serviceCounts: Record<string, number> = {}
        serviceBookings.forEach((booking: any) => {
          let serviceName = "Unknown"
          if (typeof booking.serviceId === "object" && booking.serviceId !== null) {
            serviceName = booking.serviceId.name || "Unknown"
          } else if (booking.serviceName) {
            serviceName = booking.serviceName
          }
          serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1
        })

        const popularServices = Object.entries(serviceCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }))

        const revenueByMonth: Record<string, number> = {}
        invoices.forEach((invoice: any) => {
          if (invoice.status === "paid" && invoice.issuedAt) {
            const date = new Date(invoice.issuedAt)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
            revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + (invoice.totalAmount || 0)
          }
        })

        const revenueChartData = Object.entries(revenueByMonth)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .slice(-6)
          .map(([month, revenue]) => ({
            month: new Date(month + "-01").toLocaleDateString("vi-VN", { month: "short", year: "numeric" }),
            revenue,
          }))

        const statusCounts: Record<string, number> = {}
        bookings.forEach((booking: any) => {
          const status = booking.paymentStatus || "unknown"
          statusCounts[status] = (statusCounts[status] || 0) + 1
        })

        const statusMap: Record<string, string> = {
          paid: "Đã thanh toán",
          pending: "Chờ thanh toán",
          cancelled: "Đã hủy",
          refunded: "Đã hoàn tiền",
        }

        const bookingStatusChartData = Object.entries(statusCounts).map(([status, value]) => ({
          name: statusMap[status] || status,
          value,
        }))

        const roomStatusCounts: Record<string, number> = {}
        rooms.forEach((room: any) => {
          const status = room.status || "unknown"
          roomStatusCounts[status] = (roomStatusCounts[status] || 0) + 1
        })

        const roomStatusMap: Record<string, string> = {
          available: "Phòng trống",
          occupied: "Đang sử dụng",
          maintenance: "Bảo trì",
          ready: "Sẵn sàng",
        }

        const roomStatusChartData = Object.entries(roomStatusCounts).map(([status, count]) => ({
          status: roomStatusMap[status] || status,
          count,
        }))

        setStats({
          totalRevenue,
          totalBookings: bookings.length,
          availableRooms,
          totalServices: services.length,
          upcomingCheckIns,
          pendingInvoices: invoices.filter((inv: any) => inv.status === "pending" || inv.status === "unpaid").length,
        })

        const formattedBookings = bookings
          .map((booking: any) => {
            try {
              return {
                ...booking,
                checkIn: booking.checkIn ? new Date(booking.checkIn) : new Date(),
                checkOut: booking.checkOut ? new Date(booking.checkOut) : new Date(),
                guestInfo: {
                  fullName:
                    booking.guestInfo?.fullName ||
                    (typeof booking.customerId === "object" ? booking.customerId?.fullName : "") ||
                    "Không tên",
                  phoneNumber:
                    booking.guestInfo?.phoneNumber ||
                    (typeof booking.customerId === "object" ? booking.customerId?.phoneNumber : "") ||
                    "Chưa cập nhật",
                },
              }
            } catch (e) {
              console.error("Error formatting booking:", booking, e)
              return {
                ...booking,
                checkIn: new Date(),
                checkOut: new Date(),
                guestInfo: {
                  fullName: "Không tên",
                  phoneNumber: "Chưa cập nhật",
                },
              }
            }
          })
          .sort((a: any, b: any) => b.checkIn - a.checkIn)
          .slice(0, 5)

        setRecentBookings(formattedBookings)
        setPopularServices(popularServices)
        setRevenueData(revenueChartData)
        setBookingStatusData(bookingStatusChartData)
        setRoomStatusData(roomStatusChartData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const columns = [
    {
      title: "Khách hàng",
      key: "guestName",
      render: (record: Booking) => (
        <div>
          <div>{record.guestInfo?.fullName}</div>
          <div className="text-xs text-gray-500">{record.guestInfo?.phoneNumber}</div>
        </div>
      ),
    },
    {
      title: "Ngày nhận phòng",
      dataIndex: "checkIn",
      key: "checkIn",
      render: (date: Date) => date.toLocaleDateString("vi-VN"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price: number) => `${(price || 0).toLocaleString("vi-VN")} VND`,
    },
    {
      title: "Trạng thái",
      dataIndex: "paymentStatus",
      key: "status",
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          paid: { color: "green", text: "Đã thanh toán" },
          pending: { color: "orange", text: "Chờ thanh toán" },
          cancelled: { color: "red", text: "Đã hủy" },
          refunded: { color: "blue", text: "Đã hoàn tiền" },
        }
        const statusInfo = statusMap[status] || { color: "default", text: status }
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      },
    },
  ]

  const COLORS = ["#1890ff", "#52c41a", "#faad14", "#f5222d", "#722ed1"]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card>
            <Statistic
              title="Doanh thu"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#3f8600" }}
              formatter={(value: any) => `${Number(value).toLocaleString("vi-VN")} VND`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card>
            <Statistic title="Tổng đơn đặt phòng" value={stats.totalBookings} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card>
            <Statistic title="Phòng trống" value={stats.availableRooms} prefix={<HomeOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card>
            <Statistic title="Dịch vụ" value={stats.totalServices} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card>
            <Statistic title="Check-in sắp tới (7 ngày)" value={stats.upcomingCheckIns} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card>
            <Statistic title="Hóa đơn chờ" value={stats.pendingInvoices} prefix={<DollarOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Xu hướng doanh thu" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => `${Number(value).toLocaleString("vi-VN")} VND`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1890ff"
                  strokeWidth={2}
                  name="Doanh thu"
                  dot={{ fill: "#1890ff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Phân bổ trạng thái đơn đặt" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Tình trạng phòng" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roomStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Số phòng" radius={[8, 8, 0, 0]}>
                  {roomStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Dịch vụ phổ biến (Top 5)" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popularServices} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Lượt sử dụng" radius={[0, 8, 8, 0]}>
                  {popularServices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} xl={16}>
          <Card title="Đơn đặt phòng gần đây" loading={loading}>
            <Table columns={columns} dataSource={recentBookings} rowKey="_id" pagination={false} />
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="Dịch vụ phổ biến" loading={loading}>
            <div className="space-y-4">
              {popularServices.map((service, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="truncate mr-2">{service.name}</span>
                  <Tag color="blue">
                    <Space>
                      <StarOutlined />
                      {service.count} lượt
                    </Space>
                  </Tag>
                </div>
              ))}
              {!loading && popularServices.length === 0 && (
                <div className="text-center text-gray-500">Chưa có dữ liệu</div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
