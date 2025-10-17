import { 
  Form, 
  InputNumber, 
  Modal, 
  Select, 
  DatePicker, 
  message, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Card, 
  Space, 
  Avatar 
} from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  CalendarOutlined, 
  UserOutlined, 
  DollarOutlined, 
  SettingOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  UndoOutlined 
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import type { InvoiceItem, SimpleUser, SimpleBooking, InvoicesFormProps } from "../../types/invoice";
import dayjs from "dayjs";


export default function InvoicesForm({ open, item, onCancel, onSave, loading }: InvoicesFormProps) {
  const [form] = Form.useForm();
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [bookings, setBookings] = useState<SimpleBooking[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const res = await axios.get("http://localhost:8080/api/v1/users");
        setUsers(res.data?.data?.users || []);
      } catch {
        message.error("Không tải được danh sách người dùng");
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchBookings = async () => {
      try {
        setLoadingBookings(true);
        const res = await axios.get("http://localhost:8080/api/v1/bookings");
        setBookings(res.data?.data?.bookings || []);
      } catch {
        message.error("Không tải được danh sách booking");
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchUsers();
    fetchBookings();
  }, []);

  useEffect(() => {
    if (item) {
      form.setFieldsValue({
        bookingId: item.bookingId?._id,
        customerId: item.customerId?._id,
        totalAmount: item.totalAmount,
        status: item.status,
        issuedAt: item.issuedAt ? dayjs(item.issuedAt) : null,
      });
    } else {
      form.resetFields();
    }
  }, [item, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await onSave({
      bookingId: values.bookingId,
      customerId: values.customerId,
      totalAmount: values.totalAmount,
      status: values.status,
      issuedAt: values.issuedAt?.toISOString(),
    } as Partial<InvoiceItem>);
  };



  return (
    <Modal
      open={open}
      title={
        <Space>
          <Avatar 
            style={{ backgroundColor: item ? '#1890ff' : '#52c41a' }} 
            icon={item ? <EditOutlined /> : <PlusOutlined />} 
          />
          <Typography.Title level={4} style={{ margin: 0 }}>
            {item ? "Chỉnh sửa hóa đơn" : "Tạo hóa đơn mới"}
          </Typography.Title>
        </Space>
      }
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      style={{ top: 20 }}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '0 8px' }}>
        {/* Thông tin đặt phòng */}
        <Card 
          title={
            <Space>
              <CalendarOutlined style={{ color: '#1890ff' }} />
              <span>Thông tin đặt phòng</span>
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 8]}>
            <Col span={24}>
              <Form.Item 
                name="bookingId" 
                label={
                  <Space>
                    <CalendarOutlined />
                    <span>Mã đặt phòng</span>
                  </Space>
                }
                rules={[{ required: true, message: "Chọn mã đặt phòng" }]}
              >
                <Select
                  showSearch
                  placeholder="Tìm kiếm mã đặt phòng..."
                  loading={loadingBookings}
                  filterOption={(input, option) => 
                    ((option?.label as string) ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  options={bookings.map(b => ({ 
                    label: `#${b._id?.slice(0,8)}...` + 
                      (b.checkIn && b.checkOut 
                        ? ` (${dayjs(b.checkIn).format('DD/MM')} - ${dayjs(b.checkOut).format('DD/MM/YYYY')})` 
                        : ''), 
                    value: b._id 
                  }))}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item 
                name="customerId" 
                label={
                  <Space>
                    <UserOutlined />
                    <span>Khách hàng</span>
                  </Space>
                }
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="Tìm kiếm khách hàng..."
                  loading={loadingUsers}
                  filterOption={(input, option) => 
                    ((option?.label as string) ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  options={users.map(u => ({ 
                    label: u.fullName || `User ${u._id.slice(0,6)}...`, 
                    value: u._id 
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Thông tin thanh toán */}
        <Card 
          title={
            <Space>
              <DollarOutlined style={{ color: '#fa8c16' }} />
              <span>Thông tin thanh toán</span>
            </Space>
          }
          size="small"
        >
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Form.Item 
                name="totalAmount" 
                label={
                  <Space>
                    <DollarOutlined />
                    <span>Tổng tiền</span>
                    <Tag color="green">VND</Tag>
                  </Space>
                }
                rules={[{ required: true, message: "Nhập tổng tiền" }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  formatter={(value: string | number | undefined) => 
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ₫'
                  }
                  parser={(value: string | undefined) => 
                    parseInt(value?.replace(/₫\s?|(,*)/g, '') || '0', 10)
                  }
                  placeholder="0"
                  prefix={<DollarOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item 
                name="status" 
                label={
                  <Space>
                    <SettingOutlined />
                    <span>Trạng thái</span>
                  </Space>
                }
                rules={[{ required: true, message: "Chọn trạng thái" }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value="pending">
                    <Space>
                      <ClockCircleOutlined style={{ color: '#faad14' }} />
                      <span>Chờ thanh toán</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value="paid">
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <span>Đã thanh toán</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value="failed">
                    <Space>
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                      <span>Thất bại</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value="refunded">
                    <Space>
                      <UndoOutlined style={{ color: '#1890ff' }} />
                      <span>Hoàn tiền</span>
                    </Space>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item 
                name="issuedAt" 
                label={
                  <Space>
                    <CalendarOutlined />
                    <span>Ngày phát hành</span>
                  </Space>
                }
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  showTime 
                  format="DD/MM/YYYY HH:mm"
                  placeholder="Chọn ngày phát hành"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
}
