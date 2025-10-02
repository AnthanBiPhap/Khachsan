import { Space, Tag, Image } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ServiceItem } from "../../types/service";

export const servicesColumns = (
  handleEdit: (record: ServiceItem) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: ServiceItem) => void
): ColumnsType<ServiceItem> => [
  {
    title: "Dịch vụ",
    key: "name",
    render: (_, r) => (
      <div>
        <div style={{ fontWeight: 500 }}>{r.name}</div>
        <div style={{ color: "#888", fontSize: 12 }}>{r.description}</div>
      </div>
    ),
  },
  {
    title: "Giá cơ bản",
    key: "basePrice",
    render: (_, r) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(r.basePrice),
  },
  {
    title: "Khung giờ",
    key: "slots",
    render: (_, r) => (
      <Space wrap>
        {(r.slots || []).map((s) => (
          <Tag key={s}>{s}</Tag>
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
        active: { color: "green", text: "Đang bán" },
        hidden: { color: "orange", text: "Ẩn" },
        deleted: { color: "red", text: "Đã xóa" },
      };
      const v = map[status] || { color: "default", text: status };
      return <Tag color={v.color}>{v.text}</Tag>;
    },
  },
  {
    title: "Ảnh",
    key: "images",
    render: (_, r) =>
      r.images && r.images.length ? (
        <Image src={r.images[0]} width={60} height={40} style={{ objectFit: "cover" }} />
      ) : (
        <span>-</span>
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
