"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import {
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tag, 
  Space, 
  Spin, 
  Alert, 
  Empty, 
  Button, 
  Input, 
  Select, 
  DatePicker, 
  Progress,
  Badge,
  Divider
} from "antd"
import {
  DollarOutlined,
  HomeOutlined,
  UserOutlined,
  CalendarOutlined,
  StarOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined
} from "@ant-design/icons"
import axios from "axios"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const API_URL = "http://localhost:8080/api/v1"

interface DashboardStats {
  totalBookings: number
  currentGuests: number
  todayRevenue: number
  monthRevenue: number
  paidBookings: number
  pendingBookings: number
  paymentRate: number
  averageBookingValue: number
}

interface Guest {
  fullName: string
  phoneNumber?: string
  isMainGuest?: boolean
}

interface RoomType {
  _id: string
  name: string
}

interface Room {
  _id: string
  roomNumber: string
  status: "available" | "occupied" | "maintenance"
  typeId: RoomType
}

interface Booking {
  _id: string
  customerId: string | null
  roomId: Room
  checkIn: string
  checkOut: string
  guests: Guest[]
  guestCount: number
  totalPrice: number
  paymentStatus: "pending" | "paid" | "cancelled" | "refunded"
  status: string
  source: "online" | "walk_in"
  createdAt: string
  updatedAt: string
}


