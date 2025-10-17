import { Tag, Space, Avatar, Typography, Button } from "antd";
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  CrownOutlined, 
  CheckCircleOutlined, 
  StopOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { User } from "../../types/user";

export const getUserColumns = (
  handleEdit: (user: User) => void,
  handleDelete: (id: string) => void
): ColumnsType<User> => [
  {
    title: (
      <Space>
        <UserOutlined style={{ color: '#1890ff' }} />
        <span>Họ và tên</span>
      </Space>
    ),
    dataIndex: "fullName",
    key: "fullName",
    render: (text) => (
      <Space>
        <Avatar 
          size="small" 
          icon={<UserOutlined />} 
          style={{ backgroundColor: '#1890ff' }}
        />
        <Typography.Text strong>{text}</Typography.Text>
      </Space>
    ),
  },
  { 
    title: (
      <Space>
        <MailOutlined style={{ color: '#52c41a' }} />
        <span>Email</span>
      </Space>
    ), 
    dataIndex: "email", 
    key: "email",
    render: (email) => (
      <Space>
        <MailOutlined style={{ color: '#52c41a' }} />
        <Typography.Text type="secondary">{email}</Typography.Text>
      </Space>
    ),
  },
  { 
    title: (
      <Space>
        <PhoneOutlined style={{ color: '#fa8c16' }} />
        <span>Số điện thoại</span>
      </Space>
    ), 
    dataIndex: "phoneNumber", 
    key: "phoneNumber",
    render: (phone) => (
      <Space>
        <PhoneOutlined style={{ color: '#fa8c16' }} />
        <Typography.Text type="secondary">{phone}</Typography.Text>
      </Space>
    ),
  },
  {
    title: (
      <Space>
        <CrownOutlined style={{ color: '#722ed1' }} />
        <span>Vai trò</span>
      </Space>
    ),
    dataIndex: "role",
    key: "role",  
    render: (role) => (
      <Tag 
        color={role === "admin" ? "volcano" : "geekblue"}
        icon={<CrownOutlined />}
      >
        {role.toUpperCase()}
      </Tag>
    ),
  },
  {
    title: (
      <Space>
        <TeamOutlined style={{ color: '#13c2c2' }} />
        <span>Trạng thái</span>
      </Space>
    ),
    dataIndex: "status",
    key: "status",
    render: (status) => (
      <Tag
        icon={status === "active" ? <CheckCircleOutlined /> : <StopOutlined />}
        color={status === "active" ? "success" : "error"}
      >
        {status === "active" ? "Đang hoạt động" : "Vô hiệu hóa"}
      </Tag>
    ),
  },
  {
    title: (
      <Space>
        <CalendarOutlined style={{ color: '#faad14' }} />
        <span>Ngày tạo</span>
      </Space>
    ),
    dataIndex: "createdAt",
    key: "createdAt",
    render: (date) => (
      <Space>
        <CalendarOutlined style={{ color: '#faad14' }} />
        <Typography.Text type="secondary">
          {new Date(date).toLocaleDateString()}
        </Typography.Text>
      </Space>
    ),
  },
  {
    title: (
      <Space>
        <EditOutlined style={{ color: '#722ed1' }} />
        <span>Hành động</span>
      </Space>
    ),
    key: "action",
    render: (_, record) => (
      <Space>
        <Button 
          type="link" 
          size="small" 
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          Sửa
        </Button>
        <Button 
          type="link" 
          size="small" 
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record._id)}
        >
          Xóa
        </Button>
      </Space>
    ),
  },
];
