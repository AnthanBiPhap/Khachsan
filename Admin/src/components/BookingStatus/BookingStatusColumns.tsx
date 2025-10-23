import { Tag, Space, Typography, Button } from "antd";
import { 
  CalendarOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  GlobalOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { BookingStatusLog, BookingStatusGuestInfo } from "../../types/bookingstatus";

export const bookingStatusColumns = (
  handleEdit: (record: BookingStatusLog) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: BookingStatusLog) => void
): ColumnsType<BookingStatusLog> => [
  {
    title: "Booking",
    key: "booking",
    render: (_, record) => {
      // Sử dụng logic mới với mảng guests
      let customerName = "Khách walk-in";
      
      if (record.bookingId?.customerId?.fullName) {
        // Khách hàng online
        customerName = record.bookingId.customerId.fullName;
      } else if (record.bookingId?.guests && record.bookingId.guests.length > 0) {
        // Khách hàng walk_in - lấy tên khách chính
        const mainGuest = record.bookingId.guests.find((guest: BookingStatusGuestInfo) => guest.isMainGuest) || record.bookingId.guests[0];
        customerName = mainGuest?.fullName || "Khách walk-in";
      }

      const content = (
        <div>
          <Typography.Text strong>{customerName}</Typography.Text>
          <br />
          <Space direction="vertical" size={0} style={{ alignItems: 'flex-start' }}>
            <Space size={4} style={{ alignItems: 'center' }}>
              <CalendarOutlined style={{ color: '#52c41a', fontSize: 12, width: 12 }} />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Nhận: {record.bookingId?.checkIn
                  ? new Date(record.bookingId.checkIn).toLocaleString("vi-VN")
                  : "-"}
              </Typography.Text>
            </Space>
            <Space size={4} style={{ alignItems: 'center' }}>
              <CalendarOutlined style={{ color: '#ff4d4f', fontSize: 12, width: 12 }} />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Trả: {record.bookingId?.checkOut
                  ? new Date(record.bookingId.checkOut).toLocaleString("vi-VN")
                  : "-"}
              </Typography.Text>
            </Space>
          </Space>
        </div>
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
      // Sử dụng source của booking để xác định hình thức đặt
      const bookingSource = record?.bookingId?.source;
      const isOnline = bookingSource === "online";
      
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
    title: "Người thao tác",
    key: "actor",
    render: (_, record) => {
      // Xác định tên người thao tác
      const actorName = record.actorName || record.actorId?.fullName || "Admin / Lễ tân";
      
      // Xác định thông tin liên lạc
      let contactInfo = "-";
      if (record.actorId?.phoneNumber || record.actorId?.email) {
        // Có actorId (admin/staff hoặc khách hàng online)
        contactInfo = record.actorId?.phoneNumber || record.actorId?.email || "-";
      } else if (record.actorName && record.bookingId?.guests && record.bookingId.guests.length > 0) {
        // Khách hàng walk_in - tìm thông tin liên lạc từ mảng guests
        const mainGuest = record.bookingId.guests.find((guest: BookingStatusGuestInfo) => 
          guest.fullName === record.actorName
        );
        if (mainGuest) {
          contactInfo = mainGuest.phoneNumber || mainGuest.email || "-";
        }
      }

      return (
        <div>
          <Typography.Text strong>{actorName}</Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {contactInfo}
          </Typography.Text>
        </div>
      );
    },
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
        updated: { color: "orange", text: "Cập nhật thông tin", icon: <EditOutlined /> },
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
