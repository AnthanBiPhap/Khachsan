import { Space, Tag, Avatar, Typography, Button } from "antd";
import { 
  SettingOutlined, 
  CalendarOutlined, 
  NumberOutlined, 
  DollarOutlined, 
  EditOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ServiceBookingItem } from "../../types/serviceBooking";

export const serviceBookingsColumns = (
  handleEdit: (record: ServiceBookingItem) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: ServiceBookingItem) => void
): ColumnsType<ServiceBookingItem> => [
  {
    title: (
      <Space>
        <SettingOutlined style={{ color: '#1890ff' }} />
        <span>Dịch vụ</span>
      </Space>
    ),
    key: "service",
    render: (_, r) => {
      const serviceName = r.serviceId?.name || r.serviceId?._id || "-";
      const content = (
        <Space>
          <Avatar 
            size="small" 
            icon={<SettingOutlined />} 
            style={{ backgroundColor: '#1890ff' }}
          />
          <Typography.Text strong>{serviceName}</Typography.Text>
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
        <CalendarOutlined style={{ color: '#52c41a' }} />
        <span>Thời gian</span>
      </Space>
    ),
    key: "scheduledAt",
    render: (_, r) => (
      <Space>
        <CalendarOutlined style={{ color: '#52c41a' }} />
        <Typography.Text type="secondary">
          {r.scheduledAt ? new Date(r.scheduledAt).toLocaleString("vi-VN") : "-"}
        </Typography.Text>
      </Space>
    ),
  },
  {
    title: (
      <Space>
        <NumberOutlined style={{ color: '#fa8c16' }} />
        <span>Số lượng</span>
      </Space>
    ),
    dataIndex: "quantity",
    key: "quantity",
    align: "center",
    render: (quantity: number) => (
      <Tag color="orange" icon={<NumberOutlined />}>
        {quantity}
      </Tag>
    ),
  },
  {
    title: (
      <Space>
        <DollarOutlined style={{ color: '#52c41a' }} />
        <span>Giá</span>
      </Space>
    ),
    key: "price",
    render: (_, r) => (
      <Space>
        <DollarOutlined style={{ color: '#52c41a' }} />
        <Typography.Text strong style={{ color: '#52c41a' }}>
          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(r.price)}
        </Typography.Text>
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
        reserved: { color: "blue", text: "Đã đặt", icon: <ClockCircleOutlined /> },
        completed: { color: "green", text: "Hoàn thành", icon: <CheckCircleOutlined /> },
        cancelled: { color: "red", text: "Đã hủy", icon: <CloseCircleOutlined /> },
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
        <EyeOutlined style={{ color: '#722ed1' }} />
        <span>Thao tác</span>
      </Space>
    ),
    key: "actions",
    render: (_, r) => (
      <Space>
        {/* Nút sửa đã bị ẩn */}
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
