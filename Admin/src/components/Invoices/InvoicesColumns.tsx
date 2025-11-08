import { Space, Tag, Typography, Button } from "antd";
import { 
  CalendarOutlined, 
  DollarOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  RollbackOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { InvoiceItem } from "../../types/invoice";

export const invoicesColumns = (
  handleEdit: (record: InvoiceItem) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: InvoiceItem) => void
): ColumnsType<InvoiceItem> => [
  {
    title: "Booking",
    key: "booking",
    render: (_, r) => {
      // Kiểm tra nếu có groupBookingId (đặt theo đoàn)
      if (r.groupBookingId) {
        const gb = r.groupBookingId;
        const content = (
          <div>
            <Space size={4} style={{ marginBottom: 4 }}>
              <Tag color="purple" style={{ margin: 0 }}>
                Đặt đoàn
              </Tag>
              <Typography.Text strong copyable={{ text: gb._id }}>
                {gb._id}
              </Typography.Text>
            </Space>
            <br />
            <Space direction="vertical" size={0} style={{ alignItems: 'flex-start' }}>
              <Space size={4} style={{ alignItems: 'center' }}>
                <CalendarOutlined style={{ color: '#52c41a', fontSize: 12, width: 12 }} />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Nhận: {gb.checkIn ? new Date(gb.checkIn).toLocaleString('vi-VN') : '-'}
                </Typography.Text>
              </Space>
              <Space size={4} style={{ alignItems: 'center' }}>
                <CalendarOutlined style={{ color: '#ff4d4f', fontSize: 12, width: 12 }} />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Trả: {gb.checkOut ? new Date(gb.checkOut).toLocaleString('vi-VN') : '-'}
                </Typography.Text>
              </Space>
              {gb.roomCount && (
                <Space size={4} style={{ alignItems: 'center' }}>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {gb.roomCount} phòng, {gb.peopleCount || 0} người
                  </Typography.Text>
                </Space>
              )}
            </Space>
          </div>
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
      }
      
      // Booking thông thường
      if (r.bookingId) {
        const booking = r.bookingId;
        const content = (
          <div>
            <Space size={4} style={{ marginBottom: 4 }}>
              <Tag color="blue" style={{ margin: 0 }}>
                Đặt phòng
              </Tag>
              <Typography.Text strong copyable={{ text: booking._id }}>
                {booking._id}
              </Typography.Text>
            </Space>
            <br />
            <Space direction="vertical" size={0} style={{ alignItems: 'flex-start' }}>
              <Space size={4} style={{ alignItems: 'center' }}>
                <CalendarOutlined style={{ color: '#52c41a', fontSize: 12, width: 12 }} />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Nhận: {booking.checkIn ? new Date(booking.checkIn).toLocaleString('vi-VN') : '-'}
                </Typography.Text>
              </Space>
              <Space size={4} style={{ alignItems: 'center' }}>
                <CalendarOutlined style={{ color: '#ff4d4f', fontSize: 12, width: 12 }} />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Trả: {booking.checkOut ? new Date(booking.checkOut).toLocaleString('vi-VN') : '-'}
                </Typography.Text>
              </Space>
            </Space>
          </div>
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
      }
      
      // Không có booking hoặc group booking
      return (
        <Typography.Text type="secondary">-</Typography.Text>
      );
    }
  },
  {
    title: "Khách hàng",
    key: "customer",
    render: (_, r) => {
      // Kiểm tra group booking trước
      if (r.groupBookingId) {
        const gb = r.groupBookingId;
        return (
          <div>
            <Typography.Text strong>{gb.requesterName || "-"}</Typography.Text>
            {(gb.requesterPhone || gb.requesterEmail) && (
              <>
                <br />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {gb.requesterPhone || ""}
                  {gb.requesterPhone && gb.requesterEmail ? " | " : ""}
                  {gb.requesterEmail || ""}
                </Typography.Text>
              </>
            )}
          </div>
        );
      }
      
      // Booking thông thường
      let customerName = "-";
      let customerContact = "";
      
      if (r.customerId?.fullName) {
        // Khách hàng online
        customerName = r.customerId.fullName;
        customerContact = r.customerId.email || r.customerId.phoneNumber || "";
      } else if (r.bookingId?.guests && r.bookingId.guests.length > 0) {
        // Khách hàng walk_in - lấy tên khách chính
        const mainGuest = r.bookingId.guests.find((guest) => guest.isMainGuest) || r.bookingId.guests[0];
        customerName = mainGuest?.fullName || "-";
        customerContact = mainGuest?.phoneNumber || mainGuest?.email || "";
      } else if (r.bookingId?.guestInfo?.fullName) {
        // Fallback cho dữ liệu cũ
        customerName = r.bookingId.guestInfo.fullName;
        customerContact = r.bookingId.guestInfo.phoneNumber || r.bookingId.guestInfo.email || "";
      }
      
      return (
        <div>
          <Typography.Text strong>{customerName}</Typography.Text>
          {customerContact && (
            <>
              <br />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {customerContact}
              </Typography.Text>
            </>
          )}
        </div>
      );
    }
  },
  {
    title: (
      <Space>
        <DollarOutlined style={{ color: '#fa8c16' }} />
        <span>Thanh toán</span>
      </Space>
    ),
    key: "payment",
    render: (_, r) => (
      <Space direction="vertical" size={0} style={{ alignItems: 'flex-start' }}>
        <Space>
          <DollarOutlined style={{ color: '#fa8c16' }} />
          <Typography.Text strong style={{ color: '#fa8c16' }}>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(r.totalAmount)}
          </Typography.Text>
        </Space>
        {r.paidAmount !== undefined && r.remainingAmount !== undefined && (
          <Space direction="vertical" size={0} style={{ fontSize: '11px', color: '#666' }}>
            <div>Đã thanh toán: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(r.paidAmount)}</div>
            <div>Còn lại: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(r.remainingAmount)}</div>
          </Space>
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
        pending: { color: 'orange', text: 'Chờ thanh toán', icon: <ClockCircleOutlined /> },
        paid: { color: 'green', text: 'Đã thanh toán', icon: <CheckCircleOutlined /> },
        failed: { color: 'red', text: 'Thất bại', icon: <CloseCircleOutlined /> },
        refunded: { color: 'blue', text: 'Hoàn tiền', icon: <RollbackOutlined /> },
      };
      const v = map[status] || { color: 'default', text: status, icon: null };
      return (
        <Tag color={v.color} icon={v.icon}>
          {v.text}
        </Tag>
      );
    }
  },
  {
    title: (
      <Space>
        <FileTextOutlined style={{ color: '#1890ff' }} />
        <span>Thanh toán</span>
      </Space>
    ),
    dataIndex: "paymentStatus",
    key: "paymentStatus",
    render: (s: string) => {
      const map: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
        pending: { color: 'orange', text: 'Chờ thanh toán', icon: <ClockCircleOutlined /> },
        partial_paid: { color: 'blue', text: 'Thanh toán 50%', icon: <CheckCircleOutlined /> },
        paid: { color: 'green', text: 'Đã thanh toán đủ', icon: <CheckCircleOutlined /> },
        failed: { color: 'red', text: 'Thất bại', icon: <CloseCircleOutlined /> },
        refunded: { color: 'blue', text: 'Hoàn tiền', icon: <RollbackOutlined /> },
        refund_requested: { color: 'purple', text: 'Yêu cầu hoàn tiền', icon: <FileTextOutlined /> },
        cancelled: { color: 'red', text: 'Đã hủy', icon: <CloseCircleOutlined /> },
      };
      const v = map[s] || { color: 'default', text: s || 'N/A', icon: null };
      return (
        <Tag color={v.color} icon={v.icon}>
          {v.text}
        </Tag>
      );
    }
  },
  {
    title: (
      <Space>
        <FileTextOutlined style={{ color: '#13c2c2' }} />
        <span>Phát hành</span>
      </Space>
    ),
    key: "issuedAt",
    render: (_, r) => (
      r.issuedAt ? (
        <Space>
          <FileTextOutlined style={{ color: '#13c2c2' }} />
          <Typography.Text type="secondary">
            {new Date(r.issuedAt).toLocaleString('vi-VN')}
          </Typography.Text>
        </Space>
      ) : (
        <Space>
          <FileTextOutlined style={{ color: '#d9d9d9' }} />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Chưa phát hành
          </Typography.Text>
        </Space>
      )
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
    )
  }
];
