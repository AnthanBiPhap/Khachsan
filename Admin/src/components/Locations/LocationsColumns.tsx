import { Space, Tag, Rate, Avatar, Typography, Button } from "antd";
import { 
  EnvironmentOutlined, 
  TagOutlined, 
  StarOutlined, 
  EditOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  EyeInvisibleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { LocationItem } from "../../types/location";

export const locationsColumns = (
  handleEdit: (record: LocationItem) => void,
  handleDetail?: (record: LocationItem) => void
): ColumnsType<LocationItem> => [
  {
    title: (
      <Space>
        <EnvironmentOutlined style={{ color: '#1890ff' }} />
        <span>Tên địa điểm</span>
      </Space>
    ),
    dataIndex: "name",
    key: "name",
    render: (value: string, record) => {
      const content = (
        <Space>
          <Avatar 
            size="small" 
            icon={<EnvironmentOutlined />} 
            style={{ backgroundColor: '#1890ff' }}
          />
          <Typography.Text strong>{value}</Typography.Text>
        </Space>
      );
      return handleDetail ? (
        <Button 
          type="link" 
          onClick={() => handleDetail(record)}
          style={{ padding: 0, height: 'auto' }}
        >
          {content}
        </Button>
      ) : content;
    }
  },
  {
    title: (
      <Space>
        <TagOutlined style={{ color: '#52c41a' }} />
        <span>Loại</span>
      </Space>
    ),
    dataIndex: "type",
    key: "type",
    render: (t: string) => (
      <Tag color="green" icon={<TagOutlined />}>
        {t}
      </Tag>
    ),
  },
  {
    title: (
      <Space>
        <StarOutlined style={{ color: '#faad14' }} />
        <span>Đánh giá</span>
      </Space>
    ),
    dataIndex: "ratingAvg",
    key: "ratingAvg",
    render: (v?: number) => (
      v ? (
        <Space>
          <StarOutlined style={{ color: '#faad14' }} />
          <Rate disabled allowHalf defaultValue={v} />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            ({v.toFixed(1)})
          </Typography.Text>
        </Space>
      ) : (
        <Space>
          <StarOutlined style={{ color: '#d9d9d9' }} />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Chưa có đánh giá
          </Typography.Text>
        </Space>
      )
    ),
  },
  {
    title: (
      <Space>
        <CheckCircleOutlined style={{ color: '#722ed1' }} />
        <span>Trạng thái</span>
      </Space>
    ),
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const map: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
        active: { color: "green", text: "Hoạt động", icon: <CheckCircleOutlined /> },
        hidden: { color: "orange", text: "Ẩn", icon: <EyeInvisibleOutlined /> },
        deleted: { color: "red", text: "Xóa", icon: <CloseCircleOutlined /> },
      };
      const v = map[status] || { color: "default", text: status, icon: null };
      return (
        <Tag color={v.color} icon={v.icon}>
          {v.text}
        </Tag>
      );
    },
  },
  {
    title: (
      <Space>
        <EditOutlined style={{ color: '#722ed1' }} />
        <span>Thao tác</span>
      </Space>
    ),
    key: "actions",
    render: (_, r) => (
      <Space>
        <Button 
          type="link" 
          size="small" 
          icon={<EditOutlined />}
          onClick={() => handleEdit(r)}
        >
          Sửa
        </Button>
        {handleDetail && (
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleDetail(r)}
          >
            Chi tiết
          </Button>
        )}
      </Space>
    ),
  },
];