const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    currentGuests: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    paidBookings: 0,
    pendingBookings: 0,
    paymentRate: 0,
    averageBookingValue: 0
  })
  
  // Data states
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  
  // Filter states
  const [searchText, setSearchText] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterSource, setFilterSource] = useState<string>("all")
  const [filterDateRange, setFilterDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  
  // Chart data states
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number }[]>([])
  const [bookingSourceData, setBookingSourceData] = useState<{ name: string; value: number }[]>([])
  const [roomStatusData, setRoomStatusData] = useState<{ status: string; count: number }[]>([])
  const [popularServices, setPopularServices] = useState<{ name: string; count: number }[]>([])

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      
        const [
          { data: bookingsData },
          { data: roomsData },
          { data: serviceBookingsData },
          { data: invoicesData },
        ] = await Promise.all([
          axios.get(`${API_URL}/bookings?limit=1000`),
          axios.get(`${API_URL}/rooms`),
          axios.get(`${API_URL}/serviceBookings?limit=1000`),
          axios.get(`${API_URL}/invoices?limit=1000`),
        ])

      const bookingsList: Booking[] = Array.isArray(bookingsData?.data?.bookings)
        ? bookingsData.data.bookings
        : Array.isArray(bookingsData?.data)
          ? bookingsData.data
          : Array.isArray(bookingsData)
            ? bookingsData
            : []

      const roomsList: Room[] = Array.isArray(roomsData?.data?.rooms)
        ? roomsData.data.rooms
        : Array.isArray(roomsData?.data)
          ? roomsData.data
          : Array.isArray(roomsData)
            ? roomsData
            : []

      const serviceBookings: any[] = Array.isArray(serviceBookingsData?.data?.serviceBookings)
        ? serviceBookingsData.data.serviceBookings
        : Array.isArray(serviceBookingsData?.data)
          ? serviceBookingsData.data
          : Array.isArray(serviceBookingsData)
            ? serviceBookingsData
            : []

      const invoices: any[] = Array.isArray(invoicesData?.data?.invoices)
        ? invoicesData.data.invoices
        : Array.isArray(invoicesData?.data)
          ? invoicesData.data
          : Array.isArray(invoicesData)
            ? invoicesData
            : []

      // Calculate statistics
      const now = dayjs()
      const today = now.startOf('day')
      const monthStart = now.startOf('month')

      // Total bookings
      const totalBookings = bookingsList.length

      // Current guests (check-in <= now < check-out)
      const currentGuests = bookingsList.filter((booking: Booking) => {
        const checkIn = dayjs(booking.checkIn)
        const checkOut = dayjs(booking.checkOut)
        return checkIn.isBefore(now) && checkOut.isAfter(now)
      }).reduce((sum: number, booking: Booking) => sum + (booking.guestCount || 0), 0)

      // Today revenue
      const todayRevenue = invoices
        .filter((invoice: any) => {
          const issuedDate = dayjs(invoice.issuedAt)
          return invoice.status === "paid" && issuedDate.isSame(today, 'day')
        })
        .reduce((sum: number, invoice: any) => sum + (invoice.totalAmount || 0), 0)

      // Month revenue
      const monthRevenue = invoices
        .filter((invoice: any) => {
          const issuedDate = dayjs(invoice.issuedAt)
          return invoice.status === "paid" && issuedDate.isSame(monthStart, 'month')
        })
        .reduce((sum: number, invoice: any) => sum + (invoice.totalAmount || 0), 0)

      // Paid and pending bookings
      const paidBookings = bookingsList.filter((booking: Booking) => booking.paymentStatus === "paid").length
      const pendingBookings = bookingsList.filter((booking: Booking) => booking.paymentStatus === "pending").length

      // Payment rate
      const paymentRate = totalBookings > 0 ? (paidBookings / totalBookings) * 100 : 0

      // Average booking value
      const totalRevenue = invoices
        .filter((invoice: any) => invoice.status === "paid")
        .reduce((sum: number, invoice: any) => sum + (invoice.totalAmount || 0), 0)
      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

      setStats({
        totalBookings,
        currentGuests,
        todayRevenue,
        monthRevenue,
        paidBookings,
        pendingBookings,
        paymentRate,
        averageBookingValue
      })

      // Set data
      setBookings(bookingsList)
      setRooms(roomsList)
      setFilteredBookings(bookingsList)

      // Calculate chart data
      calculateChartData(bookingsList, roomsList, serviceBookings, invoices)

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }, [])

  const calculateChartData = (bookingsList: Booking[], roomsList: Room[], serviceBookings: any[], invoices: any[]) => {
    // Revenue by day (last 7 days)
    const revenueByDay: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day')
      const dayKey = date.format('YYYY-MM-DD')
      revenueByDay[dayKey] = 0
    }

    invoices.forEach((invoice: any) => {
      if (invoice.status === "paid" && invoice.issuedAt) {
        const date = dayjs(invoice.issuedAt)
        const dayKey = date.format('YYYY-MM-DD')
        if (Object.prototype.hasOwnProperty.call(revenueByDay, dayKey)) {
          revenueByDay[dayKey] += invoice.totalAmount || 0
        }
      }
    })

    const revenueChartData = Object.entries(revenueByDay).map(([date, revenue]) => ({
      date: dayjs(date).format('DD/MM'),
      revenue
    }))
    setRevenueData(revenueChartData)

    // Booking source data
    const sourceCounts: Record<string, number> = {}
    bookingsList.forEach((booking: Booking) => {
      const source = booking.source || 'unknown'
      sourceCounts[source] = (sourceCounts[source] || 0) + 1
    })

    const sourceChartData = Object.entries(sourceCounts).map(([name, value]) => ({
      name: name === 'online' ? 'Online' : name === 'walk_in' ? 'Trực tiếp' : name,
      value
    }))
    setBookingSourceData(sourceChartData)

    // Room status data
    const roomStatusCounts: Record<string, number> = {}
    roomsList.forEach((room: Room) => {
      const status = room.status || 'unknown'
      roomStatusCounts[status] = (roomStatusCounts[status] || 0) + 1
    })

    const roomStatusChartData = Object.entries(roomStatusCounts).map(([status, count]) => ({
      status: status === 'available' ? 'Trống' : 
              status === 'occupied' ? 'Đang sử dụng' : 
              status === 'maintenance' ? 'Bảo trì' : status,
      count
    }))
    setRoomStatusData(roomStatusChartData)

    // Popular services
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

    const popularServicesData = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
    setPopularServices(popularServicesData)
  }

  // Filter bookings
  useEffect(() => {
    let filtered = [...bookings]

    // Search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(booking => {
        const guestName = booking.guests?.find((g: Guest) => g.isMainGuest)?.fullName || ''
        const roomNumber = booking.roomId?.roomNumber || ''
        return guestName.toLowerCase().includes(searchLower) ||
               roomNumber.toLowerCase().includes(searchLower) ||
               booking._id.toLowerCase().includes(searchLower)
      })
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(booking => booking.paymentStatus === filterStatus)
    }

    // Source filter
    if (filterSource !== "all") {
      filtered = filtered.filter(booking => booking.source === filterSource)
    }

    // Date range filter
    if (filterDateRange) {
      const [startDate, endDate] = filterDateRange
      filtered = filtered.filter(booking => {
        const bookingDate = dayjs(booking.createdAt)
        return bookingDate.isAfter(startDate.subtract(1, 'day')) && 
               bookingDate.isBefore(endDate.add(1, 'day'))
      })
    }

    setFilteredBookings(filtered)
  }, [bookings, searchText, filterStatus, filterSource, filterDateRange])

  useEffect(() => {
    fetchData()
    
    // Listen for booking updates
    const handleBookingUpdate = () => {
      console.log('🔄 Booking updated, refreshing dashboard...')
      fetchData()
    }
    
    window.addEventListener('bookingUpdated', handleBookingUpdate)
    
    return () => {
      window.removeEventListener('bookingUpdated', handleBookingUpdate)
    }
  }, [fetchData])

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredBookings.map(booking => ({
      'ID': booking._id,
      'Khách hàng': booking.guests?.find((g: Guest) => g.isMainGuest)?.fullName || 'N/A',
      'Số điện thoại': booking.guests?.find((g: Guest) => g.isMainGuest)?.phoneNumber || 'N/A',
      'Phòng': booking.roomId?.roomNumber || 'N/A',
      'Check-in': dayjs(booking.checkIn).format('DD/MM/YYYY'),
      'Check-out': dayjs(booking.checkOut).format('DD/MM/YYYY'),
      'Tổng tiền': booking.totalPrice,
      'Trạng thái': booking.paymentStatus === 'paid' ? 'Đã thanh toán' : 
                   booking.paymentStatus === 'pending' ? 'Chờ thanh toán' :
                   booking.paymentStatus === 'cancelled' ? 'Đã hủy' : 'Đã hoàn tiền',
      'Nguồn': booking.source === 'online' ? 'Online' : 'Trực tiếp',
      'Ngày tạo': dayjs(booking.createdAt).format('DD/MM/YYYY HH:mm')
    })))
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Bookings')
    XLSX.writeFile(wb, `bookings_${dayjs().format('YYYY-MM-DD')}.xlsx`)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.text('Báo cáo Dashboard', 20, 20)
    
    // Stats
    doc.setFontSize(12)
    doc.text(`Tổng đặt phòng: ${stats.totalBookings}`, 20, 40)
    doc.text(`Khách đang ở: ${stats.currentGuests}`, 20, 50)
    doc.text(`Doanh thu hôm nay: ${stats.todayRevenue.toLocaleString('vi-VN')} VND`, 20, 60)
    doc.text(`Doanh thu tháng: ${stats.monthRevenue.toLocaleString('vi-VN')} VND`, 20, 70)
    doc.text(`Tỷ lệ thanh toán: ${stats.paymentRate.toFixed(1)}%`, 20, 80)
    
    // Table
    const tableData = filteredBookings.map(booking => [
      booking._id.substring(0, 8),
      booking.guests?.find((g: Guest) => g.isMainGuest)?.fullName || 'N/A',
      booking.roomId?.roomNumber || 'N/A',
      dayjs(booking.checkIn).format('DD/MM/YYYY'),
      booking.totalPrice.toLocaleString('vi-VN'),
      booking.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'
    ])
    
    ;(doc as any).autoTable({
      head: [['ID', 'Khách hàng', 'Phòng', 'Check-in', 'Tổng tiền', 'Trạng thái']],
      body: tableData,
      startY: 90
    })
    
    doc.save(`dashboard_${dayjs().format('YYYY-MM-DD')}.pdf`)
  }

  const clearFilters = () => {
    setSearchText("")
    setFilterStatus("all")
    setFilterSource("all")
    setFilterDateRange(null)
  }

  const columns = [
    {
      title: "Khách hàng",
      key: "guestName",
      render: (record: Booking) => {
        const mainGuest = record.guests?.find((g: Guest) => g.isMainGuest)
        return (
          <div>
            <div className="font-medium">{mainGuest?.fullName || 'N/A'}</div>
            <div className="text-xs text-gray-500">{mainGuest?.phoneNumber || 'N/A'}</div>
          </div>
        )
      },
    },
    {
      title: "Phòng",
      key: "room",
      render: (record: Booking) => {
        // Tìm phòng từ danh sách rooms dựa trên roomId
        const roomId = typeof record.roomId === 'string' ? record.roomId : (record.roomId as any)?._id
        const room = rooms.find(r => r._id === roomId)
        
        return (
          <div>
            <div className="font-medium">{room?.roomNumber || 'N/A'}</div>
            <div className="text-xs text-gray-500">{room?.typeId?.name || 'N/A'}</div>
          </div>
        )
      },
    },
    {
      title: "Check-in",
      dataIndex: "checkIn",
      key: "checkIn",
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
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
    {
      title: "Nguồn",
      dataIndex: "source",
      key: "source",
      render: (source: string) => (
        <Tag color={source === 'online' ? 'blue' : 'green'}>
          {source === 'online' ? 'Online' : 'Trực tiếp'}
        </Tag>
      ),
    },
  ]

  const COLORS = ["#1890ff", "#52c41a", "#faad14", "#f5222d", "#722ed1"]

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={() => window.location.reload()} type="primary">
              Thử lại
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Tổng quan</h1>
          <p className="text-gray-600 mt-1">Thống kê và phân tích hệ thống quản lý khách sạn</p>
        </div>
        <div className="flex items-center space-x-2">
          {loading && (
            <div className="flex items-center space-x-2">
              <Spin size="small" />
              <span className="text-sm text-gray-500">Đang tải...</span>
            </div>
          )}
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchData}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <Input.Search
            placeholder="Tìm kiếm theo tên khách, phòng, ID..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          
          <Select
            placeholder="Trạng thái"
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 150 }}
          >
            <Select.Option value="all">Tất cả</Select.Option>
            <Select.Option value="paid">Đã thanh toán</Select.Option>
            <Select.Option value="pending">Chờ thanh toán</Select.Option>
            <Select.Option value="cancelled">Đã hủy</Select.Option>
            <Select.Option value="refunded">Đã hoàn tiền</Select.Option>
          </Select>

          <Select
            placeholder="Nguồn đặt"
            value={filterSource}
            onChange={setFilterSource}
            style={{ width: 150 }}
          >
            <Select.Option value="all">Tất cả</Select.Option>
            <Select.Option value="online">Online</Select.Option>
            <Select.Option value="walk_in">Trực tiếp</Select.Option>
          </Select>

          <DatePicker.RangePicker
            value={filterDateRange}
            onChange={(dates) => setFilterDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            placeholder={['Từ ngày', 'Đến ngày']}
          />

          <Button onClick={clearFilters} icon={<FilterOutlined />}>
            Xóa bộ lọc
          </Button>

          <Divider type="vertical" />

          <Button 
            icon={<DownloadOutlined />} 
            onClick={exportToExcel}
            type="primary"
          >
            Xuất Excel
          </Button>

          <Button 
            icon={<DownloadOutlined />} 
            onClick={exportToPDF}
          >
            Xuất PDF
          </Button>
        </div>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md">
            <Statistic
              title="📊 Tổng đặt phòng"
              value={stats.totalBookings}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1890ff" }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md">
            <Statistic
              title="👥 Khách đang ở"
              value={stats.currentGuests}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#52c41a" }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md">
            <Statistic
              title="💰 Doanh thu hôm nay"
              value={stats.todayRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#3f8600" }}
              formatter={(value: any) => `${Number(value).toLocaleString("vi-VN")} VND`}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md">
            <Statistic
              title="📅 Doanh thu tháng này"
              value={stats.monthRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#722ed1" }}
              formatter={(value: any) => `${Number(value).toLocaleString("vi-VN")} VND`}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md">
            <Statistic
              title="💸 Đã thanh toán"
              value={stats.paidBookings}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md">
            <Statistic
              title="🕒 Chờ thanh toán"
              value={stats.pendingBookings}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {stats.paymentRate.toFixed(1)}%
              </div>
              <div className="text-gray-600 mb-2">📈 Tỷ lệ thanh toán</div>
              <Progress 
                percent={stats.paymentRate} 
                strokeColor="#52c41a"
                size="small"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md">
            <Statistic
              title="💵 Trung bình/booking"
              value={stats.averageBookingValue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#13c2c2" }}
              formatter={(value: any) => `${Number(value).toLocaleString("vi-VN")} VND`}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="📈 Doanh thu 7 ngày qua" loading={loading} className="shadow-md">
            {!loading && revenueData.length === 0 ? (
              <Empty description="Chưa có dữ liệu doanh thu" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: any) => [`${Number(value).toLocaleString("vi-VN")} VND`, 'Doanh thu']} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1890ff"
                    fill="#1890ff"
                    fillOpacity={0.3}
                    name="Doanh thu"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="🥧 Phân bổ nguồn đặt" loading={loading} className="shadow-md">
            {!loading && bookingSourceData.length === 0 ? (
              <Empty description="Chưa có dữ liệu đặt phòng" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bookingSourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bookingSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="🏠 Tình trạng phòng" loading={loading} className="shadow-md">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roomStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <RechartsTooltip />
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
          <Card title="⭐ Dịch vụ phổ biến (Top 5)" loading={loading} className="shadow-md">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popularServices} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <RechartsTooltip />
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

      {/* Recent Bookings Table */}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card 
            title={`📋 Danh sách đặt phòng (${filteredBookings.length} kết quả)`} 
            loading={loading} 
            className="shadow-md"
            extra={
              <Space>
                <Badge count={filteredBookings.length} showZero color="#1890ff" />
                <Button icon={<EyeOutlined />} size="small">
                  Xem tất cả
                </Button>
              </Space>
            }
          >
            {!loading && filteredBookings.length === 0 ? (
              <Empty description="Không có dữ liệu phù hợp" />
            ) : (
              <Table 
                columns={columns} 
                dataSource={filteredBookings} 
                rowKey="_id" 
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} của ${total} kết quả`
                }}
                size="small"
                scroll={{ x: 800 }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="⚡ Thao tác nhanh" loading={loading} className="shadow-md">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium text-blue-800">Check-in hôm nay</div>
                  <div className="text-sm text-blue-600">
                    {bookings.filter(booking => 
                      dayjs(booking.checkIn).isSame(dayjs(), 'day')
                    ).length} đơn
                  </div>
                </div>
                <CalendarOutlined className="text-2xl text-blue-500" />
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium text-green-800">Phòng trống</div>
                  <div className="text-sm text-green-600">
                    {rooms.filter(room => room.status === 'available').length} phòng
                  </div>
                </div>
                <HomeOutlined className="text-2xl text-green-500" />
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div>
                  <div className="font-medium text-orange-800">Cần xác nhận</div>
                  <div className="text-sm text-orange-600">
                    {bookings.filter(booking => booking.paymentStatus === 'pending').length} đơn
                  </div>
                </div>
                <ClockCircleOutlined className="text-2xl text-orange-500" />
              </div>

              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-medium text-purple-800">Dịch vụ hot</div>
                  <div className="text-sm text-purple-600">
                    {popularServices[0]?.name || 'Chưa có'} ({popularServices[0]?.count || 0} lượt)
                  </div>
                </div>
                <StarOutlined className="text-2xl text-purple-500" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard