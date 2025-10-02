import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Space } from 'antd';
import { 
  DollarOutlined, 
  HomeOutlined, 
  ShoppingCartOutlined, 
  UserOutlined,
  CalendarOutlined,
  StarOutlined
} from '@ant-design/icons';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

interface Booking {
  _id: string;
  totalPrice: number;
  paymentStatus: string;
  checkIn: string;
  checkOut: string;
  guestInfo: {
    fullName: string;
    phoneNumber?: string;
  };
  customerId?: {
    fullName: string;
    email: string;
  };
}

interface Room {
  _id: string;
  roomNumber: string;
  status: string;
  typeId: {
    name: string;
    pricePerNight: number;
  };
}

interface Service {
  _id: string;
  name: string;
  basePrice: number;
}

interface ServiceBooking {
  _id: string;
  serviceId: {
    name: string;
  };
  price: number;
  status: string;
  scheduledAt: string;
  bookingId: {
    guestInfo: {
      fullName: string;
    };
  };
}

interface Invoice {
  _id: string;
  totalAmount: number;
  status: string;
  bookingId: {
    _id: string;
    checkIn: string;
    checkOut: string;
  };
  customerId: {
    fullName: string;
    email: string;
  };
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    availableRooms: 0,
    totalServices: 0,
    upcomingCheckIns: 0,
    pendingInvoices: 0
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [popularServices, setPopularServices] = useState<{name: string, count: number}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all necessary data
        const [bookingsRes, roomsRes, servicesRes, serviceBookingsRes, invoicesRes] = await Promise.all([
          axios.get(`${API_URL}/bookings`),
          axios.get(`${API_URL}/rooms`),
          axios.get(`${API_URL}/services`),
          axios.get(`${API_URL}/serviceBookings`),
          axios.get(`${API_URL}/invoices`)
        ]);

        const bookings: Booking[] = bookingsRes.data.data.bookings || [];
        const rooms: Room[] = roomsRes.data.data.rooms || [];
        const services: Service[] = servicesRes.data.data.data || [];
        const serviceBookings: ServiceBooking[] = serviceBookingsRes.data.data.serviceBookings || [];
        const invoices: Invoice[] = invoicesRes.data.data.invoices || [];

        // Calculate statistics
        const totalRevenue = invoices
          .filter(invoice => invoice.status === 'paid')
          .reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);

        const availableRooms = rooms.filter(room => room.status === 'available').length;
        
        const now = new Date();
        const upcomingCheckIns = bookings.filter(booking => {
          const checkIn = new Date(booking.checkIn);
          return checkIn > now && checkIn <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        }).length;

        // Calculate popular services
        const serviceCounts: Record<string, number> = {};
        serviceBookings.forEach(booking => {
          const serviceName = booking.serviceId?.name || 'Unknown';
          serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
        });
        
        const popularServices = Object.entries(serviceCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }));

        setStats({
          totalRevenue,
          totalBookings: bookings.length,
          availableRooms,
          totalServices: services.length,
          upcomingCheckIns,
          pendingInvoices: invoices.filter(invoice => invoice.status === 'pending').length
        });

        // Prepare recent bookings data
        const formattedBookings = bookings
          .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
          .slice(0, 5)
          .map(booking => ({
            ...booking,
            guestInfo: {
              fullName: booking.guestInfo?.fullName || booking.customerId?.fullName || 'Không tên',
              phoneNumber: booking.guestInfo?.phoneNumber || 'Chưa cập nhật'
            }
          }));

        setRecentBookings(formattedBookings);
        setPopularServices(popularServices);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: ['guestInfo', 'fullName'],
      key: 'guestName',
      render: (text: string, record: Booking) => (
        <div>
          <div>{record.guestInfo?.fullName}</div>
          <div className="text-xs text-gray-500">{record.guestInfo?.phoneNumber}</div>
        </div>
      ),
    },
    {
      title: 'Ngày nhận phòng',
      dataIndex: 'checkIn',
      key: 'checkIn',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => `${price?.toLocaleString('vi-VN')} VND` || '0 VND',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'paymentStatus',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'paid' ? 'green' : 'orange'}>
          {status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
        </Tag>
      ),
    },
  ];

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
            valueStyle={{ color: '#3f8600' }}
            formatter={(value: any) => `${Number(value).toLocaleString('vi-VN')} VND`}
          />

          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card>
            <Statistic
              title="Tổng đơn đặt phòng"
              value={stats.totalBookings}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card>
            <Statistic
              title="Phòng trống"
              value={stats.availableRooms}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card>
            <Statistic
              title="Dịch vụ"
              value={stats.totalServices}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card>
            <Statistic
              title="Check-in sắp tới (7 ngày)"
              value={stats.upcomingCheckIns}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card>
            <Statistic
              title="Hóa đơn chờ"
              value={stats.pendingInvoices}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} xl={16}>
          <Card title="Đơn đặt phòng gần đây" loading={loading}>
            <Table 
              columns={columns} 
              dataSource={recentBookings} 
              rowKey="_id"
              pagination={false}
            />
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="Dịch vụ phổ biến" loading={loading}>
            <div className="space-y-4">
              {popularServices.map((service, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{service.name}</span>
                  <Tag color="blue">
                    <Space>
                      <StarOutlined />
                      {service.count} lượt đặt
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
  );
};

export default Dashboard;