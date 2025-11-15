import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Space,
  Typography,
  message,
  Drawer,
  Descriptions,
  Button,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  UserOutlined,
  CheckCircleOutlined,
  StopOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import type { User } from "../../types/user";
import { fetchDeletedUsers } from "../../services/user.service";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function DeletedUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [openDetail, setOpenDetail] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // ----------------- Load deleted users -----------------
  const loadDeletedUsers = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await fetchDeletedUsers(page, limit);
      setUsers(res.data.users);
      setPagination({
        current: res.data.pagination.page,
        pageSize: res.data.pagination.limit,
        total: res.data.pagination.totalRecord,
      });
    } catch (error: any) {
      console.error("Error loading deleted users:", error);
      message.error("Không tải được dữ liệu người dùng đã xóa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeletedUsers();
  }, []);

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
  };

  // ----------------- Table Columns -----------------
  const columns: ColumnsType<User> = [
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => (
        <a
          onClick={() => {
            setDetailUser(record);
            setOpenDetail(true);
          }}
        >
          {text}
        </a>
      ),
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
          icon={
            status === "active" ? <CheckCircleOutlined /> : <StopOutlined />
          }
          color={status === "active" ? "success" : "error"}
        >
          {status === "active" ? "Đang hoạt động" : "Vô hiệu hóa"}
        </Tag>
      ),
    },
    {
      title: "Ngày xóa",
      dataIndex: "deletedAt",
      key: "deletedAt",
      render: (deletedAt: string) => deletedAt ? formatDate(deletedAt) : "-",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <a
            onClick={() => {
              setDetailUser(record);
              setOpenDetail(true);
            }}
          >
            Chi tiết
          </a>
        </Space>
      ),
    },
  ];

  // ----------------- Render -----------------
  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/users")}
        >
          Quay lại
        </Button>
        <Typography.Title level={4} style={{ margin: 0 }}>
          <DeleteOutlined /> Người dùng đã xóa
        </Typography.Title>
      </Space>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
        pagination={pagination}
        onChange={(p) => loadDeletedUsers(p.current, p.pageSize)}
        bordered
      />

      {/* Drawer chi tiết user */}
      <Drawer
        title={
          detailUser
            ? `Chi tiết người dùng đã xóa: ${detailUser.fullName}`
            : "Chi tiết người dùng"
        }
        open={openDetail}
        onClose={() => {
          setOpenDetail(false);
          setDetailUser(null);
        }}
        width={520}
      >
        {detailUser && (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="Họ và tên">
              {detailUser.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {detailUser.email}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {detailUser.phoneNumber || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Vai trò">
              <Tag
                color={
                  detailUser.role === "admin"
                    ? "volcano"
                    : detailUser.role === "staff"
                    ? "blue"
                    : "geekblue"
                }
              >
                {detailUser.role?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={detailUser.status === "active" ? "success" : "error"}>
                {detailUser.status === "active"
                  ? "Đang hoạt động"
                  : "Vô hiệu hóa"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày xóa">
              {detailUser.deletedAt
                ? formatDate(detailUser.deletedAt)
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {detailUser.createdAt
                ? formatDate(detailUser.createdAt)
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày cập nhật">
              {detailUser.updatedAt
                ? formatDate(detailUser.updatedAt)
                : "-"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}

