import { Tag, Space, Avatar, Typography, Button, Tooltip } from "antd";
import { 
  HomeOutlined, 
  SettingOutlined, 
  EditOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  UserOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Room } from "../../types/room";

export const roomsColumns = (
  handleEdit: (record: Room) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: Room) => void,
  canEdit: boolean = true
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
    align: 'center',
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
      return (
        <div style={{ textAlign: 'center' }}>
          {handleDetail ? (
            <Button 
              type="link" 
              onClick={() => handleDetail(record)}
              style={{ padding: 0, height: 'auto' }}
            >
              {content}
            </Button>
          ) : content}
        </div>
      );
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
        <CheckCircleOutlined style={{ color: '#722ed1' }} />
        <span>Trạng thái</span>
      </Space>
    ),
    dataIndex: "status",
    key: "status",
    align: 'center',
    render: (status: string) => {
      const map: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
        available: { color: "green", text: "Sẵn sàng", icon: <CheckCircleOutlined /> },
        maintenance: { color: "orange", text: "Bảo trì", icon: <ClockCircleOutlined /> },
        unavailable: { color: "red", text: "Không khả dụng", icon: <CloseCircleOutlined /> },
      };
      const v = map[status] || { color: "default", text: status, icon: null };
      return (
        <div style={{ textAlign: 'center' }}>
          <Tag color={v.color} icon={v.icon}>
            {v.text}
          </Tag>
        </div>
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
        {canEdit && (
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(r)}
          >
            Sửa
          </Button>
        )}
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
