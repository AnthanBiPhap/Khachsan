import { Form, InputNumber, Modal, Select, DatePicker, message, Row, Col, Typography, Tag } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import type { InvoiceItem, SimpleUser, SimpleBooking, InvoicesFormProps } from "../../types/invoice";
import dayjs from "dayjs";

const { Option } = Select;
const { Title } = Typography;

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

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'pending': return <Tag color="orange">Chờ thanh toán</Tag>;
      case 'paid': return <Tag color="green">Đã thanh toán</Tag>;
      case 'failed': return <Tag color="red">Thất bại</Tag>;
      case 'refunded': return <Tag color="blue">Hoàn tiền</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const formatCurrency = (value: number | string | undefined) => {
    if (value === undefined) return '0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <Modal
      open={open}
      title={item ? "Chỉnh sửa hóa đơn" : "Tạo hóa đơn mới"}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      style={{ top: 50 }}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          <Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>Thông tin đặt phòng</Title>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="bookingId" 
                label="Mã đặt phòng" 
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
                label="Khách hàng"
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
        </div>

        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          <Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>Thông tin thanh toán</Title>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="totalAmount" 
                label="Tổng tiền" 
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
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item 
                name="status" 
                label="Trạng thái" 
                rules={[{ required: true, message: "Chọn trạng thái" }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="pending">
                    <Tag color="orange">Chờ thanh toán</Tag>
                  </Option>
                  <Option value="paid">
                    <Tag color="green">Đã thanh toán</Tag>
                  </Option>
                  <Option value="failed">
                    <Tag color="red">Thất bại</Tag>
                  </Option>
                  <Option value="refunded">
                    <Tag color="blue">Hoàn tiền</Tag>
                  </Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item 
                name="issuedAt" 
                label="Ngày phát hành"
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
        </div>
      </Form>
    </Modal>
  );
}
