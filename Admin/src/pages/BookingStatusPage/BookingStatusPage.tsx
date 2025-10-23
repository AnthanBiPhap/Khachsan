import {
  Table,
  Typography,
  message,
  Drawer,
  Descriptions,
  Tag,
} from "antd";
import { useEffect, useState } from "react";
import { CalendarOutlined } from "@ant-design/icons";
import BookingForm from "../../components/BookingStatus/BookingStatusForm";
import BookingStatusSearchFilter from "../../components/BookingStatus/BookingStatusSearchFilter";
import type { BookingStatusLog } from "../../types/bookingstatus";
import {
  fetchBookings,
  deleteBooking,
} from "../../services/bookingStatus.service";
import { env } from "../../constanst/getEnvs";
import { bookingStatusColumns } from "../../components/BookingStatus/BookingStatusColumns";

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
        <Typography.Title level={4}>
          <CalendarOutlined /> Nhật ký trạng thái đặt phòng
        </Typography.Title>
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
            {/* <Descriptions.Item label="ID">{detailItem._id}</Descriptions.Item> */}
            <Descriptions.Item label="Booking">
              {detailItem.bookingId?._id?.slice(0, 8)}... | Nhận:{" "}
              {detailItem.bookingId?.checkIn
                ? new Date(detailItem.bookingId.checkIn).toLocaleString("vi-VN")
                : "-"}{" "}
              | Trả:{" "}
              {detailItem.bookingId?.checkOut
                ? new Date(detailItem.bookingId.checkOut).toLocaleString(
                    "vi-VN"
                  )
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Người thao tác">
              {(detailItem.actorId as any)?.fullName ||
                (detailItem.actorId as any)?._id ||
                "-"}
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
                {detailItem.action}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {detailItem.note || "-"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
