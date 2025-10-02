import { Tag, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { BookingStatusLog } from "../../types/bookingstatus";

export const bookingStatusColumns = (
  handleEdit: (record: BookingStatusLog) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: BookingStatusLog) => void
): ColumnsType<BookingStatusLog> => [
  {
    title: "Booking",
    key: "booking",
    render: (_, record) => {
      const customerName =
        record.bookingId?.customerId?.fullName ||
        record.bookingId?.guestInfo?.fullName ||
        "Khách walk-in";

      return (
        <div>
          <div>{customerName}</div>
          <div style={{ color: "#888", fontSize: 12 }}>
            Nhận:{" "}
            {record.bookingId?.checkIn
              ? new Date(record.bookingId.checkIn).toLocaleString("vi-VN")
              : "-"}
          </div>
          <div style={{ color: "#888", fontSize: 12 }}>
            Trả:{" "}
            {record.bookingId?.checkOut
              ? new Date(record.bookingId.checkOut).toLocaleString("vi-VN")
              : "-"}
          </div>
        </div>
      );
    },
  },
  {
    title: "Hình thức đặt",
    dataIndex: "bookingId",
    key: "bookingType",
    render: (_, record) => {
      console.log(record);
      return (
        <Tag color={record?.actorName === "Guest" ? "yellow" : "green"}>
          {record?.actorName === "Guest" ? "Offline" : "Online"}
        </Tag>
      );
    },
  },
  {
    title: "Người thao tác",
    key: "actor",
    render: (_, record) => (
      <div>
        <div>{record.actorId?.fullName || "Admin / Lễ tân"}</div>
        <div style={{ color: "#888", fontSize: 12 }}>
          {record.actorId?.email || "-"}
        </div>
      </div>
    ),
  },
  {
    title: "Hành động",
    dataIndex: "action",
    key: "action",
    render: (action: string) => {
      console.log(action);
      const map: Record<string, { color: string; text: string }> = {
        check_in: { color: "green", text: "Check-in" },
        check_out: { color: "blue", text: "Check-out" },
        cancelled: { color: "red", text: "Hủy đặt phòng" },
        confirmed: { color: "green", text: "Đã xác nhận" },
        extend: { color: "purple", text: "Gia hạn" },
        extend_check_out: { color: "geekblue", text: "Lùi giờ trả" },
        pending: { color: "yellow", text: "Chờ xác nhận" },
      };
      const item = map[action] || { color: "default", text: action };
      return <Tag color={item.color}>{item.text}</Tag>;
    },
  },
  {
    title: "Ghi chú",
    dataIndex: "note",
    key: "note",
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
    ),
  },
];
