import { Row, Col, Card, Statistic } from "antd";
import { 
  ShoppingCartOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined
} from "@ant-design/icons";

interface ServiceBookingStatisticsProps {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  reservedBookings: number;
  totalRevenue: number;
  todayRevenue: number;
}

export default function ServiceBookingStatistics({
  totalBookings,
  completedBookings,
  cancelledBookings,
  reservedBookings,
  totalRevenue,
  todayRevenue,
}: ServiceBookingStatisticsProps) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6} lg={6}>
        <Card>
          <Statistic
            title="Tổng đặt dịch vụ"
            value={totalBookings}
            prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={6}>
        <Card>
          <Statistic
            title="Đã hoàn thành"
            value={completedBookings}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={6}>
        <Card>
          <Statistic
            title="Đang chờ"
            value={reservedBookings}
            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={6}>
        <Card>
          <Statistic
            title="Đã hủy"
            value={cancelledBookings}
            prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={6}>
        <Card>
          <Statistic
            title="Tổng doanh thu"
            value={totalRevenue}
            prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
            valueStyle={{ color: '#722ed1' }}
            formatter={(value) => `${value?.toLocaleString()} VND`}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={6}>
        <Card>
          <Statistic
            title="Doanh thu hôm nay"
            value={todayRevenue}
            prefix={<DollarOutlined style={{ color: '#13c2c2' }} />}
            valueStyle={{ color: '#13c2c2' }}
            formatter={(value) => `${value?.toLocaleString()} VND`}
          />
        </Card>
      </Col>
    </Row>
  );
}
