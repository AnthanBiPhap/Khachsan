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
import { UserOutlined, PhoneOutlined, IdcardOutlined, EyeOutlined } from "@ant-design/icons";
import { fetchBookings } from "../../services/booking.service";
import GuestSearchFilter from "../../components/Guests/GuestSearchFilter";
import type { Booking } from "../../types/booking";

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
  bookingInfo?: {
    checkIn: string;
    checkOut: string;
    roomNumber?: string;
    source?: string;
  };
  bookingData?: Booking;
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
      const res = await fetchBookings(page, limit);
      const bookings = res.data || [];
      
      // Chỉ hiển thị khách chính trong bảng chính
      const mainGuests: Guest[] = [];
      bookings.forEach((booking: Booking) => {
        if (booking.guests && booking.guests.length > 0) {
          // Chỉ lấy khách chính để hiển thị trong bảng
          const mainGuest = booking.guests.find(guest => guest.isMainGuest) || booking.guests[0];
          
          mainGuests.push({
            _id: booking._id,
            fullName: mainGuest.fullName,
            age: mainGuest.age,
            phoneNumber: mainGuest.phoneNumber,
            idNumber: mainGuest.idNumber,
            email: mainGuest.email,
            isMainGuest: true,
            bookingId: booking._id,
            bookingInfo: {
              checkIn: booking.checkIn,
              checkOut: booking.checkOut,
              roomNumber: (booking.roomId as { roomNumber?: string })?.roomNumber,
              source: booking.source,
            },
            // Lưu thông tin booking đầy đủ để hiển thị chi tiết
            bookingData: booking,
          });
        }
      });
      
      setGuests(mainGuests);
      setFilteredGuests(mainGuests);
      setPagination({
        current: res.pagination?.page || 1,
        pageSize: res.pagination?.limit || 10,
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
      filtered = filtered.filter(guest => guest.bookingInfo?.source === filterSource);
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
      render: (_: unknown, record: Guest) => (
        <div>
          <Typography.Text strong>{record.fullName}</Typography.Text>
          <Tag color="blue" style={{ marginLeft: 8, fontSize: 12 }}>
            Khách chính
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
      title: "Booking",
      key: "booking",
      render: (_: unknown, record: Guest) => (
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Mã: {record.bookingId.slice(0, 8)}...
          </Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Phòng: {record.bookingInfo?.roomNumber || "-"}
          </Typography.Text>
          <br />
          <Tag color={record.bookingInfo?.source === "online" ? "blue" : "purple"} style={{ fontSize: 12 }}>
            {record.bookingInfo?.source === "online" ? "Online" : "Walk-in"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Số khách",
      key: "guestCount",
      render: (_: unknown, record: Guest) => {
        const guestCount = record.bookingData?.guestCount || record.bookingData?.guests?.length || 0;
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
      title: "Thời gian",
      key: "time",
      render: (_: unknown, record: Guest) => (
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Nhận: {record.bookingInfo?.checkIn 
              ? new Date(record.bookingInfo.checkIn).toLocaleDateString("vi-VN")
              : "-"}
          </Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Trả: {record.bookingInfo?.checkOut 
              ? new Date(record.bookingInfo.checkOut).toLocaleDateString("vi-VN")
              : "-"}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
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
  
  // Tính tổng số khách từ tất cả bookings
  const totalGuests = guests.reduce((sum, guest) => {
    const guestCount = guest.bookingData?.guestCount || guest.bookingData?.guests?.length || 0;
    return sum + guestCount;
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
              title="Booking Online"
              value={onlineBookings}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Booking Walk-in"
              value={walkInBookings}
              valueStyle={{ color: '#722ed1' }}
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
                  {(selectedBooking.roomId as { roomNumber?: string })?.roomNumber || "-"}
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
                  <Tag color={selectedBooking.source === "online" ? "blue" : "purple"}>
                    {selectedBooking.source === "online" ? "Online" : "Walk-in"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(selectedBooking.totalPrice)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Danh sách khách hàng */}
            <Card title={`Danh sách khách hàng (${selectedBooking.guests?.length || 0} người)`}>
              {selectedBooking.guests && selectedBooking.guests.length > 0 ? (
                <div>
                  {selectedBooking.guests.map((guest, index) => (
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
                            <Typography.Text>{guest.age ? `${guest.age} tuổi` : "-"}</Typography.Text>
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
                  ))}
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
