import { Space, Tag, Image, Rate, Avatar, Typography, Button } from "antd";
import { 
  EnvironmentOutlined, 
  TagOutlined, 
  StarOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  EyeInvisibleOutlined,
  CloseCircleOutlined,
  PictureOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { LocationItem } from "../../types/location";

export const locationsColumns = (
  handleEdit: (record: LocationItem) => void,
  handleDelete: (id: string) => void,
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
        <PictureOutlined style={{ color: '#13c2c2' }} />
        <span>Ảnh</span>
      </Space>
    ),
    key: "images",
    render: (_, r) => (
      r.images && r.images.length ? (
        <Space>
          <PictureOutlined style={{ color: '#13c2c2' }} />
          <Image 
            src={r.images[0]} 
            width={60} 
            height={40} 
            style={{ 
              objectFit: "cover", 
              borderRadius: '6px',
              border: '2px solid #f0f0f0'
            }}
            preview={{ src: r.images[0] }}
            fallback="https://via.placeholder.com/60x40"
          />
        </Space>
      ) : (
        <Space>
          <PictureOutlined style={{ color: '#d9d9d9' }} />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Không có ảnh
          </Typography.Text>
        </Space>
      )
    ),
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
        <Button 
          type="link" 
          size="small" 
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(r._id)}
        >
          Xóa
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
