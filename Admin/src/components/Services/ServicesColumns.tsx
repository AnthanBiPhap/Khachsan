import { Space, Tag, Avatar, Typography, Button, Tooltip } from "antd";
import { 
  SettingOutlined, 
  DollarOutlined, 
  ClockCircleOutlined, 
  EditOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  EyeInvisibleOutlined,
  CloseCircleOutlined
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
            <Space>
              <Typography.Text strong>{r.name}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                -
              </Typography.Text>
              <Tooltip title={r.description} placement="topLeft">
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {r.description && r.description.length > 30 
                    ? `${r.description.substring(0, 30)}...` 
                    : r.description}
                </Typography.Text>
              </Tooltip>
            </Space>
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
        <span>Giờ hoạt động</span>
      </Space>
    ),
    key: "workingHours",
    render: (_, r) => (
      <Space wrap>
        {r.workingHours ? (
          <Tag color="green" icon={<ClockCircleOutlined />}>
            từ {r.workingHours.startTime} đến {r.workingHours.endTime}
          </Tag>
        ) : (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Chưa cập nhật
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
