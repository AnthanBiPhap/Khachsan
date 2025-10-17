import {
  Form,
  Input,
  Modal,
  Select,
  message,
  Row,
  Col,
  Typography,
  Card,
  Space,
  Avatar,
} from "antd";
import { 
  CalendarOutlined, 
  UserOutlined, 
  EditOutlined, 
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import type {
  BookingStatusLog,
  SimpleBooking,
  BookingFormProps,
} from "../../types/bookingstatus";


export default function BookingForm({
  open,
  booking,
  onCancel,
  onSave,
  loading,
}: BookingFormProps) {
  const [form] = Form.useForm();

  const [bookings, setBookings] = useState<SimpleBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
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

    fetchBookings();
  }, []);

  useEffect(() => {
    if (booking) {
      form.setFieldsValue({
        bookingId: booking.bookingId?._id,
        actorId:
          booking.actorId?._id || (booking.actorName ? "system" : undefined),
        action: booking.action,
        note: booking.note,
      });
    } else {
      form.resetFields();
    }
  }, [booking, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: Partial<BookingStatusLog> = {
        bookingId: values.bookingId,
        action: values.action,
        note: values.note,
      };

      if (values.actorId === "system") {
        payload.actorId = null;
        payload.actorName = "Admin / Lễ tân";
      } else {
        payload.actorId = values.actorId;
        payload.actorName = undefined;
      }

      await onSave(payload);
    } catch (error) {
      console.error(error);
      message.error("Vui lòng điền đủ thông tin");
    }
  };

  const formatBookingLabel = (b: SimpleBooking) => {
    const name = b.customerId?.fullName || b.guestInfo?.fullName || "-";
    const phone = b.customerId?.phoneNumber || b.guestInfo?.phoneNumber || "-";
    // const idNum = b.customerId?.idNumber || b.guestInfo?.idNumber || "-";
    const room = b.roomId?.roomNumber || "-"; // dùng roomId.roomNumber
    const checkIn = b.checkIn
      ? new Date(b.checkIn).toLocaleString("vi-VN")
      : "-";
    const checkOut = b.checkOut
      ? new Date(b.checkOut).toLocaleString("vi-VN")
      : "-";
    return `${name} | ${phone} |  | Phòng: ${room} | Nhận: ${checkIn} | Trả: ${checkOut}`;
  };

  return (
    <Modal
      open={open}
      title={
        <Space>
          <Avatar 
            style={{ backgroundColor: booking ? '#1890ff' : '#52c41a' }} 
            icon={booking ? <EditOutlined /> : <PlusOutlined />} 
          />
          <Typography.Title level={4} style={{ margin: 0 }}>
            {booking ? "Chỉnh sửa trạng thái đặt phòng" : "Cập nhật trạng thái đặt phòng"}
          </Typography.Title>
        </Space>
      }
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      style={{ top: 20 }}
      okText={booking ? "Cập nhật" : "Xác nhận"}
      cancelText="Hủy bỏ"
    >
      <Form
        form={form}
        layout="vertical"
        style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "8px" }}
      >
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
          <Form.Item
            name="bookingId"
            label={
              <Space>
                <CalendarOutlined />
                <span>Chọn đặt phòng</span>
              </Space>
            }
            rules={[{ required: true, message: "Chọn đặt phòng" }]}
          >
            <Select
              showSearch
              placeholder="Chọn đặt phòng"
              loading={loadingBookings}
              filterOption={(input, option) =>
                ((option?.label as string) ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={bookings.map((b) => ({
                label: formatBookingLabel(b),
                value: b._id,
              }))}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Card>

        {/* Thông tin người thực hiện */}
        <Card 
          title={
            <Space>
              <UserOutlined style={{ color: '#52c41a' }} />
              <span>Thông tin người thực hiện</span>
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Form.Item
            name="actorId"
            label={
              <Space>
                <UserOutlined />
                <span>Người thực hiện</span>
              </Space>
            }
            rules={[{ required: true, message: "Chọn người thực hiện" }]}
            initialValue="system"
          >
            <Select disabled style={{ width: "100%" }}>
              <Select.Option value="system">
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span>Admin / Lễ tân</span>
                </Space>
              </Select.Option>
            </Select>
          </Form.Item>
        </Card>

        {/* Thông tin cập nhật */}
        <Card 
          title={
            <Space>
              <EditOutlined style={{ color: '#fa8c16' }} />
              <span>Thông tin cập nhật</span>
            </Space>
          }
          size="small"
        >
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Form.Item
                name="action"
                label={
                  <Space>
                    <EditOutlined />
                    <span>Hành động</span>
                  </Space>
                }
                rules={[{ required: true, message: "Chọn hành động" }]}
              >
                <Select style={{ width: "100%" }}>
                  <Select.Option value="cancelled">
                    <Space>
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                      <span>Hủy đặt phòng</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value="extend">
                    <Space>
                      <ClockCircleOutlined style={{ color: '#fa8c16' }} />
                      <span>Gia hạn</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value="confirmed">
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <span>Xác nhận</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value="extend_check_out">
                    <Space>
                      <ClockCircleOutlined style={{ color: '#722ed1' }} />
                      <span>Lùi giờ trả</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value="pending">
                    <Space>
                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                      <span>Chờ xác nhận</span>
                    </Space>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="note"
                label={
                  <Space>
                    <EditOutlined />
                    <span>Ghi chú</span>
                  </Space>
                }
                style={{ marginBottom: 0 }}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Nhập ghi chú (nếu có)"
                  style={{ resize: "none" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
}
