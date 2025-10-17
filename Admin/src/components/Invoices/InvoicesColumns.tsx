import { Space, Tag, Avatar, Typography, Button } from "antd";
import { 
  CalendarOutlined, 
  UserOutlined, 
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
    title: (
      <Space>
        <CalendarOutlined style={{ color: '#1890ff' }} />
        <span>Booking</span>
      </Space>
    ),
    key: "booking",
    render: (_, r) => {
      const content = (
        <Space>
          <Avatar 
            size="small" 
            icon={<CalendarOutlined />} 
            style={{ backgroundColor: '#1890ff' }}
          />
          <div>
            <Typography.Text strong>
              Mã: {r.bookingId?._id?.slice(0,8)}...
            </Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Nhận: {r.bookingId?.checkIn ? new Date(r.bookingId.checkIn).toLocaleString('vi-VN') : '-'}
            </Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Trả: {r.bookingId?.checkOut ? new Date(r.bookingId.checkOut).toLocaleString('vi-VN') : '-'}
            </Typography.Text>
          </div>
        </Space>
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
  },
  {
    title: (
      <Space>
        <UserOutlined style={{ color: '#52c41a' }} />
        <span>Khách hàng</span>
      </Space>
    ),
    key: "customer",
    render: (_, r) => {
      const name = r.customerId?.fullName || r.bookingId?.guestInfo?.fullName || '-';
      const email = r.customerId?.email || r.bookingId?.guestInfo?.email || '';
      return (
        <Space>
          <Avatar 
            size="small" 
            icon={<UserOutlined />} 
            style={{ backgroundColor: '#52c41a' }}
          />
          <div>
            <Typography.Text strong>{name}</Typography.Text>
            {email && (
              <>
                <br />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {email}
                </Typography.Text>
              </>
            )}
          </div>
        </Space>
      );
    }
  },
  {
    title: (
      <Space>
        <DollarOutlined style={{ color: '#fa8c16' }} />
        <span>Tổng tiền</span>
      </Space>
    ),
    key: "totalAmount",
    render: (_, r) => (
      <Space>
        <DollarOutlined style={{ color: '#fa8c16' }} />
        <Typography.Text strong style={{ color: '#fa8c16' }}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(r.totalAmount)}
        </Typography.Text>
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
