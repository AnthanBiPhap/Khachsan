import {
  Table,
  Typography,
  message,
  Button,
  Drawer,
  Descriptions,
  Tag,
  Alert
} from "antd";
import { CalendarOutlined, PlusOutlined, IdcardOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import BookingForm from "../../components/Booking/BookingForm";
import BookingSearchFilter from "../../components/Booking/BookingSearchFilter";
import BookingStatistics from "../../components/Booking/BookingStatistics";
import ExportButton from "../../components/Booking/ExportButton";
import type { Booking } from "../../types/booking";
import { fetchBookings, deleteBooking } from "../../services/booking.service";
import { env } from "../../constanst/getEnvs";
import { bookingColumns } from "../../components/Booking/BookingColumns";

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [openForm, setOpenForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailItem, setDetailItem] = useState<Booking | null>(null);
  
  // Search và Filter states
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  
  // Sort states
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Statistics states
  const [statistics, setStatistics] = useState({
    totalBookings: 0,
    currentGuests: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    pendingBookings: 0,
    paidBookings: 0
  });

  const loadBookings = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await fetchBookings(page, limit);
      const bookingsData = Array.isArray(res.data) ? res.data : [];
      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
      setPagination({
        current: res.pagination?.page || 1,
        pageSize: res.pagination?.limit || 10,
        total: res.pagination?.totalRecord || 0,
      });
      
      // Tính toán thống kê
      calculateStatistics(bookingsData);
    } catch (e) {
      console.error(e);
      message.error("Không tải được danh sách đặt phòng");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Function để tính toán thống kê
  const calculateStatistics = (bookingsData: Booking[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const totalBookings = bookingsData.length;
    let currentGuests = 0;
    let todayRevenue = 0;
    let monthRevenue = 0;
    let pendingBookings = 0;
    let paidBookings = 0;

    bookingsData.forEach(booking => {
      // Tính khách đang ở (check-in <= hôm nay < check-out)
      const checkIn = new Date(booking.checkIn || '');
      const checkOut = new Date(booking.checkOut || '');
      
      if (checkIn <= now && now < checkOut) {
        currentGuests += booking.guestCount || booking.guests?.length || 0;
      }

      // Tính doanh thu hôm nay
      const bookingDate = new Date(booking.createdAt || '');
      if (bookingDate >= today && booking.paymentStatus === 'paid') {
        todayRevenue += Number(booking.totalPrice) || 0;
      }

      // Tính doanh thu tháng này
      if (bookingDate >= monthStart && booking.paymentStatus === 'paid') {
        monthRevenue += Number(booking.totalPrice) || 0;
      }

      // Đếm trạng thái thanh toán
      if (booking.paymentStatus === 'pending') {
        pendingBookings++;
      } else if (booking.paymentStatus === 'paid') {
        paidBookings++;
      }
    });

    setStatistics({
      totalBookings,
      currentGuests,
      todayRevenue,
      monthRevenue,
      pendingBookings,
      paidBookings
    });
  };

  useEffect(() => {
    loadBookings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter, search và sort logic
  useEffect(() => {
    let filtered = [...bookings];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(booking => {
        const searchLower = searchText.toLowerCase();
        return (
          booking._id.toLowerCase().includes(searchLower) ||
          (booking.roomId as { roomNumber?: string })?.roomNumber?.toLowerCase().includes(searchLower) ||
          booking.guests?.some(guest => 
            guest.fullName?.toLowerCase().includes(searchLower) ||
            guest.phoneNumber?.includes(searchText)
          )
        );
      });
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(booking => booking.paymentStatus === filterStatus);
    }

    // Source filter
    if (filterSource !== "all") {
      filtered = filtered.filter(booking => booking.source === filterSource);
    }

    // Sort logic
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "createdAt": {
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        }
        case "checkIn": {
          aValue = new Date(a.checkIn || 0).getTime();
          bValue = new Date(b.checkIn || 0).getTime();
          break;
        }
        case "checkOut": {
          aValue = new Date(a.checkOut || 0).getTime();
          bValue = new Date(b.checkOut || 0).getTime();
          break;
        }
        case "totalPrice": {
          aValue = Number(a.totalPrice) || 0;
          bValue = Number(b.totalPrice) || 0;
          break;
        }
        case "paymentStatus": {
          aValue = a.paymentStatus || "";
          bValue = b.paymentStatus || "";
          break;
        }
        case "guestName": {
          const aGuest = a.guests?.find(guest => guest.isMainGuest) || a.guests?.[0];
          const bGuest = b.guests?.find(guest => guest.isMainGuest) || b.guests?.[0];
          aValue = aGuest?.fullName || a.customerId?.fullName || "";
          bValue = bGuest?.fullName || b.customerId?.fullName || "";
          break;
        }
        case "roomNumber": {
          aValue = (a.roomId as { roomNumber?: string })?.roomNumber || "";
          bValue = (b.roomId as { roomNumber?: string })?.roomNumber || "";
          break;
        }
        default: {
          aValue = a.createdAt || "";
          bValue = b.createdAt || "";
        }
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredBookings(filtered);
  }, [bookings, searchText, filterStatus, filterSource, sortField, sortOrder]);

  const handleDelete = async (id: string) => {
    try {
      await deleteBooking(id);
      message.success("Đã xóa đặt phòng thành công");
      loadBookings(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(error);
      message.error("Xóa đặt phòng thất bại");
    }
  };

  const handleSave = async (values: Partial<Booking>) => {
    try {
      const url = editingBooking
        ? `${env.API_URL}/api/v1/bookings/${editingBooking._id}`
        : `${env.API_URL}/api/v1/bookings`;

      const method = editingBooking ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBooking ? values : { ...values, source: 'walk_in' }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Có lỗi xảy ra");
      }

      message.success(
        editingBooking ? "Cập nhật thành công" : "Tạo đặt phòng thành công"
      );
      setOpenForm(false);
      loadBookings(pagination.current, pagination.pageSize);
      
      // Thông báo cho các trang khác refresh dữ liệu
      console.log('📢 Dispatching bookingUpdated event for booking:', editingBooking?._id);
      window.dispatchEvent(new CustomEvent('bookingUpdated', { 
        detail: { 
          bookingId: editingBooking?._id,
          action: editingBooking ? 'updated' : 'created',
          timestamp: new Date().toISOString()
        } 
      }));
    } catch (error: unknown) {
      console.error("Error saving booking:", error);
      message.error((error as Error)?.message || "Có lỗi xảy ra khi lưu đặt phòng");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <Typography.Title level={4}>
            <CalendarOutlined /> Quản lý đặt phòng
          </Typography.Title>
          <Alert
            message={
              <span style={{ fontSize: '13px', lineHeight: '1.6' }}>
                <IdcardOutlined style={{ marginRight: 12, fontSize: '12px' }} />
                <strong>Quy định check-in:</strong> Khi khách check-in phải cung cấp giấy tờ tùy thân (CMND/CCCD) để xác minh danh tính, đồng thời cung cấp đầy đủ họ tên, số điện thoại và tuổi.
              </span>

            }
            type="info"
            showIcon
            style={{
              marginTop: 8,
              fontSize: 12,
              padding: '8px 12px'
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ width: '100%' }}
            onClick={() => {
              setEditingBooking(null);
              setOpenForm(true);
            }}
          >
            Thêm đặt phòng
          </Button>
          <ExportButton 
            bookings={filteredBookings}
          />
        </div>
      </div>

      {/* Statistics */}
      <BookingStatistics
        totalBookings={statistics.totalBookings}
        currentGuests={statistics.currentGuests}
        todayRevenue={statistics.todayRevenue}
        monthRevenue={statistics.monthRevenue}
        pendingBookings={statistics.pendingBookings}
        paidBookings={statistics.paidBookings}
      />

      {/* Search và Filter */}
      <div style={{ width: '100%', minWidth: '800px' }}>
        <BookingSearchFilter
          searchText={searchText}
          onSearchChange={setSearchText}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          filterSource={filterSource}
          onSourceChange={setFilterSource}
          sortField={sortField}
          onSortFieldChange={setSortField}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          onClearFilters={() => {
            setSearchText("");
            setFilterStatus("all");
            setFilterSource("all");
            setSortField("createdAt");
            setSortOrder("desc");
          }}
          totalCount={bookings.length}
          filteredCount={filteredBookings.length}
        />
      </div>

      <Table
        columns={bookingColumns(
          (record) => {
            setEditingBooking(record);
            setOpenForm(true);
          },
          handleDelete,
          (record) => {
            setDetailItem(record);
            setOpenDetail(true);
          }
        )}
        dataSource={filteredBookings}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} đặt phòng`,
        }}
        onChange={(p) => loadBookings(p.current, p.pageSize)}
        bordered
        locale={{ emptyText: "Không có dữ liệu đặt phòng" }}
      />

      <BookingForm
        open={openForm}
        booking={editingBooking}
        onCancel={() => {
          setOpenForm(false);
          setEditingBooking(null);
        }}
        onSave={handleSave}
        loading={loading}
      />

      <Drawer
        title={detailItem ? `Chi tiết đặt phòng` : "Chi tiết đặt phòng"}
        open={openDetail}
        onClose={() => {
          setOpenDetail(false);
          setDetailItem(null);
        }}
        width={680}
      >
        {detailItem && (
          <Descriptions column={1} bordered size="middle">
            {/* <Descriptions.Item label="ID">{detailItem._id}</Descriptions.Item> */}
            <Descriptions.Item label="Khách hàng">
              {(() => {
                // Đảm bảo guests là array
                const guests = Array.isArray(detailItem.guests) ? detailItem.guests : [];
                const mainGuest = guests.find(guest => guest?.isMainGuest) || guests[0];
                
                const fullName = detailItem.customerId?.fullName || mainGuest?.fullName || "-";
                const phoneOrEmail = detailItem.customerId?.phoneNumber || 
                                   detailItem.customerId?.email || 
                                   mainGuest?.phoneNumber || 
                                   mainGuest?.email || "";
                
                return (
                  <div>
                    <div style={{ fontWeight: 500 }}>{String(fullName)}</div>
                    {phoneOrEmail && (
                      <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                        {String(phoneOrEmail)}
                      </div>
                    )}
                    {guests.length > 1 && (
                      <div style={{ color: "#1890ff", fontSize: 12, marginTop: 4 }}>
                        +{guests.length - 1} khách khác
                      </div>
                    )}
                  </div>
                );
              })()}
            </Descriptions.Item>


            <Descriptions.Item label="Phòng">
              {detailItem.roomId?.roomNumber ||
                (detailItem.roomId as { _id?: string })?._id ||
                "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Nhận/Trả">
              Nhận:{" "}
              {detailItem.checkIn
                ? new Date(detailItem.checkIn).toLocaleString("vi-VN")
                : "-"}{" "}
              | Trả:{" "}
              {detailItem.checkOut
                ? new Date(detailItem.checkOut).toLocaleString("vi-VN")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Số khách">
              {detailItem.guestCount || detailItem.guests?.length || 0} người
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(detailItem.totalPrice || 0)}
            </Descriptions.Item>
            <Descriptions.Item label="Thanh toán">
              <Tag
                color={
                  detailItem.paymentStatus === "pending"
                    ? "orange"
                    : detailItem.paymentStatus === "paid"
                    ? "green"
                    : detailItem.paymentStatus === "failed"
                    ? "red"
                    : "blue"
                }
              >
                {detailItem.paymentStatus}
              </Tag>
            </Descriptions.Item>
            {(() => {
              const guests = Array.isArray(detailItem.guests) ? detailItem.guests : [];
              if (guests.length === 0) return null;
              
              return (
                <Descriptions.Item label="Danh sách khách hàng" span={2}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Tag color="blue" icon={<UserOutlined />}>
                      {guests.length} khách hàng
                    </Tag>
                    <Button 
                      type="primary" 
                      size="small"
                      icon={<UserOutlined />}
                      onClick={() => {
                        // Chuyển đến trang Guests và mở chi tiết booking này
                        window.location.href = `/guests?bookingId=${detailItem._id}`;
                      }}
                    >
                      Xem khách hàng
                    </Button>
                  </div>
                </Descriptions.Item>
              );
            })()}
            
            <Descriptions.Item label="Ghi chú">
              {detailItem.notes || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Tạo lúc">
              {detailItem.createdAt
                ? new Date(detailItem.createdAt as string).toLocaleString("vi-VN")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật">
              {detailItem.updatedAt
                ? new Date(detailItem.updatedAt as string).toLocaleString("vi-VN")
                : "-"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
