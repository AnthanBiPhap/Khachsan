import { useEffect, useState, useCallback } from "react";
import {
  Table,
  Tag,
  Space,
  Typography,
  message,
  Drawer,
  Descriptions,
  Card,
  Spin,
  Empty,
  Divider,
  Button,
  Modal,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  UserOutlined,
  CheckCircleOutlined,
  StopOutlined,
  HistoryOutlined,
  CalendarOutlined,
  DollarOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import UserForm from "../../components/User/UserForm";
import type { User } from "../../types/user";
import { fetchUsers, deleteUser } from "../../services/user.service";
import axios from "axios";
import { env } from "../../constanst/getEnvs";
import { useAuthStore } from "../../stores/authStore";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

// ----------------- Types -----------------
type Booking = {
  _id: string;
  customerId?: {
    _id: string;
    fullName: string;
    email?: string;
    phoneNumber?: string;
  };
  guests: any[];
  guestCount: number;
  roomId: {
    _id: string;
    roomNumber: string;
    typeId: string;
  };
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'cancelled' | 'completed' | 'refunded' | 'failed' | 'refund_requested';
  services?: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type GroupBooking = {
  _id: string;
  requesterId?: {
    _id: string;
    fullName: string;
    email?: string;
    phoneNumber?: string;
  };
  requesterName: string;
  requesterPhone: string;
  requesterEmail?: string;
  checkIn: string;
  checkOut: string;
  peopleCount: number;
  roomCount: number;
  notes?: string;
  status: string;
  allocatedRoomIds?: Array<{
    _id: string;
    roomNumber: string;
  }>;
  quoteAmount?: number;
  paymentLink?: string;
  paidAmount?: number;
  remainingAmount?: number;
  createdAt: string;
  updatedAt: string;
};

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

  const [openBookingHistory, setOpenBookingHistory] = useState(false);
  const [bookingHistoryUser, setBookingHistoryUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [groupBookings, setGroupBookings] = useState<GroupBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const storedUser = useAuthStore.getState().user;
  const navigate = useNavigate();
  const isStaff = storedUser?.role === 'staff';

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
  const handleDelete = (id: string, fullName?: string) => {
    Modal.confirm({
      title: "Xác nhận xóa người dùng",
      content: `Bạn có chắc chắn muốn xóa người dùng "${fullName || id}"? Người dùng sẽ được chuyển vào danh sách đã xóa.`,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteUser(id);
          message.success("Đã xóa user thành công");
          // Navigate đến trang deleted users sau khi xóa
          navigate("/users/deleted");
        } catch {
          message.error("Lỗi khi xóa user");
        }
      },
    });
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

  // ----------------- Booking History -----------------
  const fetchBookingHistory = useCallback(async (userId: string) => {
    try {
      setLoadingBookings(true);
      const [bookingsRes, groupBookingsRes, invoicesRes] = await Promise.all([
        axios.get(`${env.API_URL}/api/v1/bookings?customerId=${userId}`),
        axios.get(`${env.API_URL}/api/v1/group-bookings?requesterId=${userId}`),
        axios.get(`${env.API_URL}/api/v1/invoices?customerId=${userId}`).catch(() => null),
      ]);

      const allBookings = bookingsRes.data?.data?.bookings || [];
      const userBookings = allBookings.filter(
        (b: any) => b.customerId?._id === userId
      );
      setBookings(userBookings);

      const groupBookingsList = groupBookingsRes.data?.data || [];
      setGroupBookings(groupBookingsList);
    } catch (err) {
      console.error("Error fetching booking history:", err);
      message.error("Không thể tải lịch sử đặt phòng");
      setBookings([]);
      setGroupBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  const handleViewBookingHistory = (user: User) => {
    setBookingHistoryUser(user);
    setOpenBookingHistory(true);
    fetchBookingHistory(user._id);
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      paid: { color: "success", text: "Đã thanh toán" },
      refunded: { color: "blue", text: "Đã hoàn tiền" },
      refund_requested: { color: "purple", text: "Đang yêu cầu hoàn tiền" },
      failed: { color: "error", text: "Thất bại" },
      cancelled: { color: "error", text: "Đã hủy" },
      pending: { color: "warning", text: "Chờ thanh toán" },
    };
    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getGroupStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending_approval: { color: "warning", text: "Chờ duyệt" },
      approved: { color: "blue", text: "Đã duyệt" },
      info_uploaded: { color: "cyan", text: "Đã cập nhật danh sách" },
      quoted: { color: "orange", text: "Đã báo giá" },
      awaiting_payment: { color: "gold", text: "Chờ thanh toán" },
      deposit_paid: { color: "geekblue", text: "Đã đặt cọc" },
      paid: { color: "success", text: "Đã thanh toán" },
      confirmed: { color: "processing", text: "Đã xác nhận" },
      refund_requested: { color: "purple", text: "Đang xử lý hoàn tiền" },
      refunded: { color: "success", text: "Đã hoàn tiền" },
      rejected: { color: "error", text: "Đã từ chối" },
      cancelled: { color: "error", text: "Đã hủy" },
    };
    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
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
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          {!isStaff && (
            <>
              <a
                onClick={() => {
                  setEditingUser(record);
                  setOpenForm(true);
                }}
              >
                Chỉnh sửa
              </a>
              <a onClick={() => handleDelete(record._id, record.fullName)}>Xóa</a>
            </>
          )}
          <a
            onClick={() => {
              setDetailUser(record);
              setOpenDetail(true);
            }}
          >
            Chi tiết
          </a>
          <a onClick={() => handleViewBookingHistory(record)}>
            <HistoryOutlined /> Lịch sử đặt phòng
          </a>
        </Space>
      ),
    },
  ];

  // ----------------- Render -----------------
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          <UserOutlined /> Quản lý người dùng
        </Typography.Title>
        {!isStaff && (
          <Button
            type="default"
            icon={<DeleteOutlined />}
            onClick={() => navigate("/users/deleted")}
          >
            Xem người dùng đã xóa
          </Button>
        )}
      </div>

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
      {!isStaff && (
        <UserForm
          open={openForm}
          user={editingUser}
          onCancel={() => setOpenForm(false)}
          onSave={handleSave}
        />
      )}

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

      {/* Drawer Booking History */}
      <Drawer
        title={
          <Space>
            <HistoryOutlined />
            <span>Lịch sử đặt phòng - {bookingHistoryUser?.fullName || "Người dùng"}</span>
          </Space>
        }
        open={openBookingHistory}
        onClose={() => {
          setOpenBookingHistory(false);
          setBookingHistoryUser(null);
          setBookings([]);
          setGroupBookings([]);
        }}
        width={900}
        destroyOnClose
      >
        <Spin spinning={loadingBookings}>
          {!loadingBookings && bookings.length === 0 && groupBookings.length === 0 ? (
            <Empty description="Khách hàng chưa có đặt phòng nào" />
          ) : (
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Regular Bookings */}
              {bookings.length > 0 && (
                <div>
                  <Typography.Title level={5}>
                    <CalendarOutlined /> Đặt phòng thường ({bookings.length})
                  </Typography.Title>
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    {bookings.map((booking) => (
                      <Card key={booking._id} size="small">
                        <Space direction="vertical" style={{ width: "100%" }} size="small">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography.Text strong>
                              Phòng {booking.roomId?.roomNumber || "N/A"}
                            </Typography.Text>
                            {getStatusBadge(booking.paymentStatus)}
                          </div>
                          <Descriptions size="small" column={2} bordered>
                            <Descriptions.Item label="Mã đặt phòng" span={2}>
                              <Typography.Text code>{booking._id.slice(-8).toUpperCase()}</Typography.Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={<><CalendarOutlined /> Nhận phòng</>}>
                              {formatDate(booking.checkIn)}
                            </Descriptions.Item>
                            <Descriptions.Item label={<><CalendarOutlined /> Trả phòng</>}>
                              {formatDate(booking.checkOut)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số khách">
                              {booking.guestCount || booking.guests?.length || 0} người
                            </Descriptions.Item>
                            <Descriptions.Item label={<><DollarOutlined /> Tổng tiền</>}>
                              <Typography.Text strong>{formatCurrency(booking.totalPrice || 0)}</Typography.Text>
                            </Descriptions.Item>
                            {booking.services && booking.services.length > 0 && (
                              <Descriptions.Item label="Dịch vụ" span={2}>
                                {booking.services.map((s, idx) => (
                                  <div key={idx}>
                                    {s.name} (x{s.quantity}) - {formatCurrency(s.price * s.quantity)}
                                  </div>
                                ))}
                              </Descriptions.Item>
                            )}
                            {booking.notes && (
                              <Descriptions.Item label="Ghi chú" span={2}>
                                {booking.notes}
                              </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Ngày tạo">
                              {formatDate(booking.createdAt)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật">
                              {formatDate(booking.updatedAt)}
                            </Descriptions.Item>
                          </Descriptions>
                        </Space>
                      </Card>
                    ))}
                  </Space>
                </div>
              )}

              {/* Group Bookings */}
              {groupBookings.length > 0 && (
                <div>
                  <Divider />
                  <Typography.Title level={5}>
                    <UserOutlined /> Đặt phòng theo đoàn ({groupBookings.length})
                  </Typography.Title>
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    {groupBookings.map((group) => (
                      <Card key={group._id} size="small">
                        <Space direction="vertical" style={{ width: "100%" }} size="small">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography.Text strong>
                              Đặt đoàn {group._id.slice(-8).toUpperCase()}
                            </Typography.Text>
                            {getGroupStatusBadge(group.status)}
                          </div>
                          <Descriptions size="small" column={2} bordered>
                            <Descriptions.Item label="Mã yêu cầu" span={2}>
                              <Typography.Text code>{group._id}</Typography.Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số khách">
                              {group.peopleCount} người
                            </Descriptions.Item>
                            <Descriptions.Item label="Số phòng">
                              {group.roomCount} phòng
                            </Descriptions.Item>
                            <Descriptions.Item label={<><CalendarOutlined /> Nhận phòng</>}>
                              {formatDate(group.checkIn)}
                            </Descriptions.Item>
                            <Descriptions.Item label={<><CalendarOutlined /> Trả phòng</>}>
                              {formatDate(group.checkOut)}
                            </Descriptions.Item>
                            {group.quoteAmount && (
                              <Descriptions.Item label={<><DollarOutlined /> Báo giá</>} span={2}>
                                <Typography.Text strong>{formatCurrency(group.quoteAmount)}</Typography.Text>
                              </Descriptions.Item>
                            )}
                            {group.paidAmount !== undefined && (
                              <Descriptions.Item label="Đã thanh toán">
                                {formatCurrency(group.paidAmount)}
                              </Descriptions.Item>
                            )}
                            {group.remainingAmount !== undefined && (
                              <Descriptions.Item label="Còn lại">
                                {formatCurrency(group.remainingAmount)}
                              </Descriptions.Item>
                            )}
                            {group.allocatedRoomIds && group.allocatedRoomIds.length > 0 && (
                              <Descriptions.Item label="Phòng đã phân bổ" span={2}>
                                <Space wrap>
                                  {group.allocatedRoomIds.map((room) => (
                                    <Tag key={room._id}>Phòng {room.roomNumber}</Tag>
                                  ))}
                                </Space>
                              </Descriptions.Item>
                            )}
                            {group.notes && (
                              <Descriptions.Item label="Ghi chú" span={2}>
                                {group.notes}
                              </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Ngày tạo">
                              {formatDate(group.createdAt)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật">
                              {formatDate(group.updatedAt)}
                            </Descriptions.Item>
                          </Descriptions>
                        </Space>
                      </Card>
                    ))}
                  </Space>
                </div>
              )}
            </Space>
          )}
        </Spin>
      </Drawer>

    </div>
  );
}
