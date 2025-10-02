import { Space, Tag, Rate } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ReviewItem } from "../../types/review";

export const reviewsColumns = (
  handleEdit: (record: ReviewItem) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: ReviewItem) => void
): ColumnsType<ReviewItem> => [
  {
    title: "Đối tượng",
    key: "target",
    render: (_, r) => `${r.targetType}: ${r.targetId?.slice(0,8)}...`,
  },
  {
    title: "Điểm",
    dataIndex: "rating",
    key: "rating",
    render: (v: number) => <Rate disabled defaultValue={v} />,
  },
  {
    title: "Bình luận",
    dataIndex: "comment",
    key: "comment",
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const map: Record<string, { color: string; text: string }> = {
        active: { color: "green", text: "Hiện" },
        hidden: { color: "orange", text: "Ẩn" },
        deleted: { color: "red", text: "Xóa" },
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
        <a onClick={() => handleDetail?.(r)}>Chi tiết</a>
      </Space>
    ),
  },
];
