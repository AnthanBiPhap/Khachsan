import {
  Form,
  Input,
  Modal,
  Select,
  message,
  Row,
  Col,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import type {
  BookingStatusLog,
  SimpleUser,
  SimpleBooking,
  BookingFormProps,
} from "../../types/bookingstatus";

const { Option } = Select;
const { TextArea } = Input;

export default function BookingForm({
  open,
  booking,
  onCancel,
  onSave,
  loading,
}: BookingFormProps) {
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
        booking
          ? "Chỉnh sửa trạng thái đặt phòng"
          : "Cập nhật trạng thái đặt phòng"
      }
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      style={{ top: 50 }}
      okText={booking ? "Cập nhật" : "Xác nhận"}
      cancelText="Hủy bỏ"
    >
      <Form
        form={form}
        layout="vertical"
        style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "8px" }}
      >
        <div
          style={{
            background: "#f5f5f5",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "12px",
          }}
        >
          <Typography.Title
            level={5}
            style={{ marginBottom: "12px", fontSize: "14px" }}
          >
            Thông tin đặt phòng
          </Typography.Title>

          <Form.Item
            name="bookingId"
            label="Chọn đặt phòng"
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
        </div>

        <div
          style={{
            background: "#f5f5f5",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "12px",
          }}
        >
          <Typography.Title
            level={5}
            style={{ marginBottom: "12px", fontSize: "14px" }}
          >
            Thông tin người thực hiện
          </Typography.Title>

          <Form.Item
            name="actorId"
            label="Người thực hiện"
            rules={[{ required: true, message: "Chọn người thực hiện" }]}
            initialValue="system"
          >
            <Select disabled style={{ width: "100%" }}>
              <Select.Option value="system">Admin / Lễ tân</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <div
          style={{
            background: "#f5f5f5",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "12px",
          }}
        >
          <Typography.Title
            level={5}
            style={{ marginBottom: "12px", fontSize: "14px" }}
          >
            Thông tin cập nhật
          </Typography.Title>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="action"
                label="Hành động"
                rules={[{ required: true, message: "Chọn hành động" }]}
              >
                <Select style={{ width: "100%" }}>
                  <Option value="check_in">Check-in</Option>
                  <Option value="check_out">Check-out</Option>
                  <Option value="cancelled">Hủy đặt phòng</Option>
                  <Option value="extend">Gia hạn</Option>
                  <Option value="confirmed">Xác nhận</Option>
                  <Option value="extend_check_out">Lùi giờ trả</Option>
                  <Option value="pending">chờ xác nhận</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="note"
                label="Ghi chú"
                style={{ marginBottom: 0 }}
              >
                <TextArea
                  rows={2}
                  placeholder="Nhập ghi chú (nếu có)"
                  style={{ resize: "none" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Form>
    </Modal>
  );
}
