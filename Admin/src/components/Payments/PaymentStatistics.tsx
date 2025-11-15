import { Card, Row, Col, Statistic } from "antd";
import { 
  CreditCardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  RollbackOutlined,
  DollarOutlined
} from "@ant-design/icons";

interface PaymentStatisticsProps {
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalAmount: number;
}

export default function PaymentStatistics({
  totalPayments,
  completedPayments,
  pendingPayments,
  failedPayments,
  refundedPayments,
  totalAmount,
}: PaymentStatisticsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6} lg={4}>
        <Card>
          <Statistic
            title="Tổng thanh toán"
            value={totalPayments}
            prefix={<CreditCardOutlined style={{ color: '#1890ff' }} />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={4}>
        <Card>
          <Statistic
            title="Đã thanh toán"
            value={completedPayments}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={4}>
        <Card>
          <Statistic
            title="Chờ thanh toán"
            value={pendingPayments}
            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={4}>
        <Card>
          <Statistic
            title="Thất bại"
            value={failedPayments}
            prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={4}>
        <Card>
          <Statistic
            title="Đã hoàn tiền"
            value={refundedPayments}
            prefix={<RollbackOutlined style={{ color: '#722ed1' }} />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={4}>
        <Card>
          <Statistic
            title="Tổng doanh thu"
            value={totalAmount}
            formatter={(value) => formatCurrency(Number(value))}
            prefix={<DollarOutlined style={{ color: '#13c2c2' }} />}
            valueStyle={{ color: '#13c2c2' }}
          />
        </Card>
      </Col>
    </Row>
  );
}

