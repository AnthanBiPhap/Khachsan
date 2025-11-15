import { Row, Col, Card, Statistic } from "antd";
import { 
  TeamOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  FileTextOutlined
} from "@ant-design/icons";

interface GroupBookingStatisticsProps {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  paidBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
}

export default function GroupBookingStatistics({
  totalBookings,
  pendingBookings,
  approvedBookings,
  paidBookings,
  cancelledBookings,
  totalRevenue,
}: GroupBookingStatisticsProps) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={8} lg={4}>
        <Card>
          <Statistic
            title="Tổng đặt đoàn"
            value={totalBookings}
            prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={8} lg={4}>
        <Card>
          <Statistic
            title="Chờ duyệt"
            value={pendingBookings}
            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={8} lg={4}>
        <Card>
          <Statistic
            title="Đã duyệt"
            value={approvedBookings}
            prefix={<FileTextOutlined style={{ color: '#722ed1' }} />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={8} lg={4}>
        <Card>
          <Statistic
            title="Đã thanh toán"
            value={paidBookings}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={8} lg={4}>
        <Card>
          <Statistic
            title="Đã hủy"
            value={cancelledBookings}
            prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={8} lg={4}>
        <Card>
          <Statistic
            title="Tổng doanh thu"
            value={totalRevenue}
            prefix={<DollarOutlined style={{ color: '#fa8c16' }} />}
            valueStyle={{ color: '#fa8c16' }}
            formatter={(value) => `${value?.toLocaleString()} VND`}
          />
        </Card>
      </Col>
    </Row>
  );
}

