import {
  Table,
  Typography,
  message,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Drawer,
  Descriptions,
} from "antd";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { UserOutlined, PhoneOutlined, IdcardOutlined, EyeOutlined, CalendarOutlined } from "@ant-design/icons";
import { fetchBookings } from "../../services/booking.service";
import GuestSearchFilter from "../../components/Guests/GuestSearchFilter";
import type { Booking } from "../../types/booking";
import { env } from "../../constanst/getEnvs";
import axios from "axios";

const { Title } = Typography;

interface Guest {
  _id: string;
  fullName: string;
  age?: number;
  phoneNumber?: string;
  idNumber?: string;
  email?: string;
  isMainGuest: boolean;
  bookingId: string;
  bookingType: 'regular' | 'group';
  bookingInfo?: {
    checkIn: string;
    checkOut: string;
    roomNumber?: string;
    source?: string;
  };
  bookingData?: Booking | any;
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Search và Filter states
  const [searchText, setSearchText] = useState("");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterAge, setFilterAge] = useState<string>("all");
  const [searchParams] = useSearchParams();

  const loadGuests = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      
      // Fetch cả bookings thường và group bookings
      const [bookingsRes, groupBookingsRes] = await Promise.all([
        fetchBookings(page, limit),
        axios.get(`${env.API_URL}/api/v1/group-bookings`).catch(() => ({ data: { data: [] } }))
      ]);
      
      const bookings = bookingsRes.data || [];
      const groupBookings = groupBookingsRes.data?.data || [];
      
      // Chỉ hiển thị khách chính trong bảng chính
      const mainGuests: Guest[] = [];
      
      // Lấy guests từ bookings thường
      bookings.forEach((booking: Booking) => {
        if (booking.guests && booking.guests.length > 0) {
          // Chỉ lấy khách chính để hiển thị trong bảng
          const mainGuest = booking.guests.find(guest => guest.isMainGuest) || booking.guests[0];
          
          // Tính tuổi từ dateOfBirth nếu có
          let age: number | undefined;
          if (mainGuest.dateOfBirth) {
            const birthDate = new Date(mainGuest.dateOfBirth);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
          } else if (mainGuest.age) {
            // Nếu không có dateOfBirth nhưng có age, dùng age
            age = mainGuest.age;
          }
          
          mainGuests.push({
            _id: `${booking._id}-main`,
            fullName: mainGuest.fullName,
            age: age,
            phoneNumber: mainGuest.phoneNumber,
            idNumber: mainGuest.idNumber,
            email: mainGuest.email,
            isMainGuest: true,
            bookingId: booking._id,
            bookingType: 'regular',
            bookingInfo: {
              checkIn: booking.checkIn,
              checkOut: booking.checkOut,
              roomNumber: (booking.roomId as { roomNumber?: string })?.roomNumber,
              source: booking.source,
            },
            bookingData: booking,
          });
        }
      });
      
      // Lấy guests từ group bookings (chỉ lấy group bookings đã có members)
      groupBookings.forEach((groupBooking: any) => {
        // Chỉ lấy group bookings đã có members (status >= info_uploaded)
        if (groupBooking.members && groupBooking.members.length > 0) {
          // Lấy leader hoặc member đầu tiên làm khách chính
          const mainMember = groupBooking.members.find((m: any) => m.isLeader) || groupBooking.members[0];
          
          // Tính tuổi từ dateOfBirth nếu có
          let age: number | undefined;
          if (mainMember.dateOfBirth) {
            const birthDate = new Date(mainMember.dateOfBirth);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
          }
          
          // Lấy danh sách số phòng từ allocatedRoomIds
          const roomNumbers = groupBooking.allocatedRoomIds
            ?.map((room: any) => room.roomNumber || room)
            .filter(Boolean)
            .join(', ') || '-';
          
          mainGuests.push({
            _id: `${groupBooking._id}-main`,
            fullName: mainMember.fullName,
            age: age,
            phoneNumber: mainMember.phoneNumber || groupBooking.requesterPhone,
            idNumber: mainMember.idNumber,
            email: mainMember.email || groupBooking.requesterEmail,
            isMainGuest: true,
            bookingId: groupBooking._id,
            bookingType: 'group',
            bookingInfo: {
              checkIn: groupBooking.checkIn,
              checkOut: groupBooking.checkOut,
              roomNumber: roomNumbers,
              source: 'group',
            },
            bookingData: groupBooking,
          });
        }
      });
      
      setGuests(mainGuests);
      setFilteredGuests(mainGuests);
      setPagination({
        current: bookingsRes.pagination?.page || 1,
        pageSize: bookingsRes.pagination?.limit || 10,
        total: mainGuests.length,
      });
    } catch (e) {
      console.error(e);
      message.error("Không tải được danh sách khách hàng");
      setGuests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, []);

  // Filter guests based on search and filter criteria
  useEffect(() => {
    let filtered = [...guests];

    // Search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(guest =>
        guest.fullName?.toLowerCase().includes(searchLower) ||
        guest.phoneNumber?.toLowerCase().includes(searchLower) ||
        guest.idNumber?.toLowerCase().includes(searchLower) ||
        guest.email?.toLowerCase().includes(searchLower)
      );
    }

    // Source filter
    if (filterSource !== 'all') {
      if (filterSource === 'group') {
        filtered = filtered.filter(guest => guest.bookingType === 'group');
      } else {
        filtered = filtered.filter(guest => guest.bookingInfo?.source === filterSource);
      }
    }

    // Age filter
    if (filterAge !== 'all') {
      filtered = filtered.filter(guest => {
        const age = guest.age;
        if (!age) return false;
        
        switch (filterAge) {
          case 'under18':
            return age < 18;
          case '18-30':
            return age >= 18 && age <= 30;
          case '31-50':
            return age >= 31 && age <= 50;
          case 'over50':
            return age > 50;
          default:
            return true;
        }
      });
    }

    setFilteredGuests(filtered);
  }, [guests, searchText, filterSource, filterAge]);

  // Tự động mở chi tiết nếu có bookingId trong URL
  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    if (bookingId && guests.length > 0) {
      const targetGuest = guests.find(guest => guest.bookingId === bookingId);
      if (targetGuest && targetGuest.bookingData) {
        setSelectedBooking(targetGuest.bookingData);
        setOpenDetail(true);
        // Xóa parameter khỏi URL sau khi mở
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('bookingId');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [guests, searchParams]);

  const handleViewDetail = (record: Guest) => {
    setSelectedBooking(record.bookingData || null);
    setOpenDetail(true);
  };

  const columns = [
    {
      title: "Tên khách hàng",
      key: "fullName",
      width: 250,
      render: (_: unknown, record: Guest) => (
        <div>
          <Typography.Text strong>{record.fullName}</Typography.Text>
          <Tag 
            color={record.bookingType === 'group' ? "orange" : "blue"} 
            style={{ marginLeft: 8, fontSize: 12 }}
          >
            {record.bookingType === 'group' ? "Trưởng đoàn" : "Khách chính"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Tuổi",
      dataIndex: "age",
      key: "age",
      render: (age: number) => age ? `${age} tuổi` : "-",
    },
    {
      title: "Số điện thoại",
      key: "phoneNumber",
      render: (_: unknown, record: Guest) => (
        <Space>
          <PhoneOutlined style={{ color: '#52c41a' }} />
          <Typography.Text>{record.phoneNumber || "-"}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "CMND/CCCD",
      key: "idNumber",
      render: (_: unknown, record: Guest) => (
        <Space>
          <IdcardOutlined style={{ color: '#1890ff' }} />
          <Typography.Text>{record.idNumber || "-"}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Số khách",
      key: "guestCount",
      render: (_: unknown, record: Guest) => {
        const guestCount = record.bookingType === 'group' 
          ? (record.bookingData?.peopleCount || record.bookingData?.members?.length || 0)
          : (record.bookingData?.guestCount || record.bookingData?.guests?.length || 0);
        const hasAdditionalGuests = guestCount > 1;
        return (
          <div>
            <Tag color="cyan" icon={<UserOutlined />}>
              {guestCount} người
            </Tag>
            {hasAdditionalGuests && (
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                +{guestCount - 1} khách phụ
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: (
        <Space>
          <CalendarOutlined style={{ color: '#722ed1' }} />
          <span>Thời gian</span>
        </Space>
      ),
      key: "time",
      render: (_: unknown, record: Guest) => (
        <Space direction="vertical" size={0}>
          <Space size={4}>
            <CalendarOutlined style={{ color: '#52c41a', fontSize: 12 }} />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Nhận: {record.bookingInfo?.checkIn 
                ? new Date(record.bookingInfo.checkIn).toLocaleString("vi-VN")
                : "-"}
            </Typography.Text>
          </Space>
          <Space size={4}>
            <CalendarOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Trả: {record.bookingInfo?.checkOut 
                ? new Date(record.bookingInfo.checkOut).toLocaleString("vi-VN")
                : "-"}
            </Typography.Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_: unknown, record: Guest) => (
        <Button 
          type="link" 
          size="small" 
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const totalBookings = guests.length;
  const onlineBookings = guests.filter(g => g.bookingInfo?.source === 'online').length;
  const walkInBookings = guests.filter(g => g.bookingInfo?.source === 'walk_in').length;
  const groupBookings = guests.filter(g => g.bookingType === 'group').length;
  
  // Tính tổng số khách từ tất cả bookings
  const totalGuests = guests.reduce((sum, guest) => {
    if (guest.bookingType === 'group') {
      // Group booking: sử dụng peopleCount hoặc members.length
      return sum + (guest.bookingData?.peopleCount || guest.bookingData?.members?.length || 0);
    } else {
      // Regular booking: sử dụng guestCount hoặc guests.length
      return sum + (guest.bookingData?.guestCount || guest.bookingData?.guests?.length || 0);
    }
  }, 0);

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>
        <UserOutlined /> Quản lý khách hàng
      </Title>

      {/* Thống kê */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số booking"
              value={totalBookings}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số khách"
              value={totalGuests}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Booking Trực tuyến"
              value={onlineBookings}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Booking Trực tiếp"
              value={walkInBookings}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Booking Đoàn"
              value={groupBookings}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search và Filter */}
      <GuestSearchFilter
        searchText={searchText}
        onSearchChange={setSearchText}
        filterSource={filterSource}
        onSourceChange={setFilterSource}
        filterAge={filterAge}
        onAgeChange={setFilterAge}
        onClearFilters={() => {
          setSearchText("");
          setFilterSource("all");
          setFilterAge("all");
        }}
        totalCount={guests.length}
        filteredCount={filteredGuests.length}
      />

      <Table
        columns={columns}
        dataSource={filteredGuests}
        rowKey="_id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} khách hàng`,
        }}
        onChange={(p) => loadGuests(p.current, p.pageSize)}
        bordered
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Không có dữ liệu khách hàng" }}
      />

      {/* Drawer hiển thị chi tiết */}
      <Drawer
        title="Chi tiết khách hàng"
        open={openDetail}
        onClose={() => {
          setOpenDetail(false);
          setSelectedBooking(null);
        }}
        width={800}
      >
        {selectedBooking && (
          <div>
            {/* Thông tin booking */}
            <Card title="Thông tin booking" style={{ marginBottom: 16 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Mã booking">
                  {selectedBooking._id}
                </Descriptions.Item>
                <Descriptions.Item label="Phòng">
                  {selectedBooking.roomId 
                    ? ((selectedBooking.roomId as { roomNumber?: string })?.roomNumber || "-")
                    : (selectedBooking.allocatedRoomIds 
                        ?.map((room: any) => room.roomNumber || room)
                        .filter(Boolean)
                        .join(', ') || "-")
                  }
                </Descriptions.Item>
                <Descriptions.Item label="Ngày nhận">
                  {selectedBooking.checkIn
                    ? new Date(selectedBooking.checkIn).toLocaleString("vi-VN")
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày trả">
                  {selectedBooking.checkOut
                    ? new Date(selectedBooking.checkOut).toLocaleString("vi-VN")
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Nguồn">
                  <Tag color={
                    selectedBooking.source === "group" ? "orange" :
                    selectedBooking.source === "online" ? "blue" : "purple"
                  }>
                    {selectedBooking.source === "group" ? "Đoàn" :
                     selectedBooking.source === "online" ? "Trực tuyến" : "Trực tiếp"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(selectedBooking.totalPrice || selectedBooking.quoteAmount || 0)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Danh sách khách hàng */}
            <Card title={`Danh sách khách hàng (${
              selectedBooking.guests?.length || 
              selectedBooking.members?.length || 
              selectedBooking.peopleCount || 
              0
            } người)`}>
              {(selectedBooking.guests && selectedBooking.guests.length > 0) ? (
                <div>
                  {selectedBooking.guests.map((guest: any, index: number) => {
                    // Tính tuổi từ dateOfBirth
                    let age: number | undefined;
                    if (guest.dateOfBirth) {
                      const birthDate = new Date(guest.dateOfBirth);
                      const today = new Date();
                      age = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();
                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                      }
                    } else if (guest.age) {
                      // Nếu không có dateOfBirth nhưng có age, dùng age
                      age = guest.age;
                    }
                    
                    return (
                      <Card 
                        key={index} 
                        size="small" 
                        style={{ marginBottom: 12 }}
                        title={
                          <Space>
                            <UserOutlined />
                            <span>{guest.fullName}</span>
                            {guest.isMainGuest && (
                              <Tag color="blue" style={{ fontSize: 12 }}>Khách chính</Tag>
                            )}
                          </Space>
                        }
                      >
                        <Row gutter={[16, 8]}>
                          <Col span={12}>
                            <Space>
                              <IdcardOutlined style={{ color: '#1890ff' }} />
                              <Typography.Text strong>CMND/CCCD:</Typography.Text>
                              <Typography.Text>{guest.idNumber || "-"}</Typography.Text>
                            </Space>
                          </Col>
                          <Col span={12}>
                            <Space>
                              <Typography.Text strong>Tuổi:</Typography.Text>
                              <Typography.Text>{age ? `${age} tuổi` : "-"}</Typography.Text>
                            </Space>
                          </Col>
                          <Col span={12}>
                            <Space>
                              <PhoneOutlined style={{ color: '#52c41a' }} />
                              <Typography.Text strong>Điện thoại:</Typography.Text>
                              <Typography.Text>{guest.phoneNumber || "-"}</Typography.Text>
                            </Space>
                          </Col>
                        </Row>
                      </Card>
                    );
                  })}
                </div>
              ) : (selectedBooking.members && selectedBooking.members.length > 0) ? (
                <div>
                  {selectedBooking.members.map((member: any, index: number) => {
                    // Tính tuổi từ dateOfBirth
                    let age: number | undefined;
                    if (member.dateOfBirth) {
                      const birthDate = new Date(member.dateOfBirth);
                      const today = new Date();
                      age = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();
                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                      }
                    }
                    
                    return (
                      <Card 
                        key={index} 
                        size="small" 
                        style={{ marginBottom: 12 }}
                        title={
                          <Space>
                            <UserOutlined />
                            <span>{member.fullName}</span>
                            {member.isLeader && (
                              <Tag color="orange" style={{ fontSize: 12 }}>Trưởng đoàn</Tag>
                            )}
                            {member.roomNumber && (
                              <Tag color="blue" style={{ fontSize: 12 }}>Phòng {member.roomNumber}</Tag>
                            )}
                          </Space>
                        }
                      >
                        <Row gutter={[16, 8]}>
                          <Col span={12}>
                            <Space>
                              <IdcardOutlined style={{ color: '#1890ff' }} />
                              <Typography.Text strong>CMND/CCCD:</Typography.Text>
                              <Typography.Text>{member.idNumber || "-"}</Typography.Text>
                            </Space>
                          </Col>
                          <Col span={12}>
                            <Space>
                              <Typography.Text strong>Tuổi:</Typography.Text>
                              <Typography.Text>{age ? `${age} tuổi` : "-"}</Typography.Text>
                            </Space>
                          </Col>
                          <Col span={12}>
                            <Space>
                              <PhoneOutlined style={{ color: '#52c41a' }} />
                              <Typography.Text strong>Điện thoại:</Typography.Text>
                              <Typography.Text>{member.phoneNumber || "-"}</Typography.Text>
                            </Space>
                          </Col>
                          {member.email && (
                            <Col span={12}>
                              <Space>
                                <Typography.Text strong>Email:</Typography.Text>
                                <Typography.Text>{member.email}</Typography.Text>
                              </Space>
                            </Col>
                          )}
                        </Row>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Typography.Text type="secondary">
                  Không có thông tin khách hàng
                </Typography.Text>
              )}
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
}
