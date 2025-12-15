import { Space, Tag, Button, Typography, Input } from "antd";
import {
  UserOutlined,
  MailOutlined,
  MessageOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MessageFilled,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Contact } from "../../services/contacts.service";

const { TextArea } = Input;

export const contactsColumns = (
  handleEdit: (record: Contact) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: Contact) => void,
  handleMarkAsRead?: (id: string) => void
): ColumnsType<Contact> => [
  {
    title: (
      <Space>
        <UserOutlined style={{ color: "#1890ff" }} />
        <span>Tên</span>
      </Space>
    ),
    dataIndex: "name",
    key: "name",
    render: (name: string, record: Contact) => (
      <Space>
        <Typography.Text strong>{name}</Typography.Text>
        {record.status === "new" && (
          <Tag color="red" icon={<ClockCircleOutlined />}>
            Mới
          </Tag>
        )}
      </Space>
    ),
  },
  {
    title: (
      <Space>
        <MailOutlined style={{ color: "#52c41a" }} />
        <span>Liên hệ</span>
      </Space>
    ),
    dataIndex: "contact",
    key: "contact",
    render: (contact: string) => (
      <Typography.Text copyable>{contact}</Typography.Text>
    ),
  },
  {
    title: (
      <Space>
        <MessageOutlined style={{ color: "#722ed1" }} />
        <span>Chủ đề</span>
      </Space>
    ),
    dataIndex: "subject",
    key: "subject",
    render: (subject: string) => {
      const subjectMap: Record<string, { text: string; color: string }> = {
        booking: { text: "Đặt phòng", color: "blue" },
        service: { text: "Thắc mắc dịch vụ", color: "green" },
        issue: { text: "Báo sự cố", color: "red" },
        feedback: { text: "Góp ý", color: "orange" },
        general: { text: "Thông tin chung", color: "default" },
      };
      const mapped = subjectMap[subject] || { text: subject, color: "default" };
      return <Tag color={mapped.color}>{mapped.text}</Tag>;
    },
  },
  {
    title: (
      <Space>
        <MessageFilled style={{ color: "#faad14" }} />
        <span>Tin nhắn</span>
      </Space>
    ),
    dataIndex: "message",
    key: "message",
    render: (message: string) => (
      <Typography.Text
        style={{
          maxWidth: 300,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={message}
      >
        {message}
      </Typography.Text>
    ),
  },
  {
    title: (
      <Space>
        <CheckCircleOutlined style={{ color: "#722ed1" }} />
        <span>Trạng thái</span>
      </Space>
    ),
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const map: Record<
        string,
        { color: string; text: string; icon: React.ReactNode }
      > = {
        new: {
          color: "red",
          text: "Mới",
          icon: <ClockCircleOutlined />,
        },
        read: {
          color: "blue",
          text: "Đã đọc",
          icon: <CheckCircleOutlined />,
        },
        replied: {
          color: "green",
          text: "Đã trả lời",
          icon: <MessageFilled />,
        },
        archived: {
          color: "default",
          text: "Đã lưu trữ",
          icon: <CloseCircleOutlined />,
        },
      };
      const v = map[status] || {
        color: "default",
        text: status,
        icon: null,
      };
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
        <EditOutlined style={{ color: "#722ed1" }} />
        <span>Thao tác</span>
      </Space>
    ),
    key: "actions",
    render: (_, record: Contact) => (
      <Space>
        {record.status === "new" && handleMarkAsRead && (
          <Button
            type="link"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleMarkAsRead(record._id)}
          >
            Đánh dấu đã đọc
          </Button>
        )}
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          Phản hồi
        </Button>
        {handleDetail && (
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleDetail(record)}
          >
            Chi tiết
          </Button>
        )}
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

