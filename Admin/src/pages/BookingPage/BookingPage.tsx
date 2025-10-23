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
import { CalendarOutlined, PlusOutlined, IdcardOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import BookingForm from "../../components/Booking/BookingForm";
import type { Booking } from "../../types/booking";
import { fetchBookings, deleteBooking } from "../../services/booking.service";
import { env } from "../../constanst/getEnvs";
import { bookingColumns } from "../../components/Booking/BookingColumns";

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
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

  const loadBookings = async (page = 1, limit = 10) => {
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
              <span>
                <IdcardOutlined style={{ marginRight: 8 }} />
                Quy định check-in: Khi khách check-in phải cung cấp giấy tờ tùy thân (CMND/CCCD) để xác minh danh tính, đồng thời cung cấp đầy đủ họ tên, số điện thoại và tuổi.
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
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingBooking(null);
            setOpenForm(true);
          }}
        >
          Thêm đặt phòng
        </Button>
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
        dataSource={bookings}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} đặt phòng`,
        }}
        onChange={(p) => loadBookings(p.current, p.pageSize)}
        bordered
        scroll={{ x: "max-content" }}
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
                  <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {guests.map((guest, index) => {
                      // Đảm bảo guest là object hợp lệ
                      if (!guest || typeof guest !== 'object') return null;
                      
                      return (
                        <div 
                          key={`guest-${index}`} 
                          style={{ 
                            padding: '8px 12px', 
                            marginBottom: 8, 
                            border: '1px solid #f0f0f0', 
                            borderRadius: 6,
                            backgroundColor: guest.isMainGuest ? '#f6ffed' : '#fafafa'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontWeight: 500 }}>
                                {guest.isMainGuest ? '' : ''}{String(guest.fullName || '')}
                              </span>
                              {guest.isMainGuest && (
                                <Tag color="green" style={{ marginLeft: 8, fontSize: 10 }}>
                                  Khách chính
                                </Tag>
                              )}
                            </div>
                            <div style={{ fontSize: 12, color: '#666' }}>
                              {String(guest.age || 0)} tuổi
                            </div>
                          </div>
                          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                            <div>📱 {String(guest.phoneNumber || '')}</div>
                            {guest.idNumber && <div>🆔 {String(guest.idNumber)}</div>}
                            {guest.email && <div>📧 {String(guest.email)}</div>}
                          </div>
                        </div>
                      );
                    })}
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
