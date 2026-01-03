import {
  Table,
  Typography,
  message,
  Drawer,
  Descriptions,
  Tag,
  Alert,
  Space,
} from "antd";
import { useEffect, useState } from "react";
import { CalendarOutlined, HomeOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import BookingForm from "../../components/BookingStatus/BookingStatusForm";
import BookingStatusSearchFilter from "../../components/BookingStatus/BookingStatusSearchFilter";
import type { BookingStatusLog } from "../../types/bookingstatus";
import {
  fetchBookings,
  deleteBooking,
} from "../../services/bookingStatus.service";
import { env } from "../../constanst/getEnvs";
import { bookingStatusColumns } from "../../components/BookingStatus/BookingStatusColumns";

// Dịch nhanh các trạng thái thanh toán trong ghi chú (ví dụ: "failed → paid")
const translatePaymentStatusText = (text: string) => {
  if (!text) return text;
  const map: Record<string, string> = {
    refunded: "Đã hoàn tiền",
    refund_requested: "Yêu cầu hoàn tiền",
    pending: "Chờ thanh toán",
    partial_paid: "Thanh toán 50%",
    paid: "Đã thanh toán đủ",
    failed: "Thanh toán thất bại",
    cancelled: "Đã hủy",
  };
  return text.replace(/\b(refunded|refund_requested|pending|partial_paid|paid|failed|cancelled)\b/g, (m) => map[m] || m);
};

// Dịch trạng thái hành động (action) trong log
const translateActionText = (action?: string) => {
  if (!action) return "";
  const map: Record<string, string> = {
    check_in: "Check-in",
    check_out: "Check-out",
    cancelled: "Hủy đặt phòng",
    confirmed: "Đã xác nhận",
    extend: "Gia hạn",
    extend_check_out: "Lùi giờ trả",
    pending: "Chờ xác nhận",
    paid: "Đã thanh toán",
    refunded: "Hoàn tiền",
    refund_requested: "Yêu cầu hoàn tiền",
    failed: "Thanh toán thất bại",
    updated: "Cập nhật thông tin",
  };
  return map[action] || action;
};

export default function BookingPage() {
  const [bookings, setBookings] = useState<BookingStatusLog[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingStatusLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [openForm, setOpenForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingStatusLog | null>(
    null
  );
  const [openDetail, setOpenDetail] = useState(false);
  const [detailItem, setDetailItem] = useState<BookingStatusLog | null>(null);
  
  // Search và Filter states
  const [searchText, setSearchText] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");

  const loadBookings = async (page = 1, limit = 10) => {
    //bookingStatus
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
    } catch (e) {
      console.error(e);
      message.error("Không tải được danh sách đặt phòng");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // Filter và search logic
  useEffect(() => {
    let filtered = [...bookings];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(booking => {
        const searchLower = searchText.toLowerCase();
        return (
          booking._id.toLowerCase().includes(searchLower) ||
          booking.actorName?.toLowerCase().includes(searchLower) ||
          booking.bookingId?._id?.toLowerCase().includes(searchLower) ||
          (booking.bookingId as any)?.roomNumber?.toLowerCase().includes(searchLower) ||
          booking.bookingId?.guests?.some((guest: any) => 
            guest.fullName?.toLowerCase().includes(searchLower) ||
            guest.phoneNumber?.includes(searchText)
          )
        );
      });
    }

    // Action filter
    if (filterAction !== "all") {
      filtered = filtered.filter(booking => booking.action === filterAction);
    }

    // Source filter
    if (filterSource !== "all") {
      filtered = filtered.filter(booking => booking.bookingId?.source === filterSource);
    }

    setFilteredBookings(filtered);
  }, [bookings, searchText, filterAction, filterSource]);

  // Lắng nghe event từ trang Booking để refresh dữ liệu
  useEffect(() => {
    const handleBookingUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🔄 BookingStatusPage received bookingUpdated event:', customEvent.detail);
      // Delay một chút để đảm bảo backend đã xử lý xong
      setTimeout(() => {
        console.log('🔄 Refreshing booking status data...');
        loadBookings(pagination.current, pagination.pageSize);
      }, 1000); // Tăng delay để đảm bảo backend đã xử lý xong
    };

    window.addEventListener('bookingUpdated', handleBookingUpdated);
    
    return () => {
      window.removeEventListener('bookingUpdated', handleBookingUpdated);
    };
  }, [pagination.current, pagination.pageSize]); // Thêm dependency để tránh stale closure

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

  const handleSave = async (values: Partial<BookingStatusLog>) => {
    try {
      const url = editingBooking
        ? `${env.API_URL}/api/v1/bookingStatus/${editingBooking._id}`
        : `${env.API_URL}/api/v1/bookingStatus`;

      const method = editingBooking ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Có lỗi xảy ra");
      }

      message.success(
        editingBooking ? "Cập nhật thành công" : "Tạo log thành công"
      );
      setOpenForm(false);
      loadBookings(pagination.current, pagination.pageSize);
    } catch (error: any) {
      console.error("Error saving booking:", error);
      message.error(error.message || "Có lỗi xảy ra khi lưu đặt phòng");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div>
          <Typography.Title level={4}>
            <CalendarOutlined /> Nhật ký trạng thái đặt phòng
          </Typography.Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            <Alert
              message={
                <span style={{ fontSize: '13px', lineHeight: '1.6' }}>
                  <CalendarOutlined style={{ marginRight: 12, fontSize: '12px' }} />
                  <strong>Quy định ghi log:</strong> Mọi thay đổi trạng thái đặt phòng phải được ghi lại đầy đủ với thông tin người thao tác, thời gian và lý do thay đổi.
                </span>
              }
              type="info"
              showIcon
              style={{
                fontSize: 12,
                padding: '8px 12px'
              }}
            />
            
            <Alert
              message={
                <span style={{ fontSize: '13px', lineHeight: '1.6' }}>
                  <CalendarOutlined style={{ marginRight: 12, fontSize: '12px' }} />
                  <strong>Quy định check-in/check-out:</strong> Khách check-in phải được xác nhận bởi nhân viên lễ tân. Check-out phải được thực hiện trước 12:00 trưa ngày trả phòng.
                </span>
              }
              type="warning"
              showIcon
              style={{
                fontSize: 12,
                padding: '8px 12px'
              }}
            />
            
           
          </div>
        </div>
        {/* <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingBooking(null);
            setOpenForm(true);
          }}
        >
          Thêm log
        </Button> */}
      </div>

      <div style={{ width: '100%', minWidth: '800px' }}>
        <BookingStatusSearchFilter
          searchText={searchText}
          onSearchChange={setSearchText}
          filterAction={filterAction}
          onActionChange={setFilterAction}
          filterSource={filterSource}
          onSourceChange={setFilterSource}
          onClearFilters={() => {
            setSearchText("");
            setFilterAction("all");
            setFilterSource("all");
          }}
          totalCount={bookings.length}
          filteredCount={filteredBookings.length}
        />
      </div>

      <Table
        columns={bookingStatusColumns(
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
          showTotal: (total) => `Tổng ${total} log`,
        }}
        onChange={(p) => loadBookings(p.current, p.pageSize)}
        bordered
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Không có dữ liệu log" }}
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
        title={detailItem ? `Chi tiết log` : "Chi tiết log"}
        open={openDetail}
        onClose={() => {
          setOpenDetail(false);
          setDetailItem(null);
        }}
        width={680}
      >
        {detailItem && (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="ID Log">
              <code style={{ fontSize: 12, background: '#f5f5f5', padding: '2px 6px', borderRadius: 3 }}>
                {detailItem._id}
              </code>
            </Descriptions.Item>
            <Descriptions.Item label="Booking">
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>
                  <code style={{ fontSize: 12, background: '#f5f5f5', padding: '2px 6px', borderRadius: 3 }}>
                    {detailItem.bookingId?._id?.slice(0, 8)}...
                  </code>
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  <Space size={4}>
                    <CalendarOutlined />
                    <span>
                      Nhận: {detailItem.bookingId?.checkIn
                        ? new Date(detailItem.bookingId.checkIn).toLocaleString("vi-VN")
                        : "-"}
                    </span>
                  </Space>
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  <Space size={4}>
                    <CalendarOutlined />
                    <span>
                      Trả: {detailItem.bookingId?.checkOut
                        ? new Date(detailItem.bookingId.checkOut).toLocaleString("vi-VN")
                        : "-"}
                    </span>
                  </Space>
                </div>
                {detailItem.bookingId?.roomNumber && (
                  <div style={{ fontSize: 12, color: '#666' }}>
                    <Space size={4}>
                      <HomeOutlined />
                      <span>Phòng: {detailItem.bookingId.roomNumber}</span>
                    </Space>
                  </div>
                )}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Người thao tác">
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>
                  {detailItem.actorName || 
                   (detailItem.actorId as any)?.fullName ||
                   (detailItem.actorId as any)?._id ||
                   "Admin / Lễ tân"}
                </div>
                {(detailItem.actorId as any)?.email && (
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
                    <Space size={4}>
                      <MailOutlined />
                      <span>{(detailItem.actorId as any).email}</span>
                    </Space>
                  </div>
                )}
                {(detailItem.actorId as any)?.phoneNumber && (
                  <div style={{ fontSize: 12, color: '#666' }}>
                    <Space size={4}>
                      <PhoneOutlined />
                      <span>{(detailItem.actorId as any).phoneNumber}</span>
                    </Space>
                  </div>
                )}
                {!detailItem.actorId && detailItem.actorName && (
                  <div style={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>
                    Khách hàng walk-in
                  </div>
                )}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Hành động">
              <Tag
                color={
                  detailItem.action === "check_in" ||
                  detailItem?.action === "confirmed"
                    ? "green"
                    : detailItem.action === "check_out"
                    ? "blue"
                    : detailItem.action === "cancelled"
                    ? "red"
                    : detailItem?.action === "pendding"
                    ? "yellow"
                    : "geekblue"
                }
              >
                {translateActionText(detailItem.action)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian thao tác">
              <div style={{ fontSize: 12, color: '#666' }}>
                {detailItem.createdAt 
                  ? new Date(detailItem.createdAt).toLocaleString("vi-VN")
                  : "Không xác định"}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              <div style={{ 
                background: detailItem.note ? '#f9f9f9' : '#f5f5f5', 
                padding: '8px 12px', 
                borderRadius: 4,
                border: '1px solid #e8e8e8',
                minHeight: '40px'
              }}>
                {detailItem.note ? translatePaymentStatusText(detailItem.note) : "Không có ghi chú"}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
