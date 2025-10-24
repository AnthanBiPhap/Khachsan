import { Row, Col, Card, Statistic } from "antd";
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  TrophyOutlined
} from "@ant-design/icons";

interface InvoiceStatisticsProps {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  failedInvoices: number;
  refundedInvoices: number;
  totalRevenue: number;
}

export default function InvoiceStatistics({
  totalInvoices,
  paidInvoices,
  pendingInvoices,
  failedInvoices,
  refundedInvoices,
  totalRevenue,
}: InvoiceStatisticsProps) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6} lg={4}>
        <Card>
          <Statistic
            title="Tổng hóa đơn"
            value={totalInvoices}
            prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={4}>
        <Card>
          <Statistic
            title="Đã thanh toán"
            value={paidInvoices}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={4}>
        <Card>
          <Statistic
            title="Chờ thanh toán"
            value={pendingInvoices}
            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={4}>
        <Card>
          <Statistic
            title="Thất bại"
            value={failedInvoices}
            prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={4}>
        <Card>
          <Statistic
            title="Đã hoàn tiền"
            value={refundedInvoices}
            prefix={<TrophyOutlined style={{ color: '#722ed1' }} />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={4}>
        <Card>
          <Statistic
            title="Tổng doanh thu"
            value={totalRevenue}
            prefix={<DollarOutlined style={{ color: '#13c2c2' }} />}
            valueStyle={{ color: '#13c2c2' }}
            formatter={(value) => `${value?.toLocaleString()} VND`}
          />
        </Card>
      </Col>
      
    </Row>
  );
}
