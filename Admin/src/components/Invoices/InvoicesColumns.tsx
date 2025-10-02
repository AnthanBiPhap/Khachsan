import { Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { InvoiceItem } from "../../types/invoice";

export const invoicesColumns = (
  handleEdit: (record: InvoiceItem) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: InvoiceItem) => void
): ColumnsType<InvoiceItem> => [
  {
    title: "Booking",
    key: "booking",
    render: (_, r) => {
      const content = (
        <div>
          <div>Mã: {r.bookingId?._id?.slice(0,8)}...</div>
          <div style={{ color: '#888', fontSize: 12 }}>Nhận: {r.bookingId?.checkIn ? new Date(r.bookingId.checkIn).toLocaleString('vi-VN') : '-'}</div>
          <div style={{ color: '#888', fontSize: 12 }}>Trả: {r.bookingId?.checkOut ? new Date(r.bookingId.checkOut).toLocaleString('vi-VN') : '-'}</div>
        </div>
      );
      return handleDetail ? <a onClick={() => handleDetail(r)}>{content}</a> : content;
    }
  },
  {
    title: "Khách hàng",
    key: "customer",
    render: (_, r) => (
      <div>
        <div>{r.customerId?.fullName || '-'}</div>
        <div style={{ color: '#888', fontSize: 12 }}>{r.customerId?.email || ''}</div>
      </div>
    )
  },
  {
    title: "Tổng tiền",
    key: "totalAmount",
    render: (_, r) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(r.totalAmount),
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const map: Record<string, { color: string; text: string }> = {
        pending: { color: 'orange', text: 'Chờ thanh toán' },
        paid: { color: 'green', text: 'Đã thanh toán' },
        failed: { color: 'red', text: 'Thất bại' },
        refunded: { color: 'blue', text: 'Hoàn tiền' },
      };
      const v = map[status] || { color: 'default', text: status };
      return <Tag color={v.color}>{v.text}</Tag>;
    }
  },
  {
    title: "Phát hành",
    key: "issuedAt",
    render: (_, r) => (r.issuedAt ? new Date(r.issuedAt).toLocaleString('vi-VN') : '-'),
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
