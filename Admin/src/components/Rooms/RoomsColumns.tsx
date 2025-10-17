import { Tag, Space, Avatar, Typography, Button, Tooltip } from "antd";
import { 
  HomeOutlined, 
  SettingOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  UserOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Room } from "../../types/room";

export const roomsColumns = (
  handleEdit: (record: Room) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: Room) => void
): ColumnsType<Room> => [
  {
    title: (
      <Space>
        <HomeOutlined style={{ color: '#1890ff' }} />
        <span>Phòng</span>
      </Space>
    ),
    key: "roomNumber",
    dataIndex: "roomNumber",
    render: (value: string, record) => {
      const content = (
        <Space>
          <Avatar 
            size="small" 
            icon={<HomeOutlined />} 
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
    },
  },
  {
    title: (
      <Space>
        <SettingOutlined style={{ color: '#52c41a' }} />
        <span>Loại phòng</span>
      </Space>
    ),
    key: "typeId",
    render: (_, record) => (
      <Space direction="vertical" size={0}>
        <Space>
          <SettingOutlined style={{ color: '#52c41a' }} />
          <Typography.Text strong>{record.typeId?.name || "-"}</Typography.Text>
        </Space>
        {record.typeId && (
          <Space direction="vertical" size={0}>
            <Space size={4}>
              <DollarOutlined style={{ color: '#52c41a', fontSize: 12 }} />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(record.typeId.pricePerNight)}
              </Typography.Text>
            </Space>
            <Space size={4}>
              <UserOutlined style={{ color: '#1890ff', fontSize: 12 }} />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Tối đa {record.typeId.capacity} khách
              </Typography.Text>
            </Space>
          </Space>
        )}
      </Space>
    ),
  },
  {
    title: (
      <Space>
        <SettingOutlined style={{ color: '#fa8c16' }} />
        <span>Tiện nghi</span>
      </Space>
    ),
    key: "amenities",
    render: (_, record) => {
      const amenities = record.amenities || [];
      const maxDisplay = 3; // Chỉ hiển thị tối đa 3 tiện nghi
      const displayAmenities = amenities.slice(0, maxDisplay);
      const remainingCount = amenities.length - maxDisplay;
      
      return (
        <Space wrap>
          {displayAmenities.map((a) => (
            <Tag key={a} color="blue" icon={<SettingOutlined />}>
              {a}
            </Tag>
          ))}
          {remainingCount > 0 && (
            <Tooltip title={`${amenities.slice(maxDisplay).join(', ')}`} placement="topLeft">
              <Tag color="default" style={{ cursor: 'pointer' }}>
                +{remainingCount} khác
              </Tag>
            </Tooltip>
          )}
          {amenities.length === 0 && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Không có tiện nghi
            </Typography.Text>
          )}
        </Space>
      );
    },
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
        available: { color: "green", text: "Sẵn sàng", icon: <CheckCircleOutlined /> },
        occupied: { color: "blue", text: "Đang ở", icon: <ExclamationCircleOutlined /> },
        maintenance: { color: "orange", text: "Bảo trì", icon: <ClockCircleOutlined /> },
        unavailable: { color: "red", text: "Không khả dụng", icon: <CloseCircleOutlined /> },
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
        <CalendarOutlined style={{ color: '#13c2c2' }} />
        <span>Tạo/Cập nhật</span>
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
