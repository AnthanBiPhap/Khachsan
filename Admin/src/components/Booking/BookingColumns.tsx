import { Space, Tag, Avatar, Typography, Button } from "antd";
import { 
  UserOutlined, 
  CalendarOutlined, 
  HomeOutlined, 
  DollarOutlined, 
  CreditCardOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  GlobalOutlined,
  ShopOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Booking } from "../../types/booking";

export const bookingColumns = (
  handleEdit: (record: Booking) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: Booking) => void
): ColumnsType<Booking> => [
  {
    title: (
      <Space>
        <UserOutlined style={{ color: '#1890ff' }} />
        <span>Khách hàng</span>
      </Space>
    ),
    key: "customer",
    render: (_, r) => {
      const fullName = r.customerId?.fullName || r.guestInfo?.fullName || '-';
      const emailOrPhone = r.customerId?.email || r.guestInfo?.phoneNumber || '';
      const content = (
        <Space>
          <Avatar 
            size="small" 
            icon={<UserOutlined />} 
            style={{ backgroundColor: r.customerId ? '#1890ff' : '#52c41a' }}
          />
          <div>
            <Typography.Text strong>{fullName}</Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {emailOrPhone}
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
        <GlobalOutlined style={{ color: '#52c41a' }} />
        <span>Nguồn</span>
      </Space>
    ),
    dataIndex: "source",
    key: "source",
    filters: [
      { text: 'Online', value: 'online' },
      { text: 'Trực tiếp', value: 'walk_in' },
    ],
    onFilter: (value, record) => record.source === value,
    render: (_, r) => (
      <Tag 
        color={r.source === 'online' ? 'blue' : 'purple'}
        icon={r.source === 'online' ? <GlobalOutlined /> : <ShopOutlined />}
      >
        {r.source === 'online' ? 'Online' : 'Trực tiếp'}
      </Tag>
    )
  },
  {
    title: (
      <Space>
        <HomeOutlined style={{ color: '#fa8c16' }} />
        <span>Phòng</span>
      </Space>
    ),
    key: "room",
    render: (_, r) => {
      const roomNumber = r.roomId?.roomNumber || r.roomId?._id || '-';
      const content = (
        <Space>
          <HomeOutlined style={{ color: '#fa8c16' }} />
          <Typography.Text strong>{roomNumber}</Typography.Text>
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
        <CalendarOutlined style={{ color: '#722ed1' }} />
        <span>Nhận/Trả</span>
      </Space>
    ),
    key: "time",
    render: (_, r) => (
      <Space direction="vertical" size={0}>
        <Space size={4}>
          <CalendarOutlined style={{ color: '#52c41a', fontSize: 12 }} />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Nhận: {r.checkIn ? new Date(r.checkIn).toLocaleString('vi-VN') : '-'}
          </Typography.Text>
        </Space>
        <Space size={4}>
          <CalendarOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Trả: {r.checkOut ? new Date(r.checkOut).toLocaleString('vi-VN') : '-'}
          </Typography.Text>
        </Space>
      </Space>
    )
  },
  {
    title: (
      <Space>
        <UserOutlined style={{ color: '#13c2c2' }} />
        <span>Khách</span>
      </Space>
    ),
    dataIndex: "guests",
    key: "guests",
    align: 'center',
    render: (guests) => (
      <Tag color="cyan" icon={<UserOutlined />}>
        {guests} người
      </Tag>
    )
  },
  {
    title: (
      <Space>
        <DollarOutlined style={{ color: '#52c41a' }} />
        <span>Tổng tiền</span>
      </Space>
    ),
    key: "totalPrice",
    render: (_, r) => (
      <Typography.Text strong style={{ color: '#52c41a' }}>
        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(r.totalPrice || 0)}
      </Typography.Text>
    )
  },
  {
    title: (
      <Space>
        <CreditCardOutlined style={{ color: '#1890ff' }} />
        <span>Thanh toán</span>
      </Space>
    ),
    dataIndex: "paymentStatus",
    key: "paymentStatus",
    render: (s: string) => {
      const map: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
        pending: { color: 'orange', text: 'Chờ thanh toán', icon: <CalendarOutlined /> },
        paid: { color: 'green', text: 'Đã thanh toán', icon: <CreditCardOutlined /> },
        failed: { color: 'red', text: 'Thất bại', icon: <DeleteOutlined /> },
        refunded: { color: 'blue', text: 'Hoàn tiền', icon: <DollarOutlined /> },
        refund_requested: { color: 'purple', text: 'Yêu cầu hoàn tiền', icon: <EditOutlined /> },
      };
      const v = map[s] || { color: 'default', text: s, icon: null };
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
