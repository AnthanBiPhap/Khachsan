import {
  Form,
  Input,
  Modal,
  Select,
  DatePicker,
  InputNumber,
  message,
  Row,
  Col,
  Typography,
  Button,
  Divider,
} from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { useEffect, useState, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import axios from "axios";
import type { Booking, Room } from "../../types/booking";
import type { BookingFormProps } from "../../types/booking";

interface Service {
  _id: string;
  name: string;
  description?: string;
  basePrice: number;
  status: string;
}

interface ServiceItem {
  serviceId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function BookingForm({
  open,
  booking,
  onCancel,
  onSave,
  loading,
}: BookingFormProps) {
  const [form] = Form.useForm();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [checkIn, setCheckIn] = useState<Dayjs | null>(null);
  const [checkOut, setCheckOut] = useState<Dayjs | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [extraHours, setExtraHours] = useState<number>(0);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);

  // Walk-in khi không có customerId (đặt trực tiếp tại quầy)
  const isWalkIn = !booking?.customerId;

  const roomPrice = useMemo(() => {
    if (!selectedRoom || !checkIn || !checkOut) return 0;
    const nights = checkOut.diff(checkIn, "day") || 1;
    return nights * (selectedRoom.typeId?.pricePerNight || 0);
  }, [selectedRoom, checkIn, checkOut]);

  const extraHourPrice = useMemo(
    () => selectedRoom?.typeId?.extraHourPrice || 0,
    [selectedRoom]
  );
  const maxExtraHours = useMemo(
    () => selectedRoom?.typeId?.maxExtendHours || 0,
    [selectedRoom]
  );

  const servicesPrice = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0),
    [selectedServices]
  );

  const totalPrice = useMemo(
    () => roomPrice + servicesPrice + extraHours * extraHourPrice,
    [roomPrice, servicesPrice, extraHours, extraHourPrice]
  );

  // Fetch rooms, bookings, services
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, bookingsRes, servicesRes] = await Promise.all([
          axios.get("http://localhost:8080/api/v1/rooms"),
          axios.get("http://localhost:8080/api/v1/bookings"),
          axios.get("http://localhost:8080/api/v1/services"),
        ]);
        setRooms(roomsRes.data?.data?.rooms || []);
        setBookings(bookingsRes.data?.data?.bookings || []);
        setServices(servicesRes.data?.data?.data || []);
        console.log(servicesRes);
      } catch (err) {
        console.error(err);
        message.error("Không thể tải dữ liệu");
      }
    };
    fetchData();
  }, []);

  // Filter available rooms
  useEffect(() => {
    if (!checkIn || !checkOut) {
      setAvailableRooms([]);
      return;
    }
    const filtered = rooms.filter(
      (room) =>
        !bookings.some(
          (b) =>
            b.roomId._id === room._id &&
            dayjs(b.checkIn).isBefore(checkOut) &&
            dayjs(b.checkOut).isAfter(checkIn)
        )
    );
    setAvailableRooms(filtered);
  }, [checkIn, checkOut, rooms, bookings]);

  // Fill form when editing
  useEffect(() => {
    if (booking) {
      form.setFieldsValue({
        ...booking,
        checkIn: booking.checkIn ? dayjs(booking.checkIn) : null,
        checkOut: booking.checkOut ? dayjs(booking.checkOut) : null,
        guestInfo: booking.guestInfo || {},
        extraHours: (booking as any).extendHours || 0,
      });
      setCheckIn(booking.checkIn ? dayjs(booking.checkIn) : null);
      setCheckOut(booking.checkOut ? dayjs(booking.checkOut) : null);
      setExtraHours((booking as any).extendHours || 0);

      const roomIdValue = (booking as any).roomId?._id || (booking as any).roomId;
      const room = rooms.find((r) => r._id === roomIdValue);
      setSelectedRoom(room || null);

      if (booking.services) {
        setSelectedServices(
          booking.services.map((s) => ({
            serviceId:
              typeof s.serviceId === "string" ? s.serviceId : s.serviceId._id,
            name: s.name,
            price: s.price,
            quantity: s.quantity || 1,
          }))
        );
      }
    } else {
      form.resetFields();
      setCheckIn(null);
      setCheckOut(null);
      setSelectedRoom(null);
      setExtraHours(0);
      setSelectedServices([]);
    }
  }, [booking, rooms]);

  const handleAddService = (serviceId: string) => {
    const service = services.find((s) => s._id === serviceId);
    if (!service) return;
    setSelectedServices((prev) => {
      const exist = prev.find((s) => s.serviceId === serviceId);
      if (exist)
        return prev.map((s) =>
          s.serviceId === serviceId ? { ...s, quantity: s.quantity + 1 } : s
        );
      return [
        ...prev,
        {
          serviceId: service._id,
          name: service.name,
          price: service.basePrice,
          quantity: 1,
        },
      ];
    });
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices((prev) => {
      const exist = prev.find((s) => s.serviceId === serviceId);
      if (!exist) return prev;
      if (exist.quantity > 1)
        return prev.map((s) =>
          s.serviceId === serviceId ? { ...s, quantity: s.quantity - 1 } : s
        );
      return prev.filter((s) => s.serviceId !== serviceId);
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedRoom || !checkIn || !checkOut)
        return message.error("Vui lòng chọn phòng");

      // tính checkOut thực tế với giờ thêm
      const adjustedCheckOut = checkOut
        .hour(12)
        .minute(0)
        .second(0)
        .add(extraHours, "hour");

      const bookingData: Partial<Booking> = {
        ...values,
        roomId: selectedRoom._id,
        checkIn: checkIn.hour(14).minute(0).second(0).toISOString(),
        checkOut: adjustedCheckOut.toISOString(),
        extendHours: extraHours,
        totalPrice,
        actualCheckOut: adjustedCheckOut.toISOString(), // thêm giờ thực tế
        services: selectedServices.map((s) => ({
          serviceId: s.serviceId,
          name: s.name,
          price: s.price,
          quantity: s.quantity,
        })),
      };

      // Với booking online (có customerId), không gửi guestInfo rỗng lên BE
      if (!isWalkIn) {
        delete (bookingData as any).guestInfo;
      }

      await onSave(bookingData);

      if (!booking) {
        form.resetFields();
        setSelectedRoom(null);
        setCheckIn(null);
        setCheckOut(null);
        setSelectedServices([]);
        setExtraHours(0);
      }
    } catch (err) {
      console.error(err);
      message.error("Kiểm tra lại thông tin đặt phòng");
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  return (
    <Modal
      open={open}
      title={booking ? "Chỉnh sửa đặt phòng" : "Tạo đặt phòng mới"}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      okText={booking ? "Cập nhật" : "Tạo mới"}
      cancelText="Hủy bỏ"
    >
      <Form
        form={form}
        layout="vertical"
        style={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        {/* Thông tin khách hàng */}
        <Typography.Title level={5}>Thông tin khách hàng</Typography.Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={["guestInfo", "fullName"]}
              label="Họ và tên"
              rules={[{ required: isWalkIn, message: "Nhập họ và tên khách" }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={["guestInfo", "phoneNumber"]}
              label="Số điện thoại"
              rules={[{ required: isWalkIn, message: "Nhập số điện thoại" }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={["guestInfo", "email"]}
              label="Email"
              rules={[{ type: "email", message: "Email không hợp lệ" }]}
            >
              <Input placeholder="Nhập email (nếu có)" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name={["guestInfo", "idNumber"]}
              label="CMND/CCCD"
              rules={[{ required: isWalkIn, message: "Nhập CMND/CCCD" }]}
            >
              <Input placeholder="Số CMND/CCCD" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name={["guestInfo", "age"]}
              label="Tuổi"
              rules={[{ type: "number", min: 0, message: "Tuổi không hợp lệ" }]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="Tuổi"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Thông tin booking */}
        <Typography.Title level={5}>Thông tin đặt phòng</Typography.Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="checkIn"
              label="Ngày nhận phòng"
              rules={[{ required: true }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                onChange={setCheckIn}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="checkOut"
              label="Ngày trả phòng"
              rules={[{ required: true }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                onChange={setCheckOut}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="roomId"
              label="Chọn phòng"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Chọn phòng"
                disabled={!checkIn || !checkOut}
                options={availableRooms.map((r) => ({
                  label: `${r.roomNumber} - ${r.typeId?.name}`,
                  value: r._id,
                }))}
                onChange={(v) =>
                  setSelectedRoom(
                    availableRooms.find((r) => r._id === v) || null
                  )
                }
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="guests"
              label="Số khách"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="extraHours"
              label={`Thêm giờ (Max ${maxExtraHours}h)`}
            >
              <InputNumber
                min={0}
                max={maxExtraHours}
                style={{ width: "100%" }}
                value={extraHours}
                onChange={(v) => setExtraHours(v || 0)}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Dịch vụ */}
        <Typography.Title level={5}>Dịch vụ đi kèm</Typography.Title>
        <Select
          style={{ width: "100%", marginBottom: 12 }}
          placeholder="Chọn dịch vụ"
          onChange={handleAddService}
          value={null}
        >
          {services
            .filter(
              (s) => !selectedServices.some((sel) => sel.serviceId === s._id)
            )
            .map((s) => (
              <Select.Option key={s._id} value={s._id}>
                {s.name} - {formatPrice(s.basePrice)}
              </Select.Option>
            ))}
        </Select>
        {selectedServices.map((s) => (
          <Row
            key={s.serviceId}
            gutter={8}
            align="middle"
            style={{ marginBottom: 4 }}
          >
            <Col flex="auto">{s.name}</Col>
            <Col>
              <Button
                icon={<MinusOutlined />}
                size="small"
                onClick={() => handleRemoveService(s.serviceId)}
              />
              <span style={{ margin: "0 8px" }}>{s.quantity}</span>
              <Button
                icon={<PlusOutlined />}
                size="small"
                onClick={() => handleAddService(s.serviceId)}
              />
            </Col>
            <Col>{formatPrice(s.price * s.quantity)}</Col>
          </Row>
        ))}

        {/* Thanh toán */}
        <Typography.Title level={5}>Thông tin thanh toán</Typography.Title>
        <Divider />
        
        <Form.Item
          name="paymentStatus"
          label="Trạng thái thanh toán"
          initialValue={booking?.paymentStatus || 'pending'}
        >
          <Select style={{ width: '100%' }}>
            <Select.Option value="pending">Chờ thanh toán</Select.Option>
            <Select.Option value="paid">Đã thanh toán</Select.Option>
            <Select.Option value="failed">Thanh toán thất bại</Select.Option>
            <Select.Option value="refunded">Đã hoàn tiền</Select.Option>
          </Select>
        </Form.Item>
        <Row>
          <Col span={12}>Tiền phòng:</Col>
          <Col span={12} style={{ textAlign: "right" }}>
            {formatPrice(roomPrice)}
          </Col>
        </Row>
        {servicesPrice > 0 && (
          <Row>
            <Col span={12}>Tiền dịch vụ:</Col>
            <Col span={12} style={{ textAlign: "right" }}>
              {formatPrice(servicesPrice)}
            </Col>
          </Row>
        )}
        {extraHours > 0 && (
          <Row>
            <Col span={12}>Tiền giờ thêm:</Col>
            <Col span={12} style={{ textAlign: "right" }}>
              {formatPrice(extraHours * extraHourPrice)}
            </Col>
          </Row>
        )}
        <Divider />
        <Row style={{ fontWeight: "bold", fontSize: 16 }}>
          <Col span={12}>Tổng cộng:</Col>
          <Col span={12} style={{ textAlign: "right", color: "#1890ff" }}>
            {formatPrice(totalPrice)}
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
