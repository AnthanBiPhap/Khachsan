import { Tag, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Room } from "../../types/room";

export const roomsColumns = (
  handleEdit: (record: Room) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: Room) => void
): ColumnsType<Room> => [
  {
    title: "Phòng",
    key: "roomNumber",
    dataIndex: "roomNumber",
    render: (value: string, record) => (
      handleDetail ? (
        <a onClick={() => handleDetail(record)}>{value}</a>
      ) : (
        <span>{value}</span>
      )
    ),
  },
  {
    title: "Loại phòng",
    key: "typeId",
    render: (_, record) => (
      <div>
        <div>{record.typeId?.name || "-"}</div>
        {record.typeId ? (
          <div style={{ color: "#888", fontSize: 12 }}>
            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(record.typeId.pricePerNight)}
            {" · "}Tối đa {record.typeId.capacity} khách
          </div>
        ) : null}
      </div>
    ),
  },
  {
    title: "Tiện nghi",
    key: "amenities",
    render: (_, record) => (
      <Space wrap>
        {(record.amenities || []).map((a) => (
          <Tag key={a}>{a}</Tag>
        ))}
      </Space>
    ),
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const map: Record<string, { color: string; text: string }> = {
        available: { color: "green", text: "Sẵn sàng" },
        occupied: { color: "blue", text: "Đang ở" },
        maintenance: { color: "orange", text: "Bảo trì" },
        unavailable: { color: "red", text: "Không khả dụng" },
      };
      const v = map[status] || { color: "default", text: status };
      return <Tag color={v.color}>{v.text}</Tag>;
    },
  },
  {
    title: "Tạo/Cập nhật",
    key: "timestamps",
    render: (_, r) => (
      <div style={{ color: "#888", fontSize: 12 }}>
        <div>Tạo: {r.createdAt ? new Date(r.createdAt).toLocaleString("vi-VN") : "-"}</div>
        <div>Sửa: {r.updatedAt ? new Date(r.updatedAt).toLocaleString("vi-VN") : "-"}</div>
      </div>
    ),
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
