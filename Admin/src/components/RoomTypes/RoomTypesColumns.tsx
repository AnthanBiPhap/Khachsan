import { Tag, Space, Avatar, Typography, Button } from "antd";
import { 
  HomeOutlined, 
  DollarOutlined, 
  UserOutlined, 
  SettingOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CalendarOutlined,
  PlusOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { RoomType } from "../../types/room";

export const roomTypesColumns = (
  handleEdit: (record: RoomType) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: RoomType) => void
): ColumnsType<RoomType> => [
  {
    title: (
      <Space>
        <HomeOutlined style={{ color: '#1890ff' }} />
        <span>Tên loại phòng</span>
      </Space>
    ),
    dataIndex: "name",
    key: "name",
    render: (name: string, record) => {
      const content = (
        <Space>
          <Avatar 
            size="small" 
            icon={<HomeOutlined />} 
            style={{ backgroundColor: '#1890ff' }}
          />
          <Typography.Text strong>{name}</Typography.Text>
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
    },
  },
  {
    title: (
      <Space>
        <DollarOutlined style={{ color: '#52c41a' }} />
        <span>Giá / đêm</span>
      </Space>
    ),
    key: "pricePerNight",
    render: (_, r) => (
      <Space>
        <DollarOutlined style={{ color: '#52c41a' }} />
        <Typography.Text strong style={{ color: '#52c41a' }}>
          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(r.pricePerNight)}
        </Typography.Text>
      </Space>
    ),
  },
  {
    title: (
      <Space>
        <UserOutlined style={{ color: '#fa8c16' }} />
        <span>Sức chứa</span>
      </Space>
    ),
    dataIndex: "capacity",
    key: "capacity",
    align: "center",
    render: (capacity: number) => (
      <Tag color="orange" icon={<UserOutlined />}>
        {capacity} người
      </Tag>
    ),
  },
  {
    title: (
      <Space>
        <SettingOutlined style={{ color: '#722ed1' }} />
        <span>Tiện nghi</span>
      </Space>
    ),
    key: "amenities",
    render: (_, r) => (
      <Space wrap>
        {(r.amenities || []).slice(0, 5).map((a) => (
          <Tag key={a} color="blue" icon={<SettingOutlined />}>
            {a}
          </Tag>
        ))}
        {(r.amenities || []).length > 5 && (
          <Tag color="purple" icon={<PlusOutlined />}>
            +{(r.amenities || []).length - 5}
          </Tag>
        )}
        {(!r.amenities || r.amenities.length === 0) && (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Không có tiện nghi
          </Typography.Text>
        )}
      </Space>
    ),
  },
  {
    title: (
      <Space>
        <CalendarOutlined style={{ color: '#13c2c2' }} />
        <span>Ngày tạo/cập nhật</span>
      </Space>
    ),
    key: "timestamps",
    render: (_, r) => (
      <Space direction="vertical" size={0}>
        <Space size={4}>
          <CalendarOutlined style={{ color: '#52c41a', fontSize: 12 }} />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Tạo: {r.createdAt ? new Date(r.createdAt).toLocaleString("vi-VN") : "-"}
          </Typography.Text>
        </Space>
        <Space size={4}>
          <CalendarOutlined style={{ color: '#1890ff', fontSize: 12 }} />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Sửa: {r.updatedAt ? new Date(r.updatedAt).toLocaleString("vi-VN") : "-"}
          </Typography.Text>
        </Space>
      </Space>
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
