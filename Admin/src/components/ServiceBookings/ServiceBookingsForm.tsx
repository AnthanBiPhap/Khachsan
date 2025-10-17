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
  SettingOutlined, 
  DollarOutlined, 
  CalendarOutlined, 
  UserOutlined, 
  LinkOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined 
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import type { ServiceBookingItem, ServiceBookingsFormProps, SimpleRef } from "../../types/serviceBooking";
import dayjs from "dayjs";


export default function ServiceBookingsForm({ open, item, onCancel, onSave, loading }: ServiceBookingsFormProps) {
  const [form] = Form.useForm();
  const [services, setServices] = useState<SimpleRef[]>([]);
  const [bookings, setBookings] = useState<SimpleRef[]>([]);
  const [users, setUsers] = useState<SimpleRef[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const res = await axios.get("http://localhost:8080/api/v1/services");
        const arr = res.data?.data?.data || res.data?.data?.services || [];
        setServices(arr);
      } catch {
        message.error("Không tải được danh sách dịch vụ");
      } finally {
        setLoadingServices(false);
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

    fetchServices();
    fetchBookings();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (item) {
      form.setFieldsValue({
        bookingId: item.bookingId?._id,
        serviceId: item.serviceId?._id,
        customerId: item.customerId?._id,
        scheduledAt: item.scheduledAt ? dayjs(item.scheduledAt) : null,
        quantity: item.quantity,
        price: item.price,
        status: item.status,
      });
    } else {
      form.resetFields();
    }
  }, [item, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave({
        bookingId: values.bookingId,
        serviceId: values.serviceId,
        customerId: values.customerId,
        scheduledAt: values.scheduledAt?.toISOString(),
        quantity: values.quantity,
        price: values.price,
        status: values.status,
      } as Partial<ServiceBookingItem>);
    } catch {
      // validation error already shown
    }
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
            {item ? "Chỉnh sửa lịch dịch vụ" : "Tạo lịch dịch vụ"}
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
      <Form layout="vertical" form={form} style={{ maxHeight: '75vh', overflowY: 'auto', padding: '0 8px' }}>
        {/* Thông tin dịch vụ */}
        <Card 
          title={
            <Space>
              <SettingOutlined style={{ color: '#1890ff' }} />
              <span>Thông tin dịch vụ</span>
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 8]}>
            <Col span={24}>
              <Form.Item 
                name="serviceId" 
                label={
                  <Space>
                    <SettingOutlined />
                    <span>Dịch vụ</span>
                  </Space>
                }
                rules={[{ required: true, message: "Chọn dịch vụ" }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn dịch vụ"
                  loading={loadingServices}
                  filterOption={(input, option) => 
                    ((option?.label as string) ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  options={services.map(s => ({ 
                    label: s.name || s._id, 
                    value: s._id 
                  }))}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item 
                name="quantity" 
                label={
                  <Space>
                    <UserOutlined />
                    <span>Số lượng</span>
                  </Space>
                }
                rules={[{ required: true, message: "Nhập số lượng" }]}
              >
                <InputNumber 
                  min={1} 
                  style={{ width: '100%' }} 
                  placeholder="Nhập số lượng"
                  prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item 
                name="price" 
                label={
                  <Space>
                    <DollarOutlined />
                    <span>Giá</span>
                  </Space>
                }
                rules={[{ required: true, message: "Nhập giá" }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  formatter={(value: string | number | undefined) => 
                    `₫${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value: string | undefined) => 
                    parseInt(value?.replace(/₫\s?|(,*)/g, '') || '0', 10)
                  }
                  placeholder="0"
                  prefix={<DollarOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Thông tin đặt lịch */}
        <Card 
          title={
            <Space>
              <CalendarOutlined style={{ color: '#52c41a' }} />
              <span>Thông tin đặt lịch</span>
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 8]}>
            <Col span={24}>
              <Form.Item 
                name="scheduledAt" 
                label={
                  <Space>
                    <CalendarOutlined />
                    <span>Thời gian thực hiện</span>
                  </Space>
                }
                rules={[{ required: true, message: "Chọn thời gian" }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  showTime 
                  format="DD/MM/YYYY HH:mm"
                  placeholder="Chọn ngày và giờ"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
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
                  <Select.Option value="reserved">
                    <Space>
                      <ClockCircleOutlined style={{ color: '#1890ff' }} />
                      <span>Đã đặt</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value="completed">
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <span>Hoàn thành</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value="cancelled">
                    <Space>
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                      <span>Đã hủy</span>
                    </Space>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Thông tin liên kết (tùy chọn) */}
        <Card 
          title={
            <Space>
              <LinkOutlined style={{ color: '#fa8c16' }} />
              <span>Thông tin liên kết</span>
              <Tag color="orange">Tùy chọn</Tag>
            </Space>
          }
          size="small"
        >
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Form.Item 
                name="bookingId" 
                label={
                  <Space>
                    <LinkOutlined />
                    <span>Booking</span>
                  </Space>
                }
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="Tìm kiếm booking..."
                  loading={loadingBookings}
                  filterOption={(input, option) => 
                    ((option?.label as string) ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  options={bookings.map(b => ({ 
                    label: `#${b._id?.slice(0,8)}...`,
                    value: b._id 
                  }))}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
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
      </Form>
    </Modal>
  );
}
