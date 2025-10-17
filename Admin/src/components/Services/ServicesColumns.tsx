import { Space, Tag, Image, Avatar, Typography, Button } from "antd";
import { 
  SettingOutlined, 
  DollarOutlined, 
  ClockCircleOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  EyeInvisibleOutlined,
  CloseCircleOutlined,
  PictureOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ServiceItem } from "../../types/service";

export const servicesColumns = (
  handleEdit: (record: ServiceItem) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: ServiceItem) => void
): ColumnsType<ServiceItem> => [
  {
    title: (
      <Space>
        <SettingOutlined style={{ color: '#1890ff' }} />
        <span>Dịch vụ</span>
      </Space>
    ),
    key: "name",
    render: (_, r) => {
      const content = (
        <Space>
          <Avatar 
            size="small" 
            icon={<SettingOutlined />} 
            style={{ backgroundColor: '#1890ff' }}
          />
          <div>
            <Typography.Text strong>{r.name}</Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {r.description}
            </Typography.Text>
          </div>
        </Space>
      );
      return handleDetail ? (
        <Button 
          type="link" 
          onClick={() => handleDetail(r)}
          style={{ padding: 0, height: 'auto' }}
        >
          {content}
        </Button>
      ) : content;
    },
  },
  {
    title: (
      <Space>
        <DollarOutlined style={{ color: '#52c41a' }} />
        <span>Giá cơ bản</span>
      </Space>
    ),
    key: "basePrice",
    render: (_, r) => (
      <Space>
        <DollarOutlined style={{ color: '#52c41a' }} />
        <Typography.Text strong style={{ color: '#52c41a' }}>
          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(r.basePrice)}
        </Typography.Text>
      </Space>
    ),
  },
  {
    title: (
      <Space>
        <ClockCircleOutlined style={{ color: '#fa8c16' }} />
        <span>Khung giờ</span>
      </Space>
    ),
    key: "slots",
    render: (_, r) => (
      <Space wrap>
        {(r.slots || []).map((s) => (
          <Tag key={s} color="blue" icon={<ClockCircleOutlined />}>
            {s}
          </Tag>
        ))}
        {(!r.slots || r.slots.length === 0) && (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Không có khung giờ
          </Typography.Text>
        )}
      </Space>
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
        active: { color: "green", text: "Đang bán", icon: <CheckCircleOutlined /> },
        hidden: { color: "orange", text: "Ẩn", icon: <EyeInvisibleOutlined /> },
        deleted: { color: "red", text: "Đã xóa", icon: <CloseCircleOutlined /> },
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
