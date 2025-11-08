import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, message, Tooltip, Card, Statistic, Row, Col, Typography, Form, Select, Input } from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  ReloadOutlined,
  HomeOutlined,
  DollarOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  RollbackOutlined
} from '@ant-design/icons';
import { paymentService } from '../../services/payment.service';
import PaymentDetails from './PaymentDetails';
import PaymentSearchFilter from './PaymentSearchFilter';

interface Payment {
  _id: string;
  bookingId?: any;
  groupBookingId?: {
    _id: string;
    checkIn?: string;
    checkOut?: string;
    requesterName?: string;
    requesterPhone?: string;
    requesterEmail?: string;
    peopleCount?: number;
    roomCount?: number;
    quoteAmount?: number;
    status?: string;
    allocatedRoomIds?: Array<{
      _id: string;
      roomNumber?: string;
      typeId?: {
        name?: string;
        pricePerNight?: number;
      };
    }>;
  };
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
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // Search và Filter states
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [filterAmount, setFilterAmount] = useState<string>("all");
  
  // Edit payment modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editForm] = Form.useForm();
  // const [stats, setStats] = useState({
  //   totalPayments: 0,
  //   totalAmount: 0,
  //   averageAmount: 0,
  //   byStatus: [] as unknown[],
  // });

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
      setFilteredPayments(response.payments);
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

