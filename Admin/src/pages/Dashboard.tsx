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
  };
}

interface Room {
  _id: string;
  roomNumber: string;
  status: string;
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
        const invoices = invoicesRes.data.data.invoices || [];

        // Calculate statistics
        const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
        const availableRooms = rooms.filter(room => room.status === 'available').length;
        const upcomingCheckIns = bookings.filter(booking => 
          new Date(booking.checkIn) > new Date()
        ).length;

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
          pendingInvoices: invoices.filter((i: any) => i.status === 'pending').length
        });

        setRecentBookings(bookings.slice(0, 5));
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
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => `${price.toLocaleString()} VND`,
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
              formatter={value => `${Number(value).toLocaleString()} VND`}
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
              title="Check-in sắp tới"
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
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;