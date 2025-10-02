import { Tag, Space } from "antd";
import { CheckCircleOutlined, StopOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { User } from "../../types/user";

export const getUserColumns = (
  handleEdit: (user: User) => void,
  handleDelete: (id: string) => void
): ColumnsType<User> => [
  {
    title: "Họ và tên",
    dataIndex: "fullName",
    key: "fullName",
    render: (text) => <a>{text}</a>,
  },
  { title: "Email", dataIndex: "email", key: "email" },
  { title: "Số điện thoại", dataIndex: "phoneNumber", key: "phoneNumber" },
  {
    title: "Vai trò",
    dataIndex: "role",
    key: "role",  
    render: (role) => (
      <Tag color={role === "admin" ? "volcano" : "geekblue"}>
        {role.toUpperCase()}
      </Tag>
    ),
  },
  {
    title: "Trạng thái",
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
    title: "Ngày tạo",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (date) => new Date(date).toLocaleDateString(),
  },
  {
    title: "Hành động",
    key: "action",
    render: (_, record) => (
      <Space>
        <a onClick={() => handleEdit(record)}>Chỉnh sửa</a>
        <a onClick={() => handleDelete(record._id)}>Xóa</a>
      </Space>
    ),
  },
];
