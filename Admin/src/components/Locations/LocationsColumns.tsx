import { Space, Tag, Image, Rate } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { LocationItem } from "../../types/location";

export const locationsColumns = (
  handleEdit: (record: LocationItem) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: LocationItem) => void
): ColumnsType<LocationItem> => [
  {
    title: "Tên địa điểm",
    dataIndex: "name",
    key: "name",
    render: (value: string, record) => (
      handleDetail ? <a onClick={() => handleDetail(record)}>{value}</a> : <span>{value}</span>
    )
  },
  {
    title: "Loại",
    dataIndex: "type",
    key: "type",
    render: (t: string) => <Tag>{t}</Tag>,
  },
  {
    title: "Đánh giá",
    dataIndex: "ratingAvg",
    key: "ratingAvg",
    render: (v?: number) => (v ? <Rate disabled allowHalf defaultValue={v} /> : <span>-</span>),
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const map: Record<string, { color: string; text: string }> = {
        active: { color: "green", text: "Hoạt động" },
        hidden: { color: "orange", text: "Ẩn" },
        deleted: { color: "red", text: "Xóa" },
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
        <a onClick={() => handleDetail?.(r)}>Chi tiết</a>
      </Space>
    ),
  },
];
