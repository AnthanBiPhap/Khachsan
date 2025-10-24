import { Card, Row, Col, Statistic, Typography } from "antd";
import { 
  CalendarOutlined, 
  HomeOutlined, 
  DollarOutlined, 
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";

const { Title } = Typography;

interface BookingStatisticsProps {
  totalBookings: number;
  currentGuests: number;
  todayRevenue: number;
  monthRevenue: number;
  pendingBookings: number;
  paidBookings: number;
}

export default function BookingStatistics({
  totalBookings,
  currentGuests,
  todayRevenue,
  monthRevenue,
  pendingBookings,
  paidBookings
}: BookingStatisticsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <Title level={5} style={{ marginBottom: 16, color: '#1890ff' }}>
        📊 Thống kê tổng quan
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title="Tổng đặt phòng"
              value={totalBookings}
              prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: '20px' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title="Khách đang ở"
              value={currentGuests}
              prefix={<HomeOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: '20px' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title="Doanh thu hôm nay"
              value={todayRevenue}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontSize: '16px' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title="Doanh thu tháng này"
              value={monthRevenue}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: '16px' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title="Chờ thanh toán"
              value={pendingBookings}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14', fontSize: '18px' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title="Đã thanh toán"
              value={paidBookings}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: '18px' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title="Tỷ lệ thanh toán"
              value={totalBookings > 0 ? ((paidBookings / totalBookings) * 100).toFixed(1) : 0}
              suffix="%"
              prefix={<UserOutlined style={{ color: '#13c2c2' }} />}
              valueStyle={{ color: '#13c2c2', fontSize: '18px' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title="Trung bình/booking"
              value={totalBookings > 0 ? monthRevenue / totalBookings : 0}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarOutlined style={{ color: '#eb2f96' }} />}
              valueStyle={{ color: '#eb2f96', fontSize: '16px' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
