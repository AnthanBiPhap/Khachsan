import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Space,
  Typography,
  message,
  Drawer,
  Descriptions,
  Modal,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  UserOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import UserForm from "../../components/User/UserForm";
import type { User } from "../../types/user";
import { fetchUsers, deleteUser } from "../../services/user.service";
import { StreamChat, Channel as StreamChannel } from "stream-chat";
import {
  Chat,
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  Avatar,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

import { env } from "../../constanst/getEnvs";
import { useAuthStore } from "../../stores/authStore";

// ----------------- Hook quản lý unread -----------------
function useUnread(chatClient: StreamChat | null, currentUserId?: string) {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!chatClient || !currentUserId) return;

    const loadUnread = async () => {
      const channels = await chatClient.queryChannels({ type: "messaging" });

      for (const ch of channels) {
        const count = await ch.countUnread();
        const memberIds = Object.keys(ch.state.members);
        const otherUserId = memberIds.find((id) => id !== currentUserId);
        if (otherUserId) {
          setUnreadCounts((prev) => ({
            ...prev,
            [otherUserId]: count,
          }));
        }
      }
    };

    loadUnread();

    const handleNewMessage = async (event: any) => {
      const channel = chatClient.channel(event.channel_type, event.channel_id);
      const count = await channel.countUnread();
      const memberIds = Object.keys(channel.state.members);
      const otherUserId = memberIds.find((id) => id !== currentUserId);

      if (otherUserId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [otherUserId]: count,
        }));
      }
    };

    chatClient.on("message.new", handleNewMessage);
    return () => {
      chatClient.off("message.new", handleNewMessage);
    };
  }, [chatClient, currentUserId]);

  const resetUnread = (userId: string) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [userId]: 0,
    }));
  };

  return { unreadCounts, resetUnread };
}

// ----------------- Component chính -----------------
export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [openForm, setOpenForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);

  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [chatChannel, setChatChannel] = useState<StreamChannel | null>(null);
  const [openChat, setOpenChat] = useState(false);

  const [openDetailModal, setOpenDetailModal] = useState(false);

  const storedUser = useAuthStore.getState().user;
  const { unreadCounts, resetUnread } = useUnread(chatClient, storedUser?._id);

  // ----------------- Load users -----------------
  const loadUsers = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await fetchUsers(page, limit);
      setUsers(res.data.users);
      setPagination({
        current: res.data.pagination.page,
        pageSize: res.data.pagination.limit,
        total: res.data.pagination.totalRecord,
      });
    } catch {
      message.error("Không tải được dữ liệu người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ----------------- CRUD -----------------
  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      message.success(`Đã xóa user ${id}`);
      loadUsers(pagination.current, pagination.pageSize);
    } catch {
      message.error("Lỗi khi xóa user");
    }
  };

  const handleSave = async (values: Partial<User>) => {
    try {
      if (editingUser) {
        const data: any = { ...values };
        delete data._id;
        delete data.createdAt;
        delete data.updatedAt;
        if (!data.password) delete data.password;

        const res = await fetch(
          `${env.API_URL}/api/v1/users/${editingUser._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );

        if (!res.ok) throw new Error(await res.text());

        message.success("Cập nhật thành công");
      }
      setOpenForm(false);
      loadUsers(pagination.current, pagination.pageSize);
    } catch (err) {
      console.error("Lỗi khi lưu:", err);
      message.error("Lỗi khi lưu");
    }
  };

  // ----------------- Chat -----------------
  const handleChat = async (userId: string) => {
    try {
      const res = await fetch(`${env.API_URL}/api/v1/chat/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, adminId: storedUser?._id }),
      });
      const { channelId } = await res.json();

      const tokenRes = await fetch(`${env.API_URL}/api/v1/chat/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: storedUser?._id ?? "",
          name: "System Admin",
        }),
      });
      const { token, apiKey, user } = await tokenRes.json();

      const client = StreamChat.getInstance(apiKey);
      await client.connectUser(user, token);

      const channel = client.channel("messaging", channelId);
      await channel.watch();

      setChatClient(client);
      setChatChannel(channel);
      setOpenChat(true);

      resetUnread(userId); // reset badge
    } catch (err) {
      console.error(err);
      message.error("Không mở được chat");
    }
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
          {unreadCounts[record._id] > 0 && (
            <span
              style={{
                color: "red",
                fontWeight: "bold",
                marginLeft: 6,
              }}
            >
              ● {unreadCounts[record._id]}
            </span>
          )}
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
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <a
            onClick={() => {
              setEditingUser(record);
              setOpenForm(true);
            }}
          >
            Chỉnh sửa
          </a>
          <a onClick={() => handleDelete(record._id)}>Xóa</a>
          <a
            onClick={() => {
              setDetailUser(record);
              setOpenDetail(true);
            }}
          >
            Chi tiết
          </a>
          <a
            onClick={() => {
              setDetailUser(record);
              handleChat(record._id);
            }}
            style={{ position: "relative" }}
          >
            💬 Chat
            {unreadCounts[record._id] > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -8,
                  right: -12,
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  padding: "0 6px",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                {unreadCounts[record._id]}
              </span>
            )}
          </a>
        </Space>
      ),
    },
  ];

  // ----------------- Render -----------------
  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={4}>
        <UserOutlined /> Quản lý người dùng
      </Typography.Title>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
        pagination={pagination}
        onChange={(p) => loadUsers(p.current, p.pageSize)}
        bordered
      />

      {/* Form User */}
      <UserForm
        open={openForm}
        user={editingUser}
        onCancel={() => setOpenForm(false)}
        onSave={handleSave}
      />

      {/* Drawer chi tiết user */}
      <Drawer
        title={
          detailUser
            ? `Chi tiết người dùng: ${detailUser.fullName}`
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
          </Descriptions>
        )}
      </Drawer>

      {/* Drawer Chat */}
      <Drawer
        title={`Chat với ${detailUser?.fullName || "người dùng"}`}
        open={openChat}
        onClose={() => {
          setOpenChat(false);
          setChatClient(null);
          setChatChannel(null);
        }}
        width={400}
        destroyOnClose
      >
        {chatClient && chatChannel && (
          <Chat client={chatClient} theme="messaging light">
            <Channel channel={chatChannel}>
              <Window>
                <ChannelHeader
                  Avatar={(props) => (
                    <Avatar
                      {...props}
                      onClick={() => setOpenDetailModal(true)}
                    />
                  )}
                  title={detailUser?.fullName || "Người dùng"}
                />
                <MessageList />
                <MessageInput focus />
              </Window>
              <Thread />
            </Channel>
          </Chat>
        )}
      </Drawer>

      {/* Modal chi tiết user */}
      <Modal
        title={
          detailUser
            ? `Chi tiết người dùng: ${detailUser.fullName}`
            : "Chi tiết người dùng"
        }
        open={openDetailModal}
        onCancel={() => setOpenDetailModal(false)}
        footer={null}
        width={520}
        centered
        destroyOnClose
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
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
