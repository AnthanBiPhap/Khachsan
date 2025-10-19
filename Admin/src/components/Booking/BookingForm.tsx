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
  Card,
  Space,
  Tag,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  MinusOutlined,
  UserOutlined,
  CalendarOutlined,
  HomeOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
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
        extraHours: (booking as Booking & { extendHours?: number }).extendHours || 0,
      });
      setCheckIn(booking.checkIn ? dayjs(booking.checkIn) : null);
      setCheckOut(booking.checkOut ? dayjs(booking.checkOut) : null);
      setExtraHours((booking as Booking & { extendHours?: number }).extendHours || 0);

      const roomIdValue = (booking.roomId as Room)?._id || booking.roomId;
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
  }, [booking, rooms, form]);

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

      // Quy định check-in sớm:
      // - Nếu đặt phòng 14h mà khách tới sớm hơn 4h (tức là trước 10h) thì cho vào miễn phí nếu có phòng trống.
      // - Nếu khách tới sớm hơn hơn 2h (tức là trước 12h) thì có thể tính luôn vào trước 1 ngày (tùy quyết định của lễ tân).
      // - Extra hours chỉ áp dụng cho việc gia hạn check-out, không áp dụng cho check-in sớm.
      // Lưu ý: Quy định này cần được kiểm tra và áp dụng thủ công bởi lễ tân dựa trên tình trạng phòng và yêu cầu khách hàng.

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
        delete (bookingData as Partial<Booking> & { guestInfo?: unknown }).guestInfo;
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
      title={
        <Space>
          <Avatar 
            style={{ backgroundColor: '#1890ff' }} 
            icon={booking ? <CalendarOutlined /> : <PlusOutlined />} 
          />
          <Typography.Title level={4} style={{ margin: 0 }}>
            {booking ? "Chỉnh sửa đặt phòng" : "Tạo đặt phòng mới"}
          </Typography.Title>
        </Space>
      }
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={900}
      okText={booking ? "Cập nhật" : "Tạo mới"}
      cancelText="Hủy bỏ"
      style={{ top: 20 }}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ maxHeight: "75vh", overflowY: "auto", padding: "0 8px" }}
      >
        {/* Thông tin khách hàng */}
        <Card 
          title={
            <Space>
              <UserOutlined style={{ color: '#1890ff' }} />
              <span>Thông tin khách hàng</span>
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Form.Item
                name={["guestInfo", "fullName"]}
                label={
                  <Space>
                    <UserOutlined />
                    <span>Họ và tên</span>
                  </Space>
                }
                rules={[{ required: isWalkIn, message: "Nhập họ và tên khách" }]}
              >
                <Input 
                  placeholder="Nhập họ và tên" 
                  prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={["guestInfo", "phoneNumber"]}
                label={
                  <Space>
                    <PhoneOutlined />
                    <span>Số điện thoại</span>
                  </Space>
                }
                rules={[{ required: isWalkIn, message: "Nhập số điện thoại" }]}
              >
                <Input 
                  placeholder="Nhập số điện thoại" 
                  prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Form.Item
                name={["guestInfo", "email"]}
                label={
                  <Space>
                    <MailOutlined />
                    <span>Email</span>
                  </Space>
                }
                rules={[{ type: "email", message: "Email không hợp lệ" }]}
              >
                <Input 
                  placeholder="Nhập email (nếu có)" 
                  prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name={["guestInfo", "idNumber"]}
                label={
                  <Space>
                    <IdcardOutlined />
                    <span>CMND/CCCD</span>
                  </Space>
                }
                rules={[{ required: isWalkIn, message: "Nhập CMND/CCCD" }]}
              >
                <Input 
                  placeholder="Số CMND/CCCD" 
                  prefix={<IdcardOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name={["guestInfo", "age"]}
                label={
                  <Space>
                    <UserOutlined />
                    <span>Tuổi</span>
                  </Space>
                }
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
        </Card>

        {/* Quy định check-in sớm */}
        <Card
          size="small"
          style={{
            marginBottom: 16,
            backgroundColor: '#fff7e6',
            border: '1px solid #ffd591'
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <InfoCircleOutlined style={{ color: '#fa8c16', fontSize: 16, marginRight: 8 }} />
              <Typography.Text strong style={{ color: '#d46b08' }}>
                Quy định check-in sớm
              </Typography.Text>
            </div>
            <div style={{ fontSize: 12, color: '#d46b08', lineHeight: 1.5 }}>
              <div>• Đặt phòng 14h, tới sớm trước 10h (trước 4h): Cho vào miễn phí nếu có phòng trống</div>
              <div>• Tới sớm từ 10h đến trước 14h: Tính thêm 1 ngày (tùy quyết định lễ tân)</div>
              <div>• Extra hours chỉ áp dụng cho gia hạn check-out, không áp dụng check-in sớm</div>
              <div style={{ marginTop: 4, fontStyle: 'italic' }}>
                Lưu ý: Quy định này cần được kiểm tra và áp dụng thủ công bởi lễ tân dựa trên tình trạng phòng và yêu cầu khách hàng.
              </div>
            </div>

          </Space>
        </Card>

        {/* Thông tin booking */}
        <Card 
          title={
            <Space>
              <CalendarOutlined style={{ color: '#52c41a' }} />
              <span>Thông tin đặt phòng</span>
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Form.Item
                name="checkIn"
                label={
                  <Space>
                    <CalendarOutlined />
                    <span>Ngày nhận phòng</span>
                  </Space>
                }
                rules={[{ required: true }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  onChange={setCheckIn}
                  placeholder="Chọn ngày nhận phòng"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="checkOut"
                label={
                  <Space>
                    <CalendarOutlined />
                    <span>Ngày trả phòng</span>
                  </Space>
                }
                rules={[{ required: true }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  onChange={setCheckOut}
                  placeholder="Chọn ngày trả phòng"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Form.Item
                name="roomId"
                label={
                  <Space>
                    <HomeOutlined />
                    <span>Chọn phòng</span>
                    {availableRooms.length > 0 && (
                      <Tag color="green">{availableRooms.length} phòng trống</Tag>
                    )}
                  </Space>
                }
                rules={[{ required: true }]}
              >
                <Select
                  placeholder={availableRooms.length === 0 ? "Không có phòng trống" : "Chọn phòng"}
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
                label={
                  <Space>
                    <UserOutlined />
                    <span>Số khách</span>
                  </Space>
                }
                rules={[{ required: true }]}
              >
                <InputNumber 
                  min={1} 
                  style={{ width: "100%" }} 
                  placeholder="Số khách"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="extraHours"
                label={
                  <Space>
                    <ClockCircleOutlined />
                    <span>Thêm giờ</span>
                    <Tag color="blue">Max {maxExtraHours}h</Tag>
                  </Space>
                }
              >
                <InputNumber
                  min={0}
                  max={maxExtraHours}
                  style={{ width: "100%" }}
                  value={extraHours}
                  onChange={(v) => setExtraHours(v || 0)}
                  placeholder="Giờ thêm"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Dịch vụ */}
        <Card 
          title={
            <Space>
              <PlusOutlined style={{ color: '#fa8c16' }} />
              <span>Dịch vụ đi kèm</span>
              {selectedServices.length > 0 && (
                <Tag color="orange">{selectedServices.length} dịch vụ</Tag>
              )}
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
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
            <Card 
              key={s.serviceId}
              size="small" 
              style={{ marginBottom: 8 }}
              bodyStyle={{ padding: '8px 12px' }}
            >
              <Row gutter={8} align="middle">
                <Col flex="auto">
                  <Space>
                    <span style={{ fontWeight: 500 }}>{s.name}</span>
                    <Tag color="blue">{formatPrice(s.price)}</Tag>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Button
                      icon={<MinusOutlined />}
                      size="small"
                      onClick={() => handleRemoveService(s.serviceId)}
                    />
                    <span style={{ margin: "0 8px", fontWeight: 500 }}>{s.quantity}</span>
                    <Button
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={() => handleAddService(s.serviceId)}
                    />
                  </Space>
                </Col>
                <Col>
                  <Typography.Text strong style={{ color: '#1890ff' }}>
                    {formatPrice(s.price * s.quantity)}
                  </Typography.Text>
                </Col>
              </Row>
            </Card>
          ))}
        </Card>

        {/* Thanh toán */}
        <Card 
          title={
            <Space>
              <DollarOutlined style={{ color: '#52c41a' }} />
              <span>Thông tin thanh toán</span>
            </Space>
          }
          size="small"
        >
          <Form.Item
            name="paymentStatus"
            label={
              <Space>
                <DollarOutlined />
                <span>Trạng thái thanh toán</span>
              </Space>
            }
            initialValue={booking?.paymentStatus || 'pending'}
          >
            <Select style={{ width: '100%' }}>
              <Select.Option value="pending">
                <Space>
                  <Tag color="orange">Chờ thanh toán</Tag>
                </Space>
              </Select.Option>
              <Select.Option value="paid">
                <Space>
                  <Tag color="green">Đã thanh toán</Tag>
                </Space>
              </Select.Option>
              <Select.Option value="failed">
                <Space>
                  <Tag color="red">Thanh toán thất bại</Tag>
                </Space>
              </Select.Option>
              <Select.Option value="refunded">
                <Space>
                  <Tag color="blue">Đã hoàn tiền</Tag>
                </Space>
              </Select.Option>
            </Select>
          </Form.Item>
          
          <Divider style={{ margin: '16px 0' }} />
          
          <Row style={{ marginBottom: 8 }}>
            <Col span={12}>
              <Space>
                <HomeOutlined style={{ color: '#1890ff' }} />
                <span>Tiền phòng:</span>
              </Space>
            </Col>
            <Col span={12} style={{ textAlign: "right" }}>
              <Typography.Text strong>{formatPrice(roomPrice)}</Typography.Text>
            </Col>
          </Row>
          
          {servicesPrice > 0 && (
            <Row style={{ marginBottom: 8 }}>
              <Col span={12}>
                <Space>
                  <PlusOutlined style={{ color: '#fa8c16' }} />
                  <span>Tiền dịch vụ:</span>
                </Space>
              </Col>
              <Col span={12} style={{ textAlign: "right" }}>
                <Typography.Text strong>{formatPrice(servicesPrice)}</Typography.Text>
              </Col>
            </Row>
          )}
          
          {extraHours > 0 && (
            <Row style={{ marginBottom: 8 }}>
              <Col span={12}>
                <Space>
                  <ClockCircleOutlined style={{ color: '#722ed1' }} />
                  <span>Tiền giờ thêm:</span>
                </Space>
              </Col>
              <Col span={12} style={{ textAlign: "right" }}>
                <Typography.Text strong>{formatPrice(extraHours * extraHourPrice)}</Typography.Text>
              </Col>
            </Row>
          )}
          
          <Divider style={{ margin: '16px 0' }} />
          
          <Row style={{ 
            fontWeight: "bold", 
            fontSize: 18,
            backgroundColor: '#f0f9ff',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #e6f7ff'
          }}>
            <Col span={12}>
              <Space>
                <DollarOutlined style={{ color: '#1890ff', fontSize: 20 }} />
                <span>Tổng cộng:</span>
              </Space>
            </Col>
            <Col span={12} style={{ textAlign: "right" }}>
              <Typography.Text strong style={{ color: '#1890ff', fontSize: 18 }}>
                {formatPrice(totalPrice)}
              </Typography.Text>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
}
