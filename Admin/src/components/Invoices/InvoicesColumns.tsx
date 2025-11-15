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
    title: "Khách hàng",
    key: "customer",
    align: 'center',
    render: (_, r) => {
      // Kiểm tra group booking trước
      if (r.groupBookingId) {
        const gb = r.groupBookingId;
        return (
          <div style={{ textAlign: 'center' }}>
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
        <div style={{ textAlign: 'center' }}>
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
        <EyeOutlined style={{ color: '#722ed1' }} />
        <span>Thao tác</span>
      </Space>
    ),
    key: "actions",
    render: (_, r) => (
      handleDetail ? (
        <Button 
          type="link" 
          size="small" 
          icon={<EyeOutlined />}
          onClick={() => handleDetail(r)}
        >
          Chi tiết
        </Button>
      ) : null
    )
  }
];
