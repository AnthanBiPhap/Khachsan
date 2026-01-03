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
  Spin, 
  Alert, 
  Empty, 
  Button, 
  Input, 
  Select, 
  DatePicker, 
  Badge,
  Divider,
  Space
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
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  BarChartOutlined,
  TeamOutlined,
  WalletOutlined,
  TrophyOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ProfileOutlined,
  ThunderboltOutlined
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

const API_URL = "http://localhost:8080/api/v1"

interface DashboardStats {
  totalBookings: number
  currentGuests: number
  todayRevenue: number
  monthRevenue: number
  yearRevenue: number
  totalRevenue: number
  paidBookings: number
  pendingBookings: number
  paymentRate: number
  averageBookingValue: number
  availableRooms?: number
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

interface GroupBooking {
  _id: string
  requesterId?: {
    _id: string
    fullName: string
    email?: string
    phoneNumber?: string
  }
  requesterName: string
  requesterPhone: string
  requesterEmail?: string
  checkIn: string
  checkOut: string
  peopleCount: number
  roomCount: number
  notes?: string
  status: "pending_approval" | "approved" | "info_uploaded" | "quoted" | "awaiting_payment" | "deposit_paid" | "paid" | "confirmed" | "refund_requested" | "refunded" | "rejected" | "cancelled"
  allocatedRoomIds?: Array<{
    _id: string
    roomNumber: string
    typeId?: {
      _id: string
      name: string
    }
  }>
  quoteAmount?: number
  paidAmount?: number
  remainingAmount?: number
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
    yearRevenue: 0,
    totalRevenue: 0,
    paidBookings: 0,
    pendingBookings: 0,
    paymentRate: 0,
    averageBookingValue: 0,
    availableRooms: 0
  })
  
  // Data states
  const [bookings, setBookings] = useState<Booking[]>([])
  const [groupBookings, setGroupBookings] = useState<GroupBooking[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [filteredGroupBookings, setFilteredGroupBookings] = useState<GroupBooking[]>([])
  
  // Filter states
  const [searchText, setSearchText] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterSource, setFilterSource] = useState<string>("all")
  const [filterDateRange, setFilterDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  // Room availability states
  const [roomAvailabilityDateRange, setRoomAvailabilityDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [availableRoomsCount, setAvailableRoomsCount] = useState<number>(0)
  const [availableRoomsList, setAvailableRoomsList] = useState<Room[]>([])
  
  // Chart data states
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number }[]>([])
  const [bookingSourceData, setBookingSourceData] = useState<{ name: string; value: number }[]>([])
  const [roomStatusData, setRoomStatusData] = useState<{ status: string; count: number }[]>([])
  const [availableRoomsTodayData, setAvailableRoomsTodayData] = useState<{ status: string; count: number }[]>([])
  const [popularServices, setPopularServices] = useState<{ name: string; count: number }[]>([])

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      
        const [
          { data: bookingsData },
          { data: groupBookingsData },
          { data: roomsData },
          { data: serviceBookingsData },
          { data: invoicesData },
        ] = await Promise.all([
          axios.get(`${API_URL}/bookings?limit=1000`),
          axios.get(`${API_URL}/group-bookings?limit=1000`),
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

      const groupBookingsList: GroupBooking[] = Array.isArray(groupBookingsData?.data?.groupBookings)
        ? groupBookingsData.data.groupBookings
        : Array.isArray(groupBookingsData?.data)
          ? groupBookingsData.data
          : Array.isArray(groupBookingsData)
            ? groupBookingsData
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

      // Total bookings (bao gồm cả booking thường và group booking)
      const totalBookings = bookingsList.length + groupBookingsList.length

      // Current guests (check-in <= now < check-out)
      // Từ booking thường
      const currentGuestsFromBookings = bookingsList.filter((booking: Booking) => {
        const checkIn = dayjs(booking.checkIn)
        const checkOut = dayjs(booking.checkOut)
        return checkIn.isBefore(now) && checkOut.isAfter(now)
      }).reduce((sum: number, booking: Booking) => sum + (booking.guestCount || 0), 0)
      
      // Từ group booking
      const currentGuestsFromGroupBookings = groupBookingsList.filter((gb: GroupBooking) => {
        const checkIn = dayjs(gb.checkIn)
        const checkOut = dayjs(gb.checkOut)
        // Chỉ tính các group booking đã confirmed hoặc paid
        return (gb.status === 'confirmed' || gb.status === 'paid') && 
               checkIn.isBefore(now) && checkOut.isAfter(now)
      }).reduce((sum: number, gb: GroupBooking) => sum + (gb.peopleCount || 0), 0)
      
      const currentGuests = currentGuestsFromBookings + currentGuestsFromGroupBookings

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

      // Year revenue (doanh thu trong năm hiện tại)
      const yearStart = dayjs().startOf('year')
      const yearRevenue = invoices
        .filter((invoice: any) => {
          const issuedDate = dayjs(invoice.issuedAt)
          return invoice.status === "paid" && issuedDate.isSame(yearStart, 'year')
        })
        .reduce((sum: number, invoice: any) => sum + (invoice.totalAmount || 0), 0)

      // Paid and pending bookings
      // Từ booking thường
      const paidBookingsRegular = bookingsList.filter((booking: Booking) => booking.paymentStatus === "paid").length
      const pendingBookingsRegular = bookingsList.filter((booking: Booking) => booking.paymentStatus === "pending").length
      
      // Từ group booking (paid, confirmed, deposit_paid được coi là đã thanh toán một phần hoặc đủ)
      const paidGroupBookings = groupBookingsList.filter((gb: GroupBooking) => 
        gb.status === "paid" || gb.status === "confirmed" || gb.status === "deposit_paid"
      ).length
      const pendingGroupBookings = groupBookingsList.filter((gb: GroupBooking) => 
        gb.status === "pending_approval" || gb.status === "approved" || gb.status === "quoted" || gb.status === "awaiting_payment"
      ).length
      
      const paidBookings = paidBookingsRegular + paidGroupBookings
      const pendingBookings = pendingBookingsRegular + pendingGroupBookings

      // Payment rate (làm tròn 1 chữ số thập phân)
      const paymentRate = totalBookings > 0 ? Math.round((paidBookings / totalBookings) * 1000) / 10 : 0

      // Average booking value
      // Tính tổng revenue từ invoices (đã bao gồm cả booking thường và group booking)
      const totalRevenue = invoices
        .filter((invoice: any) => invoice.status === "paid")
        .reduce((sum: number, invoice: any) => sum + (invoice.totalAmount || 0), 0)
      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

      // Tính số phòng thực sự trống (không bị book - bao gồm cả hiện tại và tương lai)
      const bookedRoomIds = new Set<string>()
      
      // Lấy các phòng đang bị book từ booking thường
      // Tính cả phòng đang được sử dụng và đã được đặt trong tương lai (check-out > now)
      bookingsList.forEach((booking: Booking) => {
        if (booking.paymentStatus === 'cancelled') return
        
        const checkOut = dayjs(booking.checkOut)
        const roomId = typeof booking.roomId === 'string' ? booking.roomId : (booking.roomId as any)?._id
        
        // Tính nếu: check-out chưa đến (bao gồm cả hiện tại và tương lai)
        if (roomId && checkOut.isAfter(now)) {
          bookedRoomIds.add(String(roomId))
        }
      })
      
      // Lấy các phòng đang bị book từ group booking
      // Tính cả phòng đang được sử dụng và đã được đặt trong tương lai
      // Chỉ tính các group booking chưa bị hủy/từ chối/hoàn tiền và đã được phân bổ phòng
      groupBookingsList.forEach((gb: GroupBooking) => {
        const checkOut = dayjs(gb.checkOut)
        // Loại bỏ các status không còn hiệu lực (cancelled, rejected, refunded)
        const invalidStatuses = ['cancelled', 'rejected', 'refunded']
        
        // Tính nếu: 
        // 1. Status không phải invalid
        // 2. Check-out chưa đến (check-out > now) - bao gồm cả hiện tại và tương lai
        // 3. Đã được phân bổ phòng
        if (!invalidStatuses.includes(gb.status) &&
            checkOut.isAfter(now) && 
            gb.allocatedRoomIds && gb.allocatedRoomIds.length > 0) {
          gb.allocatedRoomIds.forEach((room: any) => {
            const roomId = typeof room === 'string' ? room : room._id
            if (roomId) {
              bookedRoomIds.add(String(roomId))
            }
          })
        }
      })
      
      // Tính số phòng thực sự trống (có status available và không bị book)
      const availableRoomsCount = roomsList.filter((room: Room) => {
        const roomId = String(room._id)
        return room.status === 'available' && !bookedRoomIds.has(roomId)
      }).length

      setStats({
        totalBookings,
        currentGuests,
        todayRevenue,
        monthRevenue,
        yearRevenue,
        totalRevenue,
        paidBookings,
        pendingBookings,
        paymentRate,
        averageBookingValue,
        availableRooms: availableRoomsCount
      })

      // Set data
      setBookings(bookingsList)
      setGroupBookings(groupBookingsList)
      setRooms(roomsList)
      setFilteredBookings(bookingsList)
      setFilteredGroupBookings(groupBookingsList)

      // Tính các phòng đã được đặt (booked) để truyền vào calculateChartData
      const bookedRoomIdsForChart = new Set<string>()
      
      // Lấy các phòng đã được đặt từ booking thường (check-out > now)
      bookingsList.forEach((booking: Booking) => {
        if (booking.paymentStatus === 'cancelled') return
        const checkOut = dayjs(booking.checkOut)
        const roomId = typeof booking.roomId === 'string' ? booking.roomId : (booking.roomId as any)?._id
        if (roomId && checkOut.isAfter(now)) {
          bookedRoomIdsForChart.add(String(roomId))
        }
      })
      
      // Lấy các phòng đã được đặt từ group booking (check-out > now)
      groupBookingsList.forEach((gb: GroupBooking) => {
        const invalidStatuses = ['cancelled', 'rejected', 'refunded']
        if (!invalidStatuses.includes(gb.status) && gb.allocatedRoomIds && gb.allocatedRoomIds.length > 0) {
          const checkOut = dayjs(gb.checkOut)
          if (checkOut.isAfter(now)) {
            gb.allocatedRoomIds.forEach((room: any) => {
              const roomId = typeof room === 'string' ? room : room._id
              if (roomId) {
                bookedRoomIdsForChart.add(String(roomId))
              }
            })
          }
        }
      })

      // Calculate chart data
      calculateChartData(bookingsList, groupBookingsList, roomsList, serviceBookings, invoices, bookedRoomIdsForChart)

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }, [])

  const calculateChartData = (bookingsList: Booking[], groupBookingsList: GroupBooking[], roomsList: Room[], serviceBookings: any[], invoices: any[], bookedRoomIds: Set<string>) => {
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

    // Booking source data (bao gồm cả booking thường và group booking)
    const sourceCounts: Record<string, number> = {}
    
    // Đếm booking thường
    bookingsList.forEach((booking: Booking) => {
      const source = booking.source || 'unknown'
      sourceCounts[source] = (sourceCounts[source] || 0) + 1
    })
    
    // Group bookings được tính riêng vào "Đặt đoàn" (không tính vào online hay walk_in)
    const groupBookingsCount = groupBookingsList.length
    if (groupBookingsCount > 0) {
      sourceCounts['group'] = groupBookingsCount
    }

    const sourceChartData = Object.entries(sourceCounts).map(([name, value]) => ({
      name: name === 'online' ? 'Online' : 
            name === 'walk_in' ? 'Trực tiếp' : 
            name === 'group' ? 'Đặt đoàn' : 
            name,
      value
    }))
    setBookingSourceData(sourceChartData)

    // Room status data - tính cả phòng đã được đặt
    const now = dayjs()
    const roomStatusCounts: Record<string, number> = {
      'Trống': 0,
      'Đã đặt': 0,
      'Đang sử dụng': 0,
      'Bảo trì': 0
    }
    
    roomsList.forEach((room: Room) => {
      const roomId = String(room._id)
      const status = room.status || 'unknown'
      
      // Kiểm tra phòng có đang được sử dụng không (check-in <= now < check-out)
      let isCurrentlyUsed = false
      bookingsList.forEach((booking: Booking) => {
        if (booking.paymentStatus === 'cancelled') return
        const checkIn = dayjs(booking.checkIn)
        const checkOut = dayjs(booking.checkOut)
        const bookingRoomId = typeof booking.roomId === 'string' ? booking.roomId : (booking.roomId as any)?._id
        if (String(bookingRoomId) === roomId && checkIn.isBefore(now) && checkOut.isAfter(now)) {
          isCurrentlyUsed = true
        }
      })
      
      groupBookingsList.forEach((gb: GroupBooking) => {
        const invalidStatuses = ['cancelled', 'rejected', 'refunded']
        if (!invalidStatuses.includes(gb.status) && gb.allocatedRoomIds && gb.allocatedRoomIds.length > 0) {
          const checkIn = dayjs(gb.checkIn)
          const checkOut = dayjs(gb.checkOut)
          const isRoomAllocated = gb.allocatedRoomIds.some((r: any) => {
            const allocatedRoomId = typeof r === 'string' ? r : r._id
            return String(allocatedRoomId) === roomId
          })
          if (isRoomAllocated && checkIn.isBefore(now) && checkOut.isAfter(now)) {
            isCurrentlyUsed = true
          }
        }
      })
      
      // Phân loại phòng
      if (isCurrentlyUsed) {
        roomStatusCounts['Đang sử dụng']++
      } else if (status === 'maintenance') {
        roomStatusCounts['Bảo trì']++
      } else if (bookedRoomIds.has(roomId)) {
        roomStatusCounts['Đã đặt']++
      } else if (status === 'available') {
        roomStatusCounts['Trống']++
      } else {
        // Các trạng thái khác (occupied, checked_in) nhưng không đang được sử dụng
        roomStatusCounts['Trống']++
      }
    })

    const roomStatusChartData = Object.entries(roomStatusCounts)
      .filter(([, count]) => count > 0) // Chỉ hiển thị các trạng thái có phòng
      .map(([status, count]) => ({
        status,
        count
      }))
    setRoomStatusData(roomStatusChartData)

    // Tính phòng trống hôm nay (chỉ tính phòng thực sự trống tại thời điểm hiện tại)
    const bookedRoomsToday = new Set<string>()
    
    // Lấy các phòng đang được sử dụng hôm nay (check-in <= now < check-out)
    bookingsList.forEach((booking: Booking) => {
      if (booking.paymentStatus === 'cancelled') return
      const checkIn = dayjs(booking.checkIn)
      const checkOut = dayjs(booking.checkOut)
      const roomId = typeof booking.roomId === 'string' ? booking.roomId : (booking.roomId as any)?._id
      if (roomId && checkIn.isBefore(now) && checkOut.isAfter(now)) {
        bookedRoomsToday.add(String(roomId))
      }
    })
    
    groupBookingsList.forEach((gb: GroupBooking) => {
      const invalidStatuses = ['cancelled', 'rejected', 'refunded']
      if (!invalidStatuses.includes(gb.status) && gb.allocatedRoomIds && gb.allocatedRoomIds.length > 0) {
        const checkIn = dayjs(gb.checkIn)
        const checkOut = dayjs(gb.checkOut)
        if (checkIn.isBefore(now) && checkOut.isAfter(now)) {
          gb.allocatedRoomIds.forEach((room: any) => {
            const roomId = typeof room === 'string' ? room : room._id
            if (roomId) {
              bookedRoomsToday.add(String(roomId))
            }
          })
        }
      }
    })
    
    // Đếm phòng trống hôm nay
    const availableTodayCount = roomsList.filter((room: Room) => {
      const roomId = String(room._id)
      return room.status === 'available' && !bookedRoomsToday.has(roomId)
    }).length
    
    const bookedTodayCount = bookedRoomsToday.size
    const maintenanceTodayCount = roomsList.filter((room: Room) => room.status === 'maintenance').length
    
    const availableRoomsTodayChartData = [
      { status: 'Trống', count: availableTodayCount },
      { status: 'Đang sử dụng', count: bookedTodayCount },
      { status: 'Bảo trì', count: maintenanceTodayCount }
    ].filter(item => item.count > 0) // Chỉ hiển thị các trạng thái có phòng
    
    setAvailableRoomsTodayData(availableRoomsTodayChartData)

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

  // Filter bookings và group bookings
  useEffect(() => {
    let filtered = [...bookings]
    let filteredGroup = [...groupBookings]

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
      
      filteredGroup = filteredGroup.filter(gb => {
        const requesterName = gb.requesterName || ''
        const requesterPhone = gb.requesterPhone || ''
        const roomNumbers = gb.allocatedRoomIds?.map(r => r.roomNumber).join(' ') || ''
        return requesterName.toLowerCase().includes(searchLower) ||
               requesterPhone.toLowerCase().includes(searchLower) ||
               roomNumbers.toLowerCase().includes(searchLower) ||
               gb._id.toLowerCase().includes(searchLower)
      })
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(booking => booking.paymentStatus === filterStatus)
      // Map filterStatus sang status của group booking
      if (filterStatus === "paid") {
        filteredGroup = filteredGroup.filter(gb => gb.status === "paid" || gb.status === "confirmed" || gb.status === "deposit_paid")
      } else if (filterStatus === "pending") {
        filteredGroup = filteredGroup.filter(gb => gb.status === "pending_approval" || gb.status === "approved" || gb.status === "quoted" || gb.status === "awaiting_payment")
      } else if (filterStatus === "cancelled") {
        filteredGroup = filteredGroup.filter(gb => gb.status === "cancelled" || gb.status === "rejected")
      } else if (filterStatus === "refunded") {
        filteredGroup = filteredGroup.filter(gb => gb.status === "refunded")
      } else {
        filteredGroup = []
      }
    }

    // Source filter
    if (filterSource !== "all") {
      if (filterSource === "group") {
        // Chỉ hiển thị group bookings khi filter là "group"
        filtered = []
        // filteredGroup giữ nguyên (đã được filter ở trên)
      } else {
        // Filter booking thường theo source
        filtered = filtered.filter(booking => booking.source === filterSource)
        // Ẩn group bookings khi filter theo online hoặc walk_in
        filteredGroup = []
      }
    }

    // Date range filter - lọc theo ngày check-in
    if (filterDateRange) {
      const [startDate, endDate] = filterDateRange
      const start = startDate.startOf('day')
      const end = endDate.endOf('day')
      
      filtered = filtered.filter(booking => {
        const checkInDate = dayjs(booking.checkIn).startOf('day')
        // Kiểm tra xem checkIn có nằm trong khoảng từ ngày đến ngày không
        return (checkInDate.isAfter(start) || checkInDate.isSame(start)) && 
               (checkInDate.isBefore(end) || checkInDate.isSame(end))
      })
      
      filteredGroup = filteredGroup.filter(gb => {
        const checkInDate = dayjs(gb.checkIn).startOf('day')
        // Kiểm tra xem checkIn có nằm trong khoảng từ ngày đến ngày không
        return (checkInDate.isAfter(start) || checkInDate.isSame(start)) && 
               (checkInDate.isBefore(end) || checkInDate.isSame(end))
      })
    }

    setFilteredBookings(filtered)
    setFilteredGroupBookings(filteredGroup)
    // Reset về trang 1 khi filter thay đổi
    setCurrentPage(1)
  }, [bookings, groupBookings, searchText, filterStatus, filterSource, filterDateRange])

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
    // Dữ liệu booking thường
    const regularBookingsData = filteredBookings.map(booking => ({
      'Loại': 'Đặt phòng thường',
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
    }))
    
    // Dữ liệu group booking
    const groupBookingsData = filteredGroupBookings.map(gb => ({
      'Loại': 'Đặt đoàn',
      'ID': gb._id,
      'Khách hàng': gb.requesterName || 'N/A',
      'Số điện thoại': gb.requesterPhone || 'N/A',
      'Phòng': gb.allocatedRoomIds?.map(r => r.roomNumber).join(', ') || 'Chưa phân bổ',
      'Check-in': dayjs(gb.checkIn).format('DD/MM/YYYY'),
      'Check-out': dayjs(gb.checkOut).format('DD/MM/YYYY'),
      'Tổng tiền': gb.quoteAmount || 0,
      'Trạng thái': gb.status === 'paid' ? 'Đã thanh toán đủ' :
                   gb.status === 'confirmed' ? 'Đã xác nhận' :
                   gb.status === 'deposit_paid' ? 'Đã đặt cọc' :
                   gb.status === 'quoted' ? 'Đã báo giá' :
                   gb.status === 'pending_approval' ? 'Chờ duyệt' :
                   gb.status === 'cancelled' ? 'Đã hủy' :
                   gb.status === 'refunded' ? 'Đã hoàn tiền' : gb.status,
      'Nguồn': 'Online',
      'Ngày tạo': dayjs(gb.createdAt).format('DD/MM/YYYY HH:mm')
    }))
    
    // Kết hợp cả hai loại
    const allBookingsData = [...regularBookingsData, ...groupBookingsData]
    
    const ws = XLSX.utils.json_to_sheet(allBookingsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Bookings')
    XLSX.writeFile(wb, `bookings_${dayjs().format('YYYY-MM-DD')}.xlsx`)
  }

  const clearFilters = () => {
    setSearchText("")
    setFilterStatus("all")
    setFilterSource("all")
    setFilterDateRange(null)
  }

  // Tính số phòng trống trong khoảng thời gian
  const calculateAvailableRoomsInRange = useCallback((startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => {
    const bookedRoomIds = new Set<string>()
    
    // Normalize thời gian
    const normalizeCheckIn = (date: dayjs.Dayjs) => date.hour(14).minute(0).second(0).millisecond(0)
    const normalizeCheckOut = (date: dayjs.Dayjs) => date.hour(12).minute(0).second(0).millisecond(0)
    
    const searchCheckIn = normalizeCheckIn(startDate)
    const searchCheckOut = normalizeCheckOut(endDate)
    
    // Lấy các phòng đã bị book từ booking thường (có overlap với khoảng thời gian)
    bookings.forEach((booking: Booking) => {
      if (booking.paymentStatus === 'cancelled') return
      
      const bookingCheckIn = normalizeCheckIn(dayjs(booking.checkIn))
      const bookingCheckOut = normalizeCheckOut(dayjs(booking.checkOut))
      const roomId = typeof booking.roomId === 'string' ? booking.roomId : (booking.roomId as any)?._id
      
      // Kiểm tra overlap: booking.checkIn < searchCheckOut && booking.checkOut > searchCheckIn
      if (roomId && bookingCheckIn.isBefore(searchCheckOut) && bookingCheckOut.isAfter(searchCheckIn)) {
        bookedRoomIds.add(String(roomId))
      }
    })
    
    // Lấy các phòng đã bị book từ group booking (có overlap với khoảng thời gian)
    groupBookings.forEach((gb: GroupBooking) => {
      const invalidStatuses = ['cancelled', 'rejected', 'refunded']
      if (!invalidStatuses.includes(gb.status) && gb.allocatedRoomIds && gb.allocatedRoomIds.length > 0) {
        const gbCheckIn = normalizeCheckIn(dayjs(gb.checkIn))
        const gbCheckOut = normalizeCheckOut(dayjs(gb.checkOut))
        
        // Kiểm tra overlap
        if (gbCheckIn.isBefore(searchCheckOut) && gbCheckOut.isAfter(searchCheckIn)) {
          gb.allocatedRoomIds.forEach((room: any) => {
            const roomId = typeof room === 'string' ? room : room._id
            if (roomId) {
              bookedRoomIds.add(String(roomId))
            }
          })
        }
      }
    })
    
    // Lấy danh sách phòng trống (có status available và không bị book)
    const availableRooms = rooms.filter((room: Room) => {
      const roomId = String(room._id)
      return room.status === 'available' && !bookedRoomIds.has(roomId)
    })
    
    return availableRooms
  }, [bookings, groupBookings, rooms])

  // Tính toán số phòng trống khi date range thay đổi
  useEffect(() => {
    if (roomAvailabilityDateRange) {
      const [startDate, endDate] = roomAvailabilityDateRange
      const availableRooms = calculateAvailableRoomsInRange(startDate, endDate)
      setAvailableRoomsList(availableRooms)
      setAvailableRoomsCount(availableRooms.length)
    } else {
      setAvailableRoomsList([])
      setAvailableRoomsCount(0)
    }
  }, [roomAvailabilityDateRange, calculateAvailableRoomsInRange])

  const columns = [
    {
      title: "Loại",
      key: "type",
      width: 100,
      render: (record: any) => {
        // Kiểm tra xem có phải group booking không (có requesterName)
        const isGroupBooking = record.requesterName !== undefined
        return (
          <Tag color={isGroupBooking ? 'purple' : 'blue'}>
            {isGroupBooking ? 'Đặt đoàn' : 'Đặt phòng'}
          </Tag>
        )
      },
    },
    {
      title: "Khách hàng",
      key: "guestName",
      render: (record: any) => {
        // Kiểm tra xem có phải group booking không
        if (record.requesterName !== undefined) {
          return (
            <div>
              <div className="font-medium">{record.requesterName || 'N/A'}</div>
              <div className="text-xs text-gray-500">{record.requesterPhone || 'N/A'}</div>
            </div>
          )
        }
        // Booking thường
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
      render: (record: any) => {
        // Kiểm tra xem có phải group booking không
        if (record.allocatedRoomIds !== undefined) {
          const roomNumbers = record.allocatedRoomIds?.map((r: any) => r.roomNumber).join(', ') || 'Chưa phân bổ'
          return (
            <div>
              <div className="font-medium">{roomNumbers}</div>
              <div className="text-xs text-gray-500">{record.roomCount || 0} phòng</div>
            </div>
          )
        }
        // Booking thường
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
      key: "totalPrice",
      render: (record: any) => {
        // Kiểm tra xem có phải group booking không
        if (record.quoteAmount !== undefined) {
          return `${(record.quoteAmount || 0).toLocaleString("vi-VN")} VND`
        }
        // Booking thường
        return `${((record.totalPrice as number) || 0).toLocaleString("vi-VN")} VND`
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (record: any) => {
        // Kiểm tra xem có phải group booking không
        if (record.status && ['pending_approval', 'approved', 'info_uploaded', 'quoted', 'awaiting_payment', 'deposit_paid', 'paid', 'confirmed', 'refund_requested', 'refunded', 'rejected', 'cancelled'].includes(record.status)) {
          const groupStatusMap: Record<string, { color: string; text: string }> = {
            paid: { color: "green", text: "Đã thanh toán đủ" },
            confirmed: { color: "green", text: "Đã xác nhận" },
            deposit_paid: { color: "blue", text: "Đã đặt cọc" },
            quoted: { color: "cyan", text: "Đã báo giá" },
            awaiting_payment: { color: "orange", text: "Chờ thanh toán" },
            pending_approval: { color: "orange", text: "Chờ duyệt" },
            approved: { color: "blue", text: "Đã duyệt" },
            info_uploaded: { color: "purple", text: "Đã upload thông tin" },
            cancelled: { color: "red", text: "Đã hủy" },
            rejected: { color: "red", text: "Đã từ chối" },
            refunded: { color: "blue", text: "Đã hoàn tiền" },
            refund_requested: { color: "orange", text: "Yêu cầu hoàn tiền" },
          }
          const statusInfo = groupStatusMap[record.status] || { color: "default", text: record.status }
          return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
        }
        // Booking thường
        const status = record.paymentStatus
        const statusMap: Record<string, { color: string; text: string }> = {
          paid: { color: "green", text: "Đã thanh toán đủ" },
          partial_paid: { color: "blue", text: "Thanh toán 50%" },
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
      key: "source",
      render: (record: any) => {
        // Kiểm tra xem có phải group booking không (có requesterName)
        const isGroupBooking = record.requesterName !== undefined
        if (isGroupBooking) {
          return <Tag color="purple">Đặt đoàn</Tag>
        }
        // Booking thường
        const source = record.source
        return (
          <Tag color={source === 'online' ? 'blue' : 'green'}>
            {source === 'online' ? 'Online' : 'Trực tiếp'}
          </Tag>
        )
      },
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
            <Select.Option value="group">Đặt đoàn</Select.Option>
          </Select>

          <DatePicker.RangePicker
            value={filterDateRange}
            onChange={(dates) => setFilterDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            placeholder={['Từ ngày check-in', 'Đến ngày check-in']}
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
        </div>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md">
            <Statistic
              title={
                <Space>
                  <BarChartOutlined />
                  <span>Tổng đặt phòng</span>
                </Space>
              }
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
              title={
                <Space>
                  <TeamOutlined />
                  <span>Khách đang ở</span>
                </Space>
              }
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
              title={
                <Space>
                  <WalletOutlined />
                  <span>Doanh thu hôm nay</span>
                </Space>
              }
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
              title={
                <Space>
                  <CalendarOutlined />
                  <span>Doanh thu tháng này</span>
                </Space>
              }
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
              title={
                <Space>
                  <CalendarOutlined />
                  <span>Doanh thu năm này</span>
                </Space>
              }
              value={stats.yearRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#eb2f96" }}
              formatter={(value: any) => `${Number(value).toLocaleString("vi-VN")} VND`}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md">
            <Statistic
              title={
                <Space>
                  <TrophyOutlined />
                  <span>Tổng tiền toàn bộ</span>
                </Space>
              }
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#f5222d" }}
              formatter={(value: any) => `${Number(value).toLocaleString("vi-VN")} VND`}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md">
            <Statistic
              title={
                <Space>
                  <CheckCircleOutlined />
                  <span>Đã thanh toán</span>
                </Space>
              }
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
              title={
                <Space>
                  <ClockCircleOutlined />
                  <span>Chờ thanh toán</span>
                </Space>
              }
              value={stats.pendingBookings}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md">
            <Statistic
              title={
                <Space>
                  <LineChartOutlined />
                  <span>Tỷ lệ thanh toán</span>
                </Space>
              }
              value={stats.paymentRate}
              suffix="%"
              valueStyle={{ color: "#13c2c2" }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md">
            <Statistic
              title={
                <Space>
                  <DollarOutlined />
                  <span>Trung bình/booking</span>
                </Space>
              }
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
          <Card 
            title={
              <Space>
                <LineChartOutlined />
                <span>Doanh thu 7 ngày qua</span>
              </Space>
            } 
            loading={loading} 
            className="shadow-md"
            style={{ height: "100%" }}
          >
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
          <Card 
            title={
              <Space>
                <PieChartOutlined />
                <span>Phân bổ nguồn đặt</span>
              </Space>
            } 
            loading={loading} 
            className="shadow-md"
            style={{ height: "100%" }}
          >
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
          <Card 
            title={
              <Space>
                <HomeOutlined />
                <span>Tình trạng phòng (Tổng quan)</span>
              </Space>
            }
            loading={loading} 
            className="shadow-md"
          >
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
          <Card 
            title={
              <Space>
                <HomeOutlined />
                <span>Phòng trống hôm nay</span>
              </Space>
            } 
            loading={loading} 
            className="shadow-md"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={availableRoomsTodayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="count" name="Số phòng" radius={[8, 8, 0, 0]}>
                  {availableRoomsTodayData.map((entry, index) => (
                    <Cell key={`cell-today-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <StarOutlined />
                <span>Dịch vụ phổ biến (Top 5)</span>
              </Space>
            }
            loading={loading} 
            className="shadow-md"
            style={{ height: "100%" }}
          >
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
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <HomeOutlined />
                <span>Số phòng trống theo khoảng thời gian</span>
              </Space>
            } 
            loading={loading} 
            className="shadow-md"
            style={{ height: "100%" }}
          >
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-sm text-gray-600">Chọn khoảng thời gian:</div>
                <DatePicker.RangePicker
                  value={roomAvailabilityDateRange}
                  onChange={(dates) => setRoomAvailabilityDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                  placeholder={['Từ ngày', 'Đến ngày']}
                  style={{ width: '100%' }}
                />
              </div>
              
              {roomAvailabilityDateRange ? (
                <div>
                  <div className="text-center mb-4 pb-3 border-b">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {availableRoomsCount}
                    </div>
                    <div className="text-sm text-gray-600">phòng trống</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Từ {roomAvailabilityDateRange[0].format('DD/MM/YYYY')} đến {roomAvailabilityDateRange[1].format('DD/MM/YYYY')}
                    </div>
                  </div>
                  
                  {availableRoomsList.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {availableRoomsList.map((room: Room) => (
                          <div 
                            key={room._id} 
                            className="p-2 bg-green-50 rounded border border-green-200 hover:bg-green-100 transition-colors"
                          >
                            <div className="font-medium text-green-800">
                              Phòng {room.roomNumber}
                            </div>
                            {room.typeId && typeof room.typeId === 'object' && (
                              <div className="text-xs text-gray-600">
                                {room.typeId.name || 'N/A'}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-gray-400">Không có phòng trống trong khoảng thời gian này</div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 mt-3 text-center">
                    Tổng số phòng: {rooms.length}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Empty 
                    description="Chọn khoảng thời gian để xem số phòng trống"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Bookings Table */}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card 
            title={
              <Space>
                <ProfileOutlined />
                <span>Danh sách đặt phòng ({filteredBookings.length + filteredGroupBookings.length} kết quả)</span>
              </Space>
            } 
            loading={loading} 
            className="shadow-md"
            style={{ height: "100%" }}
            extra={
              <Badge count={filteredBookings.length + filteredGroupBookings.length} showZero color="#1890ff" />
            }
          >
            {!loading && filteredBookings.length === 0 && filteredGroupBookings.length === 0 ? (
              <Empty description="Không có dữ liệu phù hợp" />
            ) : (
              <Table 
                columns={columns} 
                dataSource={[...filteredBookings, ...filteredGroupBookings]} 
                rowKey="_id" 
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} của ${total} kết quả`,
                  onChange: (page, size) => {
                    setCurrentPage(page)
                    setPageSize(size || 10)
                  },
                  onShowSizeChange: (_current, size) => {
                    setCurrentPage(1) // Reset về trang 1 khi đổi pageSize
                    setPageSize(size)
                  }
                }}
                size="small"
                scroll={{ x: 800 }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card 
            title={
              <Space>
                <ThunderboltOutlined />
                <span>Thao tác nhanh</span>
              </Space>
            }
            loading={loading} 
            className="shadow-md"
            style={{ height: "100%" }}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium text-blue-800">Check-in hôm nay</div>
                  <div className="text-sm text-blue-600">
                    {bookings.filter(booking => 
                      dayjs(booking.checkIn).isSame(dayjs(), 'day')
                    ).length + groupBookings.filter(gb => 
                      dayjs(gb.checkIn).isSame(dayjs(), 'day')
                    ).length} đơn
                  </div>
                </div>
                <CalendarOutlined className="text-2xl text-blue-500" />
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium text-green-800">Phòng trống</div>
                  <div className="text-sm text-green-600">
                    {stats.availableRooms ?? rooms.filter(room => room.status === 'available').length} phòng
                  </div>
                </div>
                <HomeOutlined className="text-2xl text-green-500" />
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div>
                  <div className="font-medium text-orange-800">Cần xác nhận</div>
                  <div className="text-sm text-orange-600">
                    {bookings.filter(booking => booking.paymentStatus === 'pending').length + 
                     groupBookings.filter(gb => gb.status === 'pending_approval' || gb.status === 'quoted' || gb.status === 'awaiting_payment').length} đơn
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