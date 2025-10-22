import React from 'react';
import { Typography, Space } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';
import PaymentsList from '../../components/Payments/PaymentsList';

const { Title } = Typography;

const PaymentsPage: React.FC = () => {
  return (
    <div>
      <Space style={{ marginBottom: 24 }}>
        <CreditCardOutlined style={{ fontSize: 24, color: '#1890ff' }} />
        <Title level={2} style={{ margin: 0 }}>
          Quản lý thanh toán
        </Title>
      </Space>
      <PaymentsList />
    </div>
  );
};

export default PaymentsPage;
