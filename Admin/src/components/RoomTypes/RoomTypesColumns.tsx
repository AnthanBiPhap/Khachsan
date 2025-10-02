import { Tag, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { RoomType } from "../../types/room";

export const roomTypesColumns = (
  handleEdit: (record: RoomType) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: RoomType) => void
): ColumnsType<RoomType> => [
  {
    title: "Tên loại phòng",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Giá / đêm",
    key: "pricePerNight",
    render: (_, r) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(r.pricePerNight),
  },
  {
    title: "Sức chứa",
    dataIndex: "capacity",
    key: "capacity",
    align: "center",
  },
  {
    title: "Tiện nghi",
    key: "amenities",
    render: (_, r) => (
      <Space wrap>
        {(r.amenities || []).slice(0, 5).map((a) => (
          <Tag key={a}>{a}</Tag>
        ))}
        {(r.amenities || []).length > 5 ? <Tag>+{(r.amenities || []).length - 5}</Tag> : null}
      </Space>
    ),
  },
  {
    title: "Ngày tạo/cập nhật",
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
        {handleDetail && <a onClick={() => handleDetail(r)}>Chi tiết</a>}
      </Space>
    ),
  },
];
