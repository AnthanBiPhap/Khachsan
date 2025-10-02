import { Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ServiceBookingItem } from "../../types/serviceBooking";

export const serviceBookingsColumns = (
  handleEdit: (record: ServiceBookingItem) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: ServiceBookingItem) => void
): ColumnsType<ServiceBookingItem> => [
  {
    title: "Dịch vụ",
    key: "service",
    render: (_, r) => r.serviceId?.name || r.serviceId?._id || "-",
  },
  {
    title: "Thời gian",
    key: "scheduledAt",
    render: (_, r) => (r.scheduledAt ? new Date(r.scheduledAt).toLocaleString("vi-VN") : "-"),
  },
  {
    title: "Số lượng",
    dataIndex: "quantity",
    key: "quantity",
    align: "center",
  },
  {
    title: "Giá",
    key: "price",
    render: (_, r) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(r.price),
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const map: Record<string, { color: string; text: string }> = {
        reserved: { color: "blue", text: "Đã đặt" },
        completed: { color: "green", text: "Hoàn thành" },
        cancelled: { color: "red", text: "Đã hủy" },
      };
      const v = map[status] || { color: "default", text: status };
      return <Tag color={v.color}>{v.text}</Tag>;
    },
  },
  {
    title: "Thao tác",
    key: "actions",
    render: (_, r) => (
      <Space>
        <a onClick={() => handleEdit(r)}>Chỉnh sửa</a>
        <a onClick={() => handleDelete(r._id)}>Xóa</a>
        {handleDetail && <a onClick={() => handleDetail(r)}>Chi tiết</a>}
      </Space>
    ),
  },
];
