import {
  Table,
  Typography,
  message,
  Button,
  Drawer,
  Descriptions,
  Tag,
} from "antd";
import { useEffect, useState } from "react";
import { CalendarOutlined, PlusOutlined } from "@ant-design/icons";
import BookingForm from "../../components/BookingStatus/BookingStatusForm";
import type { BookingStatusLog } from "../../types/bookingstatus";
import {
  fetchBookings,
  deleteBooking,
} from "../../services/bookingStatus.service";
import { env } from "../../constanst/getEnvs";
import { bookingStatusColumns } from "../../components/BookingStatus/BookingStatusColumns";

export default function BookingPage() {
  const [bookings, setBookings] = useState<BookingStatusLog[]>([]);
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

  const loadBookings = async (page = 1, limit = 10) => {
    //bookingStatus
    try {
      setLoading(true);
      const res = await fetchBookings(page, limit);
      const bookingsData = Array.isArray(res.data) ? res.data : [];
      setBookings(bookingsData);
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
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingBooking(null);
            setOpenForm(true);
          }}
        >
          Thêm log
        </Button>
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
        dataSource={bookings}
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