  // const fetchStats = async () => {
  //   try {
  //     const response = await paymentService.getStats();
  //     setStats(response);
  //   } catch (error) {
  //     console.error('Error fetching stats:', error);
  //   }
  // };

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
    // fetchStats();
  }, []);

  useEffect(() => {
    console.log('Payments state updated:', payments);
  }, [payments]);

  // Filter payments based on search and filter criteria
  useEffect(() => {
    let filtered = [...payments];

    // Search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(payment => {
        const customerName = payment.customer?.fullName || payment.groupBookingId?.requesterName || '';
        const bookingId = payment.bookingId?._id || '';
        const groupBookingId = payment.groupBookingId?._id || '';
        const transactionId = payment.transactionId || '';
        
        return customerName.toLowerCase().includes(searchLower) ||
               bookingId.toLowerCase().includes(searchLower) ||
               groupBookingId.toLowerCase().includes(searchLower) ||
               transactionId.toLowerCase().includes(searchLower);
      });
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status === filterStatus);
    }

    // Method filter
    if (filterMethod !== 'all') {
      filtered = filtered.filter(payment => payment.paymentMethod === filterMethod);
    }

    // Amount filter
    if (filterAmount !== 'all') {
      filtered = filtered.filter(payment => {
        const amount = payment.amount;
        switch (filterAmount) {
          case 'under1m':
            return amount < 1000000;
          case '1m-5m':
            return amount >= 1000000 && amount <= 5000000;
          case '5m-10m':
            return amount >= 5000000 && amount <= 10000000;
          case 'over10m':
            return amount > 10000000;
          default:
            return true;
        }
      });
    }

    setFilteredPayments(filtered);
  }, [payments, searchText, filterStatus, filterMethod, filterAmount]);

  const handleTableChange = (pagination: unknown) => {
    const paginationObj = pagination as { current: number; pageSize: number };
    fetchPayments(paginationObj.current, paginationObj.pageSize);
  };

  // Edit payment functions
  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    editForm.setFieldsValue({
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      notes: payment.notes || '',
    });
    setEditModalVisible(true);
  };

  const handleUpdatePayment = async () => {
    try {
      const values = await editForm.validateFields();
      if (editingPayment) {
        await paymentService.updateById(editingPayment._id, values);
        message.success('Cập nhật thanh toán thành công');
        setEditModalVisible(false);
        fetchPayments(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      message.error('Cập nhật thanh toán thất bại');
    }
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailsVisible(true);
  };

  const handleUpdateStatus = async (paymentId: string, status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded') => {
    try {
      await paymentService.updateStatus(paymentId, { status });
      message.success('Cập nhật trạng thái thành công');
      fetchPayments(pagination.current, pagination.pageSize);
      // fetchStats();
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

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      pending: <ClockCircleOutlined />,
      completed: <CheckCircleOutlined />,
      failed: <CloseCircleOutlined />,
      cancelled: <CloseCircleOutlined />,
      refunded: <RollbackOutlined />,
    };
    return icons[status] || null;
  };

  const getPaymentMethodText = (method: string) => {
    const texts: Record<string, string> = {
      stripe: 'Stripe (Online)',
      cash: 'Tiền mặt (Walk-in)',
      bank_transfer: 'Chuyển khoản (Walk-in)',
      other: 'Khác',
    };
    return texts[method] || method;
  };

  const columns = [
    {
      title: "Khách hàng",
      key: 'customer',
      render: (record: Payment) => {
        // Kiểm tra group booking trước
        if (record.groupBookingId) {
          const gb = record.groupBookingId;
          return (
            <div>
              <Tag color="purple" style={{ marginBottom: 4 }}>Đặt đoàn</Tag>
              <Typography.Text strong>{gb.requesterName || 'Guest'}</Typography.Text>
              <br />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {gb.requesterPhone ? `📱 ${gb.requesterPhone}` : ''}
                {gb.requesterPhone && gb.requesterEmail ? ' | ' : ''}
                {gb.requesterEmail || ''}
              </Typography.Text>
              {gb.peopleCount && (
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    {gb.peopleCount} người, {gb.roomCount || 0} phòng
                  </Typography.Text>
                </div>
              )}
            </div>
          );
        }
        
        // Booking thông thường
        // Ưu tiên lấy tên từ booking.guests (cho cả walk-in và online)
        if (record.bookingId?.guests && record.bookingId.guests.length > 0) {
          const mainGuest = record.bookingId.guests.find((guest: any) => guest.isMainGuest) || record.bookingId.guests[0];
          const customerType = record.bookingId?.source === 'walk_in' ? 'Walk-in Customer' : 'Online Customer';
          const contactInfo = mainGuest.phoneNumber ? `📱 ${mainGuest.phoneNumber}` : customerType;
          
          return (
            <div>
              <Typography.Text strong>{mainGuest.fullName || 'Guest'}</Typography.Text>
              <br />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {contactInfo}
              </Typography.Text>
            </div>
          );
        }
        
        // Fallback: lấy từ customerId nếu không có guests
        const name = record.customerId?.fullName || record.customer?.fullName || 'Guest';
        const email = record.customerId?.email || record.customer?.email || 'guest@example.com';
        return (
          <div>
            <Typography.Text strong>{name}</Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {email}
            </Typography.Text>
          </div>
        );
      },
    },
    {
      title: (
        <Space>
          <HomeOutlined style={{ color: '#fa8c16' }} />
          <span>Phòng / Đặt đoàn</span>
        </Space>
      ),
      key: 'room',
      render: (record: Payment) => {
        // Kiểm tra group booking trước
        if (record.groupBookingId) {
          const gb = record.groupBookingId;
          const rooms = gb.allocatedRoomIds || [];
          return (
            <Space direction="vertical" size={0}>
              <Space size={4}>
                <HomeOutlined style={{ color: '#fa8c16', fontSize: 12 }} />
                <Tag color="purple" style={{ margin: 0 }}>Đặt đoàn</Tag>
              </Space>
              <div style={{ marginTop: 4 }}>
                {rooms.length > 0 ? (
                  <>
                    <Typography.Text strong style={{ fontSize: 12 }}>
                      {rooms.map((r: any) => r.roomNumber || r._id).slice(0, 3).join(', ')}
                      {rooms.length > 3 ? ` +${rooms.length - 3}` : ''}
                    </Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                      {gb.checkIn ? new Date(gb.checkIn).toLocaleDateString('vi-VN') : '-'} - {gb.checkOut ? new Date(gb.checkOut).toLocaleDateString('vi-VN') : '-'}
                    </Typography.Text>
                  </>
                ) : (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Chưa phân bổ phòng
                  </Typography.Text>
                )}
              </div>
            </Space>
          );
        }
        
        // Booking thông thường
        const roomNumber = record.bookingId?.roomId?.roomNumber || record.booking?.roomId?.roomNumber || 'N/A';
        const roomType = record.bookingId?.roomId?.typeId?.name || record.booking?.roomId?.typeId?.name || 'N/A';
        return (
          <Space>
            <HomeOutlined style={{ color: '#fa8c16', fontSize: 12 }} />
            <div>
              <Typography.Text strong>{roomNumber}</Typography.Text>
              <br />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {roomType}
              </Typography.Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: (
        <Space>
          <DollarOutlined style={{ color: '#52c41a' }} />
          <span>Số tiền</span>
        </Space>
      ),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Payment) => (
        <Space>
          <DollarOutlined style={{ color: '#52c41a' }} />
          <Typography.Text strong style={{ color: '#52c41a' }}>
            {amount.toLocaleString()} {record.currency}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <CreditCardOutlined style={{ color: '#722ed1' }} />
          <span>Phương thức</span>
        </Space>
      ),
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => (
        <Tag color="purple" icon={<CreditCardOutlined />}>
          {getPaymentMethodText(method)}
        </Tag>
      ),
    },
    {
      title: (
        <Space>
          <CheckCircleOutlined style={{ color: '#722ed1' }} />
          <span>Trạng thái</span>
        </Space>
      ),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: (
        <Space>
          <CalendarOutlined style={{ color: '#13c2c2' }} />
          <span>Ngày thanh toán</span>
        </Space>
      ),
      dataIndex: 'paidAt',
      key: 'paidAt',
      render: (paidAt: string, record: Payment) => {
        // Sử dụng paidAt nếu có, nếu không thì dùng ngày tạo booking/group booking
        const paymentDate = paidAt || record.bookingId?.createdAt || record.groupBookingId?._id ? record.createdAt : record.createdAt;
        
        if (paymentDate) {
          const date = new Date(paymentDate);
          return (
            <Space>
              <CalendarOutlined style={{ color: '#13c2c2', fontSize: 12 }} />
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {date.toLocaleDateString('vi-VN')}
                </Typography.Text>
                <br />
                <Typography.Text type="secondary" style={{ fontSize: 10 }}>
                  {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </Typography.Text>
              </div>
            </Space>
          );
        }
        
        return (
          <Space>
            <CalendarOutlined style={{ color: '#d9d9d9', fontSize: 12 }} />
            <Typography.Text type="secondary">
              N/A
            </Typography.Text>
          </Space>
        );
      },
    },
    {
      title: (
        <Space>
          <EditOutlined style={{ color: '#722ed1' }} />
          <span>Thao tác</span>
        </Space>
      ),
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
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditPayment(record)}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <Tooltip title="Hoàn thành">
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
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

      {/* Search và Filter */}
      <PaymentSearchFilter
        searchText={searchText}
        onSearchChange={setSearchText}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterMethod={filterMethod}
        onMethodChange={setFilterMethod}
        filterAmount={filterAmount}
        onAmountChange={setFilterAmount}
        onClearFilters={() => {
          setSearchText("");
          setFilterStatus("all");
          setFilterMethod("all");
          setFilterAmount("all");
        }}
        totalCount={payments.length}
        filteredCount={filteredPayments.length}
      />

      <Card
        title={
          <Space>
            <CreditCardOutlined style={{ color: '#1890ff' }} />
            <span>Danh sách thanh toán</span>
          </Space>
        }
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
          dataSource={filteredPayments}
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

      {/* Edit Payment Modal */}
      <Modal
        title="Chỉnh sửa thanh toán"
        open={editModalVisible}
        onOk={handleUpdatePayment}
        onCancel={() => setEditModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          initialValues={{
            paymentMethod: 'cash',
            status: 'pending',
            notes: ''
          }}
        >
          <Form.Item
            label="Phương thức thanh toán"
            name="paymentMethod"
            rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
          >
            <Select>
              <Select.Option value="stripe">Stripe (Online)</Select.Option>
              <Select.Option value="cash">Tiền mặt (Walk-in)</Select.Option>
              <Select.Option value="bank_transfer">Chuyển khoản (Walk-in)</Select.Option>
              <Select.Option value="other">Khác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Select.Option value="pending">Chờ thanh toán</Select.Option>
              <Select.Option value="completed">Đã thanh toán</Select.Option>
              <Select.Option value="failed">Thất bại</Select.Option>
              <Select.Option value="cancelled">Đã hủy</Select.Option>
              <Select.Option value="refunded">Đã hoàn tiền</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Ghi chú"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="Nhập ghi chú..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PaymentsList;
