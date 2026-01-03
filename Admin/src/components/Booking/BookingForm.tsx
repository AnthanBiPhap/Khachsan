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
import type { Booking, Room, GuestInfo } from "../../types/booking";
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
  const isEdit = !!booking;
  const watchCheckIn = Form.useWatch('checkIn', form);
  const watchCheckOut = Form.useWatch('checkOut', form);
  const watchExtraHours = Form.useWatch('extraHours', form);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [checkIn, setCheckIn] = useState<Dayjs | null>(null);
  const [checkOut, setCheckOut] = useState<Dayjs | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [extraHours, setExtraHours] = useState<number>(0);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<GuestInfo[]>([]);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [extendBlocked, setExtendBlocked] = useState<boolean>(false);
  const [maxExtraHoursEffective, setMaxExtraHoursEffective] = useState<number>(6);
  const [loadingAvailableRooms, setLoadingAvailableRooms] = useState<boolean>(false);
  const [pricingInfo, setPricingInfo] = useState<{
    totalPrice: number;
    breakdown: Array<{ date: Date; price: number; isBirthday: boolean }>;
    discountApplied: boolean;
    discountAmount: number;
  } | null>(null);

  // Walk-in khi không có customerId (đặt trực tiếp tại quầy)
  // const isWalkIn = !booking?.customerId;

  // Memoize guests string để tránh useEffect chạy lại không cần thiết
  const guestsString = useMemo(() => JSON.stringify(guests), [guests]);

  // Fetch pricing info with birthday discount
  useEffect(() => {
    const fetchPricingInfo = async () => {
      if (!selectedRoom || !checkIn || !checkOut) {
        setPricingInfo(null);
        return;
      }

      // Nếu không có guest nào hoặc guest chưa có dateOfBirth, không tính giá
      if (guests.length === 0 || !guests[0]?.dateOfBirth) {
        setPricingInfo(null);
        return;
      }

      try {
        const customerId = form.getFieldValue('customerId');
        const response = await axios.get("http://localhost:8080/api/v1/bookings/price/calculate", {
          params: {
            roomId: selectedRoom._id,
            checkIn: checkIn.toISOString(),
            checkOut: checkOut.toISOString(),
            customerId: customerId || undefined,
            guests: guestsString
          }
        });
        setPricingInfo(response.data?.data || null);
      } catch (error) {
        console.error('Error fetching pricing info:', error);
        setPricingInfo(null);
      }
    };

    // Debounce để tránh gọi API quá nhiều lần
    const timeoutId = setTimeout(() => {
      fetchPricingInfo();
    }, 300); // Đợi 300ms sau khi dependencies thay đổi

    return () => clearTimeout(timeoutId);
  }, [selectedRoom, checkIn, checkOut, guestsString, form]);

  const roomPrice = useMemo(() => {
    if (!selectedRoom || !checkIn || !checkOut) return 0;
    
    // Nếu có pricing info từ API, sử dụng giá đã tính có giảm giá
    if (pricingInfo) {
      return pricingInfo.totalPrice;
    }
    
    // Nếu không, tính giá bình thường
    const nights = checkOut.diff(checkIn, "day") || 1;
    return nights * (selectedRoom.typeId?.pricePerNight || 0);
  }, [selectedRoom, checkIn, checkOut, pricingInfo]);

  const extraHourPrice = useMemo(
    () => selectedRoom?.typeId?.extraHourPrice || 0,
    [selectedRoom]
  );
  const maxExtraHours = useMemo(
    () => selectedRoom?.typeId?.maxExtendHours ?? 6, // mặc định 6 giờ nếu chưa có dữ liệu
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

  // Disable ngày quá khứ / check-out phải sau check-in
  const disabledCheckInDate = (current: Dayjs) => {
    if (!current) return false;
    return current.startOf('day').valueOf() < dayjs().startOf('day').valueOf();
  };

  const disabledCheckOutDate = (current: Dayjs) => {
    if (!current) return false;
    const currentStart = current.startOf('day').valueOf();
    const todayStart = dayjs().startOf('day').valueOf();
    if (!checkIn) {
      return currentStart < todayStart;
    }
    const checkInStart = checkIn.startOf('day').valueOf();
    return currentStart <= checkInStart;
  };

  // Giới hạn số khách theo sức chứa loại phòng (mặc định 10 nếu chưa chọn phòng)
  const maxGuestAllowed = selectedRoom?.typeId?.capacity || 10;

  useEffect(() => {
    setCheckIn(watchCheckIn || null);
  }, [watchCheckIn]);

  useEffect(() => {
    setCheckOut(watchCheckOut || null);
  }, [watchCheckOut]);

  useEffect(() => {
    setExtraHours(watchExtraHours || 0);
  }, [watchExtraHours]);

  useEffect(() => {
    if (guestCount > maxGuestAllowed) {
      setGuestCount(maxGuestAllowed);
    }
  }, [maxGuestAllowed]);

  useEffect(() => {
    // reset block state when room changes
    setExtendBlocked(false);
    setMaxExtraHoursEffective(maxExtraHours);
  }, [selectedRoom?._id, maxExtraHours]);

  // Giới hạn giờ thêm theo maxExtendHours của loại phòng
  useEffect(() => {
    if (extraHours > maxExtraHours) {
      setExtraHours(maxExtraHours);
    }
  }, [maxExtraHours, extraHours]);

  // Hiển thị số liệu thanh toán theo dữ liệu hiện tại trên form / dữ liệu booking
  const displayTotalAmount = booking?.totalPrice ?? totalPrice;
  const displayPaidAmount = booking?.paidAmount ?? 0;
  const displayRemainingAmount =
    booking?.remainingAmount ?? Math.max(displayTotalAmount - displayPaidAmount, 0);

  // Fetch rooms, services
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes] = await Promise.all([
          axios.get("http://localhost:8080/api/v1/services"),
        ]);
        // Chỉ hiển thị dịch vụ có trạng thái active
        const allServices = servicesRes.data?.data?.data || [];
        const activeServices = allServices.filter((service: any) => service.status === 'active');
        setServices(activeServices);
        console.log('Services loaded:', activeServices.length, 'active services out of', allServices.length);
      } catch (err) {
        console.error(err);
        message.error("Không thể tải dữ liệu");
      }
    };
    fetchData();
  }, []);

  // Fetch available rooms from API (check both regular bookings and group bookings)
  useEffect(() => {
    const fetchAvailableRooms = async () => {
      if (!checkIn || !checkOut) {
        setAvailableRooms([]);
        setSelectedRoom(null);
        form.setFieldValue("roomId", undefined);
        return;
      }

      setLoadingAvailableRooms(true);
      try {
        const response = await axios.get("http://localhost:8080/api/v1/rooms/available", {
          params: {
            checkIn: checkIn.hour(14).minute(0).second(0).toISOString(),
            checkOut: checkOut.hour(12).minute(0).second(0).toISOString(),
            extendHours: extraHours || 0,
            excludeBookingId: booking?._id || undefined,
          },
        });
        const availableRoomsData = response.data?.data?.rooms || [];
        setAvailableRooms(availableRoomsData);
        
        // Nếu đang edit booking, cập nhật selectedRoom với full data từ API
        if (selectedRoom) {
          const foundRoom = availableRoomsData.find((r: Room) => r._id === selectedRoom._id);
          if (foundRoom) {
            // Update selected room với full data từ API
            setSelectedRoom(foundRoom);
            form.setFieldValue("roomId", foundRoom._id);
            setExtendBlocked(false);
            setMaxExtraHoursEffective(foundRoom.typeId?.maxExtendHours ?? maxExtraHours);
          } else if (booking) {
            // Phòng đang sửa không còn trống cho khoảng thời gian mới (kể cả gia hạn)
            setExtendBlocked(true);
            setMaxExtraHoursEffective(extraHours); // giữ nguyên số giờ hiện tại, không cho tăng thêm
          } else {
            // Chỉ reset nếu không phải đang edit booking
            setSelectedRoom(null);
            form.setFieldValue("roomId", undefined);
          }
        }
      } catch (err) {
        console.error("Error fetching available rooms:", err);
        setAvailableRooms([]);
      } finally {
        setLoadingAvailableRooms(false);
      }
    };

    fetchAvailableRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIn, checkOut, extraHours, booking?._id]);

  // Initialize guests when guestCount changes
  useEffect(() => {
    if (guestCount <= 0) return;
    
    const newGuests = Array.from({ length: guestCount }, (_, index) => {
      const existingGuest = guests[index];
      return {
        fullName: existingGuest?.fullName || "",
        phoneNumber: existingGuest?.phoneNumber || "",
        idNumber: existingGuest?.idNumber || "",
        dateOfBirth: existingGuest?.dateOfBirth || "",
        email: existingGuest?.email || "",
        isMainGuest: index === 0,
      };
    });
    
    // Only update if the structure actually changed
    if (newGuests.length !== guests.length || 
        newGuests.some((guest, index) => 
          guest.fullName !== guests[index]?.fullName ||
          guest.phoneNumber !== guests[index]?.phoneNumber ||
          guest.idNumber !== guests[index]?.idNumber ||
          guest.dateOfBirth !== guests[index]?.dateOfBirth ||
          guest.email !== guests[index]?.email
        )) {
      setGuests(newGuests);
    }
  }, [guestCount, guests]);

  // Fill form when editing
  useEffect(() => {
    if (booking) {
      form.setFieldsValue({
        ...booking,
        checkIn: booking.checkIn ? dayjs(booking.checkIn) : null,
        checkOut: booking.checkOut ? dayjs(booking.checkOut) : null,
        guestCount: booking.guestCount || booking.guests?.length || 1,
        extraHours: (booking as Booking & { extendHours?: number }).extendHours || 0,
      });
      const bookingCheckIn = booking.checkIn ? dayjs(booking.checkIn) : null;
      const bookingCheckOut = booking.checkOut ? dayjs(booking.checkOut) : null;
      setCheckIn(bookingCheckIn);
      setCheckOut(bookingCheckOut);
      setExtraHours((booking as Booking & { extendHours?: number }).extendHours || 0);
      setGuestCount(booking.guestCount || booking.guests?.length || 1);
      setGuests(booking.guests || []);

      // Set selected room from booking (will be updated when available rooms are fetched)
      const roomIdValue = (booking.roomId as Room)?._id || booking.roomId;
      if (roomIdValue && booking.roomId) {
        // Use booking room data directly, will be validated when available rooms are fetched
        const bookingRoom = booking.roomId as any;
        setSelectedRoom({
          _id: roomIdValue,
          roomNumber: bookingRoom.roomNumber || "",
          typeId: bookingRoom.typeId || null,
        } as Room);
      }

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
      setGuests([]);
      setGuestCount(1);
    }
  }, [booking, form]);

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

      // Validate ngày không hợp lệ
      const today = dayjs().startOf('day');
      if (checkIn.startOf('day').valueOf() < today.valueOf()) {
        return message.error("Ngày nhận phòng không được trước ngày hiện tại");
      }
      const checkInStart = checkIn.startOf('day').valueOf();
      const checkOutStart = checkOut.startOf('day').valueOf();
      if (checkOutStart <= checkInStart) {
        return message.error("Ngày trả phòng phải sau ngày nhận phòng");
      }

      // Validate bắt buộc cho từng khách
      for (let i = 0; i < guests.length; i++) {
        const g = guests[i];
        if (!g.fullName?.trim()) {
          return message.error(`Khách ${i + 1}: Vui lòng nhập họ và tên`);
        }
        if (!g.phoneNumber?.trim()) {
          return message.error(`Khách ${i + 1}: Vui lòng nhập số điện thoại`);
        }
        if (!g.idNumber?.trim()) {
          return message.error(`Khách ${i + 1}: Vui lòng nhập CMND/CCCD`);
        }
        if (!g.dateOfBirth) {
          return message.error(`Khách ${i + 1}: Vui lòng chọn ngày sinh`);
        }
      }

      // Validate độ tuổi >= 18 cho tất cả khách
      for (let i = 0; i < guests.length; i++) {
        const guest = guests[i];
        if (guest.dateOfBirth) {
          const age = Math.floor((new Date().getTime() - new Date(guest.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
          if (age < 18) {
            return message.error(`Khách ${i + 1} (${guest.fullName}) phải từ 18 tuổi trở lên để đặt phòng`);
          }
        }
      }

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
        guests: guests, // Sử dụng mảng khách hàng mới
        guestCount: guestCount, // Số lượng khách
        services: selectedServices.map((s) => ({
          serviceId: s.serviceId,
          name: s.name,
          price: s.price,
          quantity: s.quantity,
        })),
      };

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
      destroyOnHidden={true}
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
              <Tag color="blue">{guestCount} khách</Tag>
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Form.Item
                name="guestCount"
                label={
                  <Space>
                    <UserOutlined />
                    <span>Số lượng khách</span>
                  </Space>
                }
                rules={[{ required: true, message: "Nhập số lượng khách" }]}
              >
                <InputNumber
                  min={1}
                  max={maxGuestAllowed}
                  style={{ width: "100%" }}
                  placeholder="Số khách"
                  onChange={(value) => setGuestCount(value || 1)}
                />
              </Form.Item>
            </Col>
          </Row>

          {selectedRoom?.typeId?.capacity && (
            <Row style={{ marginTop: -8, marginBottom: 8 }}>
              <Col span={12}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Tối đa {selectedRoom.typeId.capacity} khách theo loại phòng
                </Typography.Text>
              </Col>
            </Row>
          )}

          {guests.map((guest, index) => (
            <Card 
              key={`guest-${index}`}
              size="small" 
              style={{ marginBottom: 12 }}
              title={
                <Space>
                  <span>{guest.isMainGuest ? "Khách chính" : `Khách ${index + 1}`}</span>
                  {index === 0 && <Tag color="green">Người đặt phòng</Tag>}
                </Space>
              }
            >
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                      <Space size={6} align="center">
                        <UserOutlined />
                        <span>
                          Họ và tên <span style={{ color: '#ff4d4f' }}>*</span>
                        </span>
                      </Space>
                    </label>
                    <Input 
                      value={guest.fullName}
                      onChange={(e) => {
                        const newGuests = [...guests];
                        newGuests[index].fullName = e.target.value;
                        setGuests(newGuests);
                      }}
                      placeholder="Nhập họ và tên" 
                      prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                      <Space size={6} align="center">
                        <PhoneOutlined />
                        <span>
                          Số điện thoại <span style={{ color: '#ff4d4f' }}>*</span>
                        </span>
                      </Space>
                    </label>
                    <Input 
                      value={guest.phoneNumber}
                      onChange={(e) => {
                        const newGuests = [...guests];
                        newGuests[index].phoneNumber = e.target.value;
                        setGuests(newGuests);
                      }}
                      placeholder="Nhập số điện thoại" 
                      prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                    />
                  </div>
                </Col>
              </Row>

              <Row gutter={[16, 8]}>
                <Col span={8}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                      <Space size={6} align="center">
                        <IdcardOutlined />
                        <span>
                          CMND/CCCD <span style={{ color: '#ff4d4f' }}>*</span>
                        </span>
                      </Space>
                    </label>
                    <Input 
                      value={guest.idNumber}
                      onChange={(e) => {
                        const newGuests = [...guests];
                        newGuests[index].idNumber = e.target.value;
                        setGuests(newGuests);
                      }}
                      placeholder="Số CMND/CCCD" 
                      prefix={<IdcardOutlined style={{ color: '#bfbfbf' }} />}
                    />
                  </div>
                </Col>
                <Col span={8}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                      <Space size={6} align="center">
                        <CalendarOutlined />
                        <span>
                          Ngày sinh <span style={{ color: '#ff4d4f' }}>*</span>
                        </span>
                      </Space>
                    </label>
                    <DatePicker
                      value={guest.dateOfBirth ? dayjs(guest.dateOfBirth) : null}
                      onChange={(date) => {
                        const newGuests = [...guests];
                        newGuests[index].dateOfBirth = date ? date.toISOString() : '';
                        setGuests(newGuests);
                      }}
                      style={{ width: "100%" }}
                      placeholder="Chọn ngày sinh"
                      format="DD/MM/YYYY"
                    />
                    {guest.dateOfBirth && (
                      <p style={{ fontSize: '11px', color: '#8c8c8c', marginTop: 4 }}>
                        Tuổi: {Math.floor((new Date().getTime() - new Date(guest.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} tuổi
                      </p>
                    )}
                  </div>
                </Col>
                <Col span={8}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                      Email
                    </label>
                    <Input 
                      value={guest.email}
                      onChange={(e) => {
                        const newGuests = [...guests];
                        newGuests[index].email = e.target.value;
                        setGuests(newGuests);
                      }}
                      placeholder="Nhập email (nếu có)" 
                      prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          ))}
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
                required={false}
                label={
                  <Space>
                    <CalendarOutlined />
                    <span>
                      Ngày nhận phòng <span style={{ color: '#ff4d4f' }}>*</span>
                    </span>
                  </Space>
                }
                rules={[{ required: true, message: "Vui lòng chọn ngày nhận phòng" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  disabledDate={disabledCheckInDate}
                  disabled={isEdit}
                  placeholder="Chọn ngày nhận phòng"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="checkOut"
                required={false}
                label={
                  <Space>
                    <CalendarOutlined />
                    <span>
                      Ngày trả phòng <span style={{ color: '#ff4d4f' }}>*</span>
                    </span>
                  </Space>
                }
                rules={[{ required: true, message: "Vui lòng chọn ngày trả phòng" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  disabledDate={disabledCheckOutDate}
                  disabled={isEdit}
                  placeholder="Chọn ngày trả phòng"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Form.Item
                name="roomId"
                required={false}
                label={
                  <Space>
                    <HomeOutlined />
                    <span>
                      Chọn phòng <span style={{ color: '#ff4d4f' }}>*</span>
                    </span>
                    {loadingAvailableRooms ? (
                      <Tag color="processing">Đang kiểm tra...</Tag>
                    ) : availableRooms.length > 0 ? (
                      <Tag color="green">{availableRooms.length} phòng trống</Tag>
                    ) : checkIn && checkOut ? (
                      <Tag color="red">Không có phòng trống</Tag>
                    ) : null}
                  </Space>
                }
                rules={[{ required: true, message: "Vui lòng chọn phòng" }]}
              >
                <Select
                  placeholder={
                    !checkIn || !checkOut
                      ? "Vui lòng chọn ngày nhận phòng và ngày trả phòng trước"
                      : loadingAvailableRooms
                      ? "Đang kiểm tra phòng trống..."
                      : availableRooms.length === 0
                      ? "Không có phòng trống trong khoảng thời gian này"
                      : "Chọn phòng"
                  }
                  disabled={isEdit || !checkIn || !checkOut || loadingAvailableRooms}
                  loading={loadingAvailableRooms}
                  options={availableRooms.map((r) => ({
                    label: `${r.roomNumber} - ${r.typeId?.name} (${r.typeId?.capacity || 0} người)`,
                    value: r._id,
                  }))}
                  onChange={(v) =>
                    setSelectedRoom(
                      availableRooms.find((r) => r._id === v) || null
                    )
                  }
                  value={selectedRoom?._id}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="extraHours"
                label={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'nowrap' }}>
                    <ClockCircleOutlined />
                    <span>Thêm giờ</span>
                    <Tag color={extendBlocked ? 'red' : 'blue'}>
                      {extendBlocked ? 'Phòng đã có khách kế tiếp' : `Max ${maxExtraHoursEffective}h`}
                    </Tag>
                  </div>
                }
              >
                <InputNumber
                  min={0}
                  max={maxExtraHoursEffective}
                  style={{ width: "100%" }}
                  value={extraHours}
                  onChange={(v) => setExtraHours(v || 0)}
                  disabled={extendBlocked}
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
                <Tag color="orange" style={{ display: 'flex', justifyContent: 'center' }}>Chờ thanh toán</Tag>
              </Select.Option>
              <Select.Option value="partial_paid">
                <Tag color="blue" style={{ display: 'flex', justifyContent: 'center' }}>Thanh toán 50%</Tag>
              </Select.Option>
              <Select.Option value="paid">
                <Tag color="green" style={{ display: 'flex', justifyContent: 'center' }}>Đã thanh toán đủ</Tag>
              </Select.Option>
              <Select.Option value="failed">
                <Tag color="red" style={{ display: 'flex', justifyContent: 'center' }}>Thanh toán thất bại</Tag>
              </Select.Option>
              <Select.Option value="refunded">
                <Tag color="blue" style={{ display: 'flex', justifyContent: 'center' }}>Đã hoàn tiền</Tag>
              </Select.Option>
            </Select>
            </Form.Item>
          
          <Divider style={{ margin: '16px 0' }} />
          
          {/* Thông tin thanh toán chi tiết */}
          {booking && (
            <Row style={{ marginBottom: 16, padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
              <Col span={24}>
                <Typography.Text strong style={{ color: '#1890ff', fontSize: '14px' }}>
                  Thông tin thanh toán chi tiết:
                </Typography.Text>
                <div style={{ marginTop: 8 }}>
                  <Row style={{ marginBottom: 4 }}>
                    <Col span={12}>Tổng giá trị:</Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <Typography.Text strong>{formatPrice(displayTotalAmount)}</Typography.Text>
                    </Col>
                  </Row>
                  <Row style={{ marginBottom: 4 }}>
                    <Col span={12}>Đã thanh toán:</Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <Typography.Text strong style={{ color: '#52c41a' }}>
                        {formatPrice(displayPaidAmount)}
                      </Typography.Text>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}>Còn lại:</Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <Typography.Text strong style={{ color: '#fa8c16' }}>
                        {formatPrice(displayRemainingAmount)}
                      </Typography.Text>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          )}
          
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
          
          {pricingInfo && pricingInfo.discountApplied && (
            <Row style={{ marginBottom: 8, padding: '8px', backgroundColor: '#f6ffed', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
              <Col span={12}>
                <Space>
                  <InfoCircleOutlined style={{ color: '#52c41a' }} />
                  <span style={{ fontWeight: 500, color: '#52c41a' }}>Giảm giá sinh nhật (50%):</span>
                </Space>
              </Col>
              <Col span={12} style={{ textAlign: "right" }}>
                <Typography.Text strong style={{ color: '#52c41a' }}>
                  -{formatPrice(pricingInfo.discountAmount)}
                </Typography.Text>
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
                <DollarOutlined style={{ color: '#1890ff', fontSize: 16, marginTop: 6 }} />
                <span style={{ fontSize: 16 }}>Tổng cộng:</span>
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
