import React from 'react';
import { Typography } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';
import PaymentsList from '../../components/Payments/PaymentsList';

const PaymentsPage: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Typography.Title level={4}>
          <CreditCardOutlined /> Quản lý thanh toán
        </Typography.Title>
      </div>
      <PaymentsList />
    </div>
  );
};

export default PaymentsPage;
