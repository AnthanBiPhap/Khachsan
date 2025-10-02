import { Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Booking } from "../../types/booking";

export const bookingColumns = (
  handleEdit: (record: Booking) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: Booking) => void
): ColumnsType<Booking> => [
  {
    title: "Khách hàng",
    key: "customer",
    render: (_, r) => {
      const fullName = r.customerId?.fullName || r.guestInfo?.fullName || '-';
      const emailOrPhone = r.customerId?.email || r.guestInfo?.phoneNumber || '';
      const content = (
        <div>
          <div>{fullName}</div>
          <div style={{ color: '#888', fontSize: 12 }}>{emailOrPhone}</div>
        </div>
      );
      return handleDetail ? <a onClick={() => handleDetail(r)}>{content}</a> : content;
    }
  },
  {
    title: "Phòng",
    key: "room",
    render: (_, r) => (handleDetail ? <a onClick={() => handleDetail(r)}>{r.roomId?.roomNumber || r.roomId?._id || '-'}</a> : (r.roomId?.roomNumber || r.roomId?._id || '-'))
  },
  {
    title: "Nhận/Trả",
    key: "time",
    render: (_, r) => (
      <div style={{ color: '#555' }}>
        <div>Nhận: {r.checkIn ? new Date(r.checkIn).toLocaleString('vi-VN') : '-'}</div>
        <div>Trả: {r.checkOut ? new Date(r.checkOut).toLocaleString('vi-VN') : '-'}</div>
      </div>
    )
  },
  {
    title: "Khách",
    dataIndex: "guests",
    key: "guests",
    align: 'center'
  },
  {
    title: "Tổng tiền",
    key: "totalPrice",
    render: (_, r) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(r.totalPrice || 0)
  },
  {
    title: "Thanh toán",
    dataIndex: "paymentStatus",
    key: "paymentStatus",
    render: (s: string) => {
      const map: Record<string, { color: string; text: string }> = {
        pending: { color: 'orange', text: 'Chờ thanh toán' },
        paid: { color: 'green', text: 'Đã thanh toán' },
        failed: { color: 'red', text: 'Thất bại' },
        refunded: { color: 'blue', text: 'Hoàn tiền' },
      };
      const v = map[s] || { color: 'default', text: s };
      return <Tag color={v.color}>{v.text}</Tag>;
    }
  },
  {
    title: "Thao tác",
    key: "actions",
    render: (_, r) => (
      <Space>
        <a onClick={() => handleEdit(r)}>Chỉnh sửa</a>
        <a onClick={() => handleDelete(r._id)}>Xóa</a>
        <a onClick={() => handleDetail?.(r)}>Chi tiết</a>
      </Space>
    )
  }
];
