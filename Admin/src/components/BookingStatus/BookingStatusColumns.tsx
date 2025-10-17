import { Tag, Space, Avatar, Typography, Button } from "antd";
import { 
  CalendarOutlined, 
  UserOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  GlobalOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  HomeOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { BookingStatusLog } from "../../types/bookingstatus";

export const bookingStatusColumns = (
  handleEdit: (record: BookingStatusLog) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: BookingStatusLog) => void
): ColumnsType<BookingStatusLog> => [
  {
    title: (
      <Space>
        <CalendarOutlined style={{ color: '#1890ff' }} />
        <span>Booking</span>
      </Space>
    ),
    key: "booking",
    render: (_, record) => {
      const customerName =
        record.bookingId?.customerId?.fullName ||
        record.bookingId?.guestInfo?.fullName ||
        "Khách walk-in";

      const content = (
        <Space>
          <Avatar 
            size="small" 
            icon={<HomeOutlined />} 
            style={{ backgroundColor: '#1890ff' }}
          />
          <div>
            <Typography.Text strong>{customerName}</Typography.Text>
            <br />
            <Space direction="vertical" size={0}>
              <Space size={4}>
                <CalendarOutlined style={{ color: '#52c41a', fontSize: 12 }} />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Nhận: {record.bookingId?.checkIn
                    ? new Date(record.bookingId.checkIn).toLocaleString("vi-VN")
                    : "-"}
                </Typography.Text>
              </Space>
              <Space size={4}>
                <CalendarOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Trả: {record.bookingId?.checkOut
                    ? new Date(record.bookingId.checkOut).toLocaleString("vi-VN")
                    : "-"}
                </Typography.Text>
              </Space>
            </Space>
          </div>
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
        <GlobalOutlined style={{ color: '#52c41a' }} />
        <span>Hình thức đặt</span>
      </Space>
    ),
    dataIndex: "bookingId",
    key: "bookingType",
    render: (_, record) => {
      const isOnline = record?.actorName !== "Guest";
      return (
        <Tag 
          color={isOnline ? "blue" : "purple"}
          icon={isOnline ? <GlobalOutlined /> : <ShopOutlined />}
        >
          {isOnline ? "Online" : "Offline"}
        </Tag>
      );
    },
  },
  {
    title: (
      <Space>
        <UserOutlined style={{ color: '#fa8c16' }} />
        <span>Người thao tác</span>
      </Space>
    ),
    key: "actor",
    render: (_, record) => (
      <Space>
        <Avatar 
          size="small" 
          icon={<UserOutlined />} 
          style={{ backgroundColor: record.actorId ? '#1890ff' : '#52c41a' }}
        />
        <div>
          <Typography.Text strong>
            {record.actorId?.fullName || "Admin / Lễ tân"}
          </Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {record.actorId?.email || "-"}
          </Typography.Text>
        </div>
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
    dataIndex: "action",
    key: "action",
    render: (action: string) => {
      const map: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
        check_in: { color: "green", text: "Check-in", icon: <CheckCircleOutlined /> },
        check_out: { color: "blue", text: "Check-out", icon: <CalendarOutlined /> },
        cancelled: { color: "red", text: "Hủy đặt phòng", icon: <CloseCircleOutlined /> },
        confirmed: { color: "green", text: "Đã xác nhận", icon: <CheckCircleOutlined /> },
        extend: { color: "purple", text: "Gia hạn", icon: <ClockCircleOutlined /> },
        extend_check_out: { color: "geekblue", text: "Lùi giờ trả", icon: <ClockCircleOutlined /> },
        pending: { color: "yellow", text: "Chờ xác nhận", icon: <ExclamationCircleOutlined /> },
        paid: { color: "green", text: "Đã thanh toán", icon: <CheckCircleOutlined /> },
        refunded: { color: "blue", text: "Hoàn tiền", icon: <CloseCircleOutlined /> },
        refund_requested: { color: "purple", text: "Yêu cầu hoàn tiền", icon: <EditOutlined /> },
        failed: { color: "red", text: "Thanh toán thất bại", icon: <CloseCircleOutlined /> },
      };
      const item = map[action] || { color: "default", text: action, icon: null };
      return (
        <Tag color={item.color} icon={item.icon}>
          {item.text}
        </Tag>
      );
    },
  },
  {
    title: (
      <Space>
        <EditOutlined style={{ color: '#fa8c16' }} />
        <span>Ghi chú</span>
      </Space>
    ),
    dataIndex: "note",
    key: "note",
    render: (note: string) => (
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {note || "-"}
      </Typography.Text>
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
