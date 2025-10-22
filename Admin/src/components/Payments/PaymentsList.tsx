import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, message, Tooltip, Card, Statistic, Row, Col } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { paymentService } from '../../services/payment.service';
import PaymentDetails from './PaymentDetails';

interface Payment {
  _id: string;
  bookingId: any;
  customerId: any;
  paymentMethod: 'stripe' | 'cash' | 'bank_transfer' | 'other';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  stripeSessionId?: string;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  booking?: {
    _id: string;
    roomId: {
      _id: string;
      roomNumber: string;
      typeId: {
        _id: string;
        name: string;
      };
    };
    checkIn: string;
    checkOut: string;
    guests: number;
  };
  customer?: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  metadata?: {
    roomName?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    services?: any[];
  };
}

const PaymentsList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    averageAmount: 0,
    byStatus: [] as any[],
  });

  const fetchPayments = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await paymentService.getAll({
        page,
        limit: pageSize,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      
      console.log('Setting payments data:', response.payments);
      setPayments(response.payments);
      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (error) {
      message.error('Không thể tải danh sách thanh toán');
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await paymentService.getStats();
      setStats(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatsData = () => {
    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const completedPayments = payments.filter(payment => payment.status === 'completed').length;
    const averageAmount = totalPayments > 0 ? totalAmount / totalPayments : 0;

    return {
      totalPayments,
      totalAmount,
      completedPayments,
      averageAmount
    };
  };

  const statsData = getStatsData();

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, []);

  useEffect(() => {
    console.log('Payments state updated:', payments);
  }, [payments]);

  const handleTableChange = (pagination: any) => {
    fetchPayments(pagination.current, pagination.pageSize);
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailsVisible(true);
  };

  const handleUpdateStatus = async (paymentId: string, status: string) => {
    try {
      await paymentService.updateStatus(paymentId, { status });
      message.success('Cập nhật trạng thái thành công');
      fetchPayments(pagination.current, pagination.pageSize);
      fetchStats();
    } catch (error) {
      message.error('Không thể cập nhật trạng thái');
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'orange',
      completed: 'green',
      failed: 'red',
      cancelled: 'gray',
      refunded: 'blue',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Chờ xử lý',
      completed: 'Hoàn thành',
      failed: 'Thất bại',
      cancelled: 'Đã hủy',
      refunded: 'Đã hoàn tiền',
    };
    return texts[status] || status;
  };

  const getPaymentMethodText = (method: string) => {
    const texts: Record<string, string> = {
      stripe: 'Stripe',
      cash: 'Tiền mặt',
      bank_transfer: 'Chuyển khoản',
      other: 'Khác',
    };
    return texts[method] || method;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      width: 100,
      render: (id: string) => id.substring(0, 8) + '...',
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (record: Payment) => {
        console.log('Customer render - record:', record);
        console.log('Customer render - customerId:', record.customerId);
        console.log('Customer render - customer:', record.customer);
        return (
          <div>
            <div>{record.customerId?.fullName || record.customer?.fullName || 'Guest'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.customerId?.email || record.customer?.email || 'guest@example.com'}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Phòng',
      key: 'room',
      render: (record: Payment) => {
        console.log('Room render - record:', record);
        console.log('Room render - bookingId:', record.bookingId);
        console.log('Room render - booking:', record.booking);
        return (
          <div>
            <div>{record.bookingId?.roomId?.roomNumber || record.booking?.roomId?.roomNumber || 'N/A'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.bookingId?.roomId?.typeId?.name || record.booking?.roomId?.typeId?.name || 'N/A'}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Payment) => (
        <span>{amount.toLocaleString()} {record.currency}</span>
      ),
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => getPaymentMethodText(method),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'paidAt',
      key: 'paidAt',
      render: (paidAt: string) => paidAt ? new Date(paidAt).toLocaleDateString('vi-VN') : 'N/A',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (record: Payment) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <Tooltip title="Hoàn thành">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleUpdateStatus(record._id, 'completed')}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng thanh toán"
              value={statsData.totalPayments}
              suffix="giao dịch"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng tiền"
              value={statsData.totalAmount}
              formatter={(value) => `${value?.toLocaleString()} VND`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Trung bình"
              value={statsData.averageAmount}
              formatter={(value) => `${value?.toLocaleString()} VND`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={statsData.completedPayments}
              suffix="giao dịch"
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Danh sách thanh toán"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchPayments(pagination.current, pagination.pageSize)}
          >
            Làm mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={payments}
          rowKey="_id"
          loading={loading}
          key={`payments-table-${payments.length}`}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} thanh toán`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title="Chi tiết thanh toán"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width={800}
      >
        {selectedPayment && (
          <PaymentDetails
            payment={selectedPayment}
            onClose={() => setDetailsVisible(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default PaymentsList;
