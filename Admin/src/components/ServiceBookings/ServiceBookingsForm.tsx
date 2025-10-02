import { Form, InputNumber, Modal, Select, DatePicker, message, Row, Col, Typography, Tag } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import type { ServiceBookingItem, ServiceBookingsFormProps, SimpleRef } from "../../types/serviceBooking";
import dayjs from "dayjs";

const { Option } = Select;
const { Title } = Typography;

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
    } catch (e) {
      // validation error already shown
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'reserved': return <Tag color="blue">Đã đặt</Tag>;
      case 'completed': return <Tag color="green">Hoàn thành</Tag>;
      case 'cancelled': return <Tag color="red">Đã hủy</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  return (
    <Modal
      open={open}
      title={item ? "Chỉnh sửa lịch dịch vụ" : "Tạo lịch dịch vụ"}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      style={{ top: 50 }}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form layout="vertical" form={form} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          <Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>Thông tin dịch vụ</Title>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="serviceId" 
                label="Dịch vụ" 
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
                label="Số lượng" 
                rules={[{ required: true, message: "Nhập số lượng" }]}
              >
                <InputNumber 
                  min={1} 
                  style={{ width: '100%' }} 
                  placeholder="Nhập số lượng"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item 
                name="price" 
                label="Giá" 
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
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          <Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>Thông tin đặt lịch</Title>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="scheduledAt" 
                label="Thời gian thực hiện" 
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
                label="Trạng thái" 
                rules={[{ required: true, message: "Chọn trạng thái" }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="reserved">
                    <Tag color="blue">Đã đặt</Tag>
                  </Option>
                  <Option value="completed">
                    <Tag color="green">Hoàn thành</Tag>
                  </Option>
                  <Option value="cancelled">
                    <Tag color="red">Đã hủy</Tag>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          <Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>Thông tin liên kết (tùy chọn)</Title>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="bookingId" label="Booking">
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
              <Form.Item name="customerId" label="Khách hàng">
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
        </div>
      </Form>
    </Modal>
  );
}
