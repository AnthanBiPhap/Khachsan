import React from 'react';
import PaymentsList from '../components/Payments/PaymentsList';

const PaymentsPage: React.FC = () => {
  return (
    <div>
      <h1>Quản lý thanh toán</h1>
      <PaymentsList />
    </div>
  );
};

export default PaymentsPage;
