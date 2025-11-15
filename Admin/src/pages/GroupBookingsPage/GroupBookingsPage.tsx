import React, { useEffect, useMemo, useState } from 'react';
import { Table, Tag, Space, Button, message, Tooltip, Modal, Descriptions, InputNumber, Input, Form, Card, Row, Col, Select, DatePicker, Alert, Divider, Typography, Drawer } from 'antd';
import { CheckCircleOutlined, UploadOutlined, DollarOutlined, FileExcelOutlined, ReloadOutlined, DownloadOutlined, CalendarOutlined, UserOutlined, HomeOutlined, EyeOutlined, TeamOutlined } from '@ant-design/icons';
import axios from 'axios';
import GroupBookingStatistics from '../../components/GroupBookings/GroupBookingStatistics';

const GROUP_DEPOSIT_RATE = 0.5;
const GROUP_DEPOSIT_PERCENT_LABEL = `${Math.round(GROUP_DEPOSIT_RATE * 100)}%`;

const computeFinancials = (item: GroupBookingItem) => {
  const total = Number(item.quoteAmount || item.invoice?.totalAmount || 0);
  const paid = Number(
    item.paidAmount ??
      item.invoice?.paidAmount ??
      (item.status === 'deposit_paid'
        ? Math.round(total * GROUP_DEPOSIT_RATE)
        : item.status === 'paid'
          ? total
          : 0)
  );
  const remain = Number(
    item.remainingAmount ??
      item.invoice?.remainingAmount ??
      Math.max(0, total - paid)
  );
  return { total, paid, remain };
};

const API_URL = 'http://localhost:8080/api/v1';

type GroupBookingStatus =
  | 'pending_approval'
  | 'approved'
  | 'info_uploaded'
  | 'quoted'
  | 'awaiting_payment'
  | 'deposit_paid'
  | 'paid'
  | 'confirmed'
  | 'refund_requested'
  | 'refunded'
  | 'cancelled'
  | 'rejected';

interface GroupMember {
  fullName: string;
  idNumber?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  email?: string;
  isLeader?: boolean;
  roomNumber?: string;
}

interface GroupBookingItem {
  _id: string;
  requesterName: string;
  requesterPhone: string;
  requesterEmail?: string;
  checkIn: string;
  checkOut: string;
  peopleCount: number;
  roomCount: number;
  notes?: string;
  status: GroupBookingStatus;
  quoteAmount?: number;
  paymentLink?: string;
  allocatedRoomIds?: Array<{ _id: string; roomNumber: string }>;
  members?: GroupMember[];
  refundAmount?: number;
  refundRequestedAt?: string;
  refundProcessedAt?: string;
  rejectedAt?: string;
  paidAmount?: number;
  remainingAmount?: number;
  invoice?: {
    totalAmount?: number;
    paidAmount?: number;
    remainingAmount?: number;
    paymentStatus?: string;
  };
  createdAt: string;
}

const statusColor: Record<GroupBookingStatus, string> = {
  pending_approval: 'default',
  approved: 'blue',
  info_uploaded: 'purple',
  quoted: 'orange',
  awaiting_payment: 'gold',
  deposit_paid: 'teal',
  paid: 'green',
  confirmed: 'cyan',
  refund_requested: 'orange',
  refunded: 'green',
  cancelled: 'red',
  rejected: 'red',
};

const statusLabel: Record<GroupBookingStatus, string> = {
  pending_approval: 'Chờ duyệt',
  approved: 'Đã duyệt',
  info_uploaded: 'Đã upload danh sách',
  quoted: 'Đã báo giá',
  awaiting_payment: 'Chờ thanh toán',
  deposit_paid: 'Đã nhận đặt cọc 50%',
  paid: 'Đã thanh toán',
  confirmed: 'Đã xác nhận',
  refund_requested: 'Đang xử lý hoàn tiền',
  refunded: 'Đã hoàn tiền',
  cancelled: 'Đã hủy',
  rejected: 'Đã từ chối',
};

const GroupBookingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<GroupBookingItem[]>([]);
  const [viewItem, setViewItem] = useState<GroupBookingItem | null>(null);
  const [membersDetailOpen, setMembersDetailOpen] = useState<boolean>(false);
  const [quoteOpen, setQuoteOpen] = useState<boolean>(false);
  const [quoteTarget, setQuoteTarget] = useState<GroupBookingItem | null>(null);
  const [quoteAmount, setQuoteAmount] = useState<number | null>(null);
  const [paymentLink, setPaymentLink] = useState<string>("");
  const [autoBreakdown, setAutoBreakdown] = useState<Array<{ 
    roomId: string; 
    roomNumber: string; 
    typeName?: string; 
    pricePerNight: number; 
    capacity?: number;
    extraHourPrice?: number;
    maxExtendHours?: number;
    amenities?: string[];
    nights: number; 
    subtotal: number;
  }>>([]);
  const [statistics, setStatistics] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    paidBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
  });

  // Filters
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<GroupBookingStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<any>(null);

  const openQuote = (item: GroupBookingItem) => {
    setQuoteTarget(item);
    setQuoteAmount(item.quoteAmount ?? null);
    setPaymentLink(item.paymentLink ?? "");
    setQuoteOpen(true);
  };

  const submitQuote = async () => {
    if (!quoteTarget) return;
    try {
      await axios.post(`${API_URL}/group-bookings/${quoteTarget._id}/quote`, {
        quoteAmount: quoteAmount ?? 0,
        paymentLink: paymentLink || undefined,
      });
      message.success('Đã cập nhật báo giá');
      setQuoteOpen(false);
      setQuoteTarget(null);
      load();
    } catch (e: any) {
      message.error(e?.response?.data?.message || e?.message || 'Không thể cập nhật báo giá');
    }
  };

  const autoQuote = async () => {
    if (!quoteTarget) return;
    try {
      const { data } = await axios.get(`${API_URL}/group-bookings/${quoteTarget._id}/auto-quote`);
      const amount = data?.data?.amount ?? data?.amount;
      const breakdown = data?.data?.breakdown ?? data?.breakdown ?? [];
      if (typeof amount === 'number') {
        setQuoteAmount(amount);
        setAutoBreakdown(breakdown);
        message.success(`Tạm tính: ${amount.toLocaleString()} VND`);
      } else {
        message.warning('Không tính được báo giá tự động');
      }
    } catch (e: any) {
      message.error(e?.response?.data?.message || e?.message || 'Không thể tính tự động');
    }
  };

  const calculateStatistics = (data: GroupBookingItem[]) => {
    const totalBookings = data.length;
    const pendingBookings = data.filter(item => item.status === 'pending_approval').length;
    const approvedBookings = data.filter(item => ['approved', 'info_uploaded', 'quoted', 'awaiting_payment', 'deposit_paid'].includes(item.status)).length;
    const paidBookings = data.filter(item => ['paid', 'confirmed'].includes(item.status)).length;
    const cancelledBookings = data.filter(item => ['cancelled', 'rejected'].includes(item.status)).length;
    
    const totalRevenue = data
      .filter(item => ['paid', 'confirmed', 'deposit_paid'].includes(item.status))
      .reduce((sum, item) => {
        const { paid } = computeFinancials(item);
        return sum + paid;
      }, 0);
    
    setStatistics({
      totalBookings,
      pendingBookings,
      approvedBookings,
      paidBookings,
      cancelledBookings,
      totalRevenue,
    });
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/group-bookings`);
      const list: GroupBookingItem[] = Array.isArray(data?.data) ? data.data : data;
      setItems(list || []);
      calculateStatistics(list || []);
    } catch (e: any) {
      message.error(e?.response?.data?.message || e?.message || 'Không thể tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id: string) => {
    try {
      await axios.post(`${API_URL}/group-bookings/${id}/approve`);
      message.success('Đã duyệt yêu cầu');
      load();
    } catch (e: any) {
      message.error(e?.response?.data?.message || e?.message || 'Không thể duyệt');
    }
  };

  const openTemplate = (id: string) => {
    window.open(`${API_URL}/group-bookings/${id}/template`, '_blank');
  };

  const markPaid = async (id: string) => {
    try {
      await axios.post(`${API_URL}/group-bookings/${id}/paid`);
      message.success('Đã đánh dấu đã thanh toán');
      load();
    } catch (e: any) {
      message.error(e?.response?.data?.message || e?.message || 'Không thể cập nhật thanh toán');
    }
  };

  const markFullPayment = async (id: string) => {
    Modal.confirm({
      title: 'Hoàn tất thanh toán',
      content: 'Xác nhận đã nhận đủ tiền cho đặt đoàn này?',
      okText: 'Hoàn tất',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await axios.post(`${API_URL}/group-bookings/${id}/full-payment`);
          message.success('Đã cập nhật thanh toán đầy đủ');
          load();
        } catch (e: any) {
          message.error(e?.response?.data?.message || e?.message || 'Không thể hoàn tất thanh toán');
        }
      },
    });
  };

  const confirm = async (id: string) => {
    try {
      await axios.post(`${API_URL}/group-bookings/${id}/confirm`);
      message.success('Đã xác nhận đặt đoàn');
      load();
    } catch (e: any) {
      message.error(e?.response?.data?.message || e?.message || 'Không thể xác nhận');
    }
  };

  const markRefunded = async (id: string) => {
    Modal.confirm({
      title: 'Xác nhận hoàn tiền đặt đoàn',
      content: 'Thao tác này sẽ đánh dấu hoàn tiền hoàn tất và cập nhật hóa đơn, thanh toán tương ứng.',
      okText: 'Hoàn tiền',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await axios.post(`${API_URL}/group-bookings/${id}/refund`);
          message.success('Đã đánh dấu hoàn tiền thành công');
          load();
        } catch (e: any) {
          message.error(e?.response?.data?.message || e?.message || 'Không thể hoàn tiền');
        }
      },
    });
  };

  const filteredItems = useMemo(() => {
    let list = items;
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((i) =>
        i.requesterName.toLowerCase().includes(s) ||
        i.requesterPhone.toLowerCase().includes(s) ||
        (i.requesterEmail || '').toLowerCase().includes(s) ||
        i._id.toLowerCase().includes(s)
      );
    }
    if (status !== 'all') {
      list = list.filter((i) => i.status === status);
    }
    if (dateRange && dateRange[0] && dateRange[1]) {
      const [start, end] = dateRange;
      const s = start.startOf('day').toDate().getTime();
      const e = end.endOf('day').toDate().getTime();
      list = list.filter((i) => {
        const t = new Date(i.createdAt).getTime();
        return t >= s && t <= e;
      });
    }
    return list;
  }, [items, search, status, dateRange]);

  const columns = [
    {
      title: 'Người liên hệ',
      dataIndex: 'requesterName',
      key: 'requesterName',
      width: 200,
      align: 'center',
      render: (name: string, r: GroupBookingItem) => (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <Typography.Text strong>{name}</Typography.Text>
          {r.requesterPhone && (
            <>
              <br />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {r.requesterPhone}
              </Typography.Text>
            </>
          )}
        </div>
      )
    },
    {
      title: (
        <Space>
          <CalendarOutlined style={{ color: '#52c41a' }} />
          <span>Ngày</span>
        </Space>
      ),
      key: 'dates',
      width: 180,
      align: 'center',
      render: (_: any, r: GroupBookingItem) => (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <Space direction="vertical" size={4}>
            <Space size={4}>
              <CalendarOutlined style={{ color: '#52c41a', fontSize: 12 }} />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Nhận: {new Date(r.checkIn).toLocaleDateString('vi-VN')}
              </Typography.Text>
            </Space>
            <Space size={4}>
              <CalendarOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Trả: {new Date(r.checkOut).toLocaleDateString('vi-VN')}
              </Typography.Text>
            </Space>
          </Space>
        </div>
      )
    },
    { 
      title: (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <span>Khách</span>
        </Space>
      ), 
      dataIndex: 'peopleCount', 
      key: 'peopleCount',
      width: 120,
      align: 'center',
      render: (count: number) => (
        <div style={{ padding: '8px 0' }}>
          <Tag color="cyan" icon={<UserOutlined />}>
            {count} người
          </Tag>
        </div>
      )
    },
    { 
      title: (
        <Space>
          <HomeOutlined style={{ color: '#fa8c16' }} />
          <span>Phòng</span>
        </Space>
      ), 
      dataIndex: 'roomCount', 
      key: 'roomCount',
      width: 120,
      align: 'center',
      render: (count: number) => (
        <div style={{ padding: '8px 0' }}>
          <Tag color="orange" icon={<HomeOutlined />}>
            {count} phòng
          </Tag>
        </div>
      )
    },
    {
      title: (
        <Space>
          <DollarOutlined style={{ color: '#fa8c16' }} />
          <span>Thanh toán</span>
        </Space>
      ),
      key: 'payment',
      width: 220,
      align: 'center',
      render: (_: any, r: GroupBookingItem) => {
        const { total, paid, remain } = computeFinancials(r);
        if (!total) return (
          <div style={{ padding: '8px 0' }}>
            <Typography.Text type="secondary">-</Typography.Text>
          </div>
        );
        return (
          <div style={{ padding: '8px 0', textAlign: 'left' }}>
            <Space direction="vertical" size={4} style={{ alignItems: 'flex-start' }}>
              <Space>
                <DollarOutlined style={{ color: '#fa8c16' }} />
                <Typography.Text strong style={{ color: '#fa8c16' }}>
                  {total.toLocaleString()} VND
                </Typography.Text>
              </Space>
              {paid > 0 && (
                <Typography.Text type="secondary" style={{ fontSize: 12, color: '#52c41a' }}>
                  Đã thanh toán: {paid.toLocaleString()} VND
                </Typography.Text>
              )}
              {remain > 0 && (
                <Typography.Text type="secondary" style={{ fontSize: 12, color: '#ff4d4f' }}>
                  Còn lại: {remain.toLocaleString()} VND
                </Typography.Text>
              )}
            </Space>
          </div>
        );
      }
    },
    {
      title: (
        <Space>
          <CheckCircleOutlined style={{ color: '#722ed1' }} />
          <span>Trạng thái</span>
        </Space>
      ),
      dataIndex: 'status',
      key: 'status',
      width: 160,
      align: 'center',
      render: (s: GroupBookingStatus) => (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <Tag color={statusColor[s]}>{statusLabel[s]}</Tag>
        </div>
      )
    },
    {
      title: (
        <Space>
          <EyeOutlined style={{ color: '#722ed1' }} />
          <span>Thao tác</span>
        </Space>
      ),
      key: 'actions',
      width: 140,
      align: 'center',
      fixed: 'right' as const,
      render: (_: any, r: GroupBookingItem) => (
        <div style={{ padding: '8px 0' }}>
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => setViewItem(r)}
          >
            Chi tiết
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Typography.Title level={4}>
          <TeamOutlined /> Quản lý đặt đoàn
        </Typography.Title>
      </div>

      {/* Statistics */}
      <GroupBookingStatistics
        totalBookings={statistics.totalBookings}
        pendingBookings={statistics.pendingBookings}
        approvedBookings={statistics.approvedBookings}
        paidBookings={statistics.paidBookings}
        cancelledBookings={statistics.cancelledBookings}
        totalRevenue={statistics.totalRevenue}
      />

      {/* Search và Filter */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={8}>
            <Input 
              placeholder="Tìm theo mã, tên, điện thoại, email" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              allowClear 
            />
          </Col>
          <Col xs={12} md={6}>
            <Select
              value={status}
              onChange={(v) => setStatus(v as any)}
              style={{ width: '100%' }}
              options={[
                { label: 'Tất cả trạng thái', value: 'all' },
                ...Object.entries(statusLabel).map(([k, v]) => ({ label: v, value: k }))
              ]}
            />
          </Col>
          <Col xs={12} md={8}>
            <DatePicker.RangePicker style={{ width: '100%' }} onChange={(v) => setDateRange(v)} />
          </Col>
          <Col xs={24} md={2}>
            <Button block icon={<ReloadOutlined />} onClick={load}>Tải</Button>
          </Col>
        </Row>
      </Card>
      <Table
        rowKey="_id"
        loading={loading}
        dataSource={filteredItems}
        columns={columns as any}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        sticky
        scroll={{ x: 'max-content' }}
        bordered
        expandable={{
          expandedRowRender: (r: GroupBookingItem) => {
            const { total, paid, remain } = computeFinancials(r);
            return (
              <div style={{ padding: '16px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                <Descriptions title="Chi tiết nhanh" size="small" column={2} bordered>
                  <Descriptions.Item label="Mã">
                    <Typography.Text copyable={{ text: r._id }}>
                      {r._id}
                    </Typography.Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Người liên hệ">{r.requesterName}</Descriptions.Item>
                  <Descriptions.Item label="Điện thoại">{r.requesterPhone}</Descriptions.Item>
                  <Descriptions.Item label="Email">{r.requesterEmail || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Ngày nhận">{new Date(r.checkIn).toLocaleDateString('vi-VN')}</Descriptions.Item>
                  <Descriptions.Item label="Ngày trả">{new Date(r.checkOut).toLocaleDateString('vi-VN')}</Descriptions.Item>
                  <Descriptions.Item label="Báo giá">{r.quoteAmount != null ? `${r.quoteAmount.toLocaleString()} VND` : '-'}</Descriptions.Item>
                  {total > 0 && (
                    <>
                      <Descriptions.Item label="Tổng tiền">{total.toLocaleString()} VND</Descriptions.Item>
                      <Descriptions.Item label="Đã thanh toán" span={2}>
                        <Typography.Text style={{ color: '#52c41a' }}>
                          {paid.toLocaleString()} VND
                        </Typography.Text>
                      </Descriptions.Item>
                      {remain > 0 && (
                        <Descriptions.Item label="Còn lại" span={2}>
                          <Typography.Text style={{ color: '#ff4d4f' }}>
                            {remain.toLocaleString()} VND
                          </Typography.Text>
                        </Descriptions.Item>
                      )}
                    </>
                  )}
                </Descriptions>
                <Divider style={{ margin: '12px 0' }} />
                <Typography.Text strong>Danh sách đoàn ({r.members?.length || 0} thành viên):</Typography.Text>
                {Array.isArray(r.members) && r.members.length > 0 ? (
                  <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                    {r.members.map((m, idx) => (
                      <li key={idx}>
                        <Typography.Text strong>{m.fullName}</Typography.Text>
                        {m.isLeader && <Tag color="orange" style={{ marginLeft: 8 }}>Trưởng đoàn</Tag>}
                        {m.roomNumber && <Tag color="blue" style={{ marginLeft: 8 }}>Phòng {m.roomNumber}</Tag>}
                        {m.phoneNumber && <Typography.Text type="secondary" style={{ marginLeft: 8 }}> - {m.phoneNumber}</Typography.Text>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ marginTop: 8 }}><Tag>Chưa có</Tag></div>
                )}
              </div>
            );
          }
        }}
      />

      <Drawer
        title={`Chi tiết đặt đoàn`}
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        width={680}
      >
        {viewItem && (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Mã">
              <Typography.Text copyable={{ text: viewItem._id }}>
                {viewItem._id}
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="Người liên hệ">
              <Typography.Text strong>{viewItem.requesterName}</Typography.Text>
              <br />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {viewItem.requesterPhone}
                {viewItem.requesterPhone && viewItem.requesterEmail ? ' | ' : ''}
                {viewItem.requesterEmail || ''}
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày nhận phòng">
              {new Date(viewItem.checkIn).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày trả phòng">
              {new Date(viewItem.checkOut).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Số khách/phòng">
              <Tag color="cyan" icon={<UserOutlined />}>{viewItem.peopleCount} người</Tag>
              <Tag color="orange" icon={<HomeOutlined />} style={{ marginLeft: 8 }}>{viewItem.roomCount} phòng</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusColor[viewItem.status]}>{statusLabel[viewItem.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Báo giá">
              {viewItem.quoteAmount ? (
                <Typography.Text strong style={{ color: '#fa8c16' }}>
                  {viewItem.quoteAmount.toLocaleString()} VND
                </Typography.Text>
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Đã thanh toán">
              {typeof viewItem.paidAmount === 'number'
                ? `${viewItem.paidAmount.toLocaleString()} VND`
                : viewItem.invoice?.paidAmount != null
                  ? `${viewItem.invoice.paidAmount.toLocaleString()} VND`
                  : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Còn lại">
              {typeof viewItem.remainingAmount === 'number'
                ? `${viewItem.remainingAmount.toLocaleString()} VND`
                : viewItem.invoice?.remainingAmount != null
                  ? `${viewItem.invoice.remainingAmount.toLocaleString()} VND`
                  : viewItem.quoteAmount != null
                    ? `${Math.max(0, viewItem.quoteAmount - Math.round(viewItem.quoteAmount * GROUP_DEPOSIT_RATE)).toLocaleString()} VND`
                    : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Link thanh toán">{viewItem.paymentLink ? <a href={viewItem.paymentLink} target="_blank">{viewItem.paymentLink}</a> : '-'}</Descriptions.Item>
            <Descriptions.Item label="Ghi chú">{viewItem.notes || '-'}</Descriptions.Item>
            <Descriptions.Item label="Hoàn tiền">
              {viewItem.status === 'refund_requested'
                ? 'Khách yêu cầu hoàn tiền'
                : viewItem.status === 'refunded'
                  ? `Đã hoàn ${viewItem.refundAmount?.toLocaleString() || viewItem.quoteAmount?.toLocaleString() || 0} VND`
                  : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Chi tiết đoàn">
              {Array.isArray(viewItem.members) && viewItem.members.length > 0 ? (
                <Button type="link" onClick={() => setMembersDetailOpen(true)}>
                  Xem chi tiết ({viewItem.members.length} thành viên)
                </Button>
              ) : 'Chưa có'}
            </Descriptions.Item>
          </Descriptions>
        )}
        {viewItem && (
          <>
            <Divider />
            <Space wrap>
              <Tooltip title="Duyệt yêu cầu">
                <Button disabled={viewItem.status !== 'pending_approval'} type="primary" onClick={() => approve(viewItem._id)}>
                  Duyệt
                </Button>
              </Tooltip>
              <Tooltip title="Tải Excel mẫu">
                <Button icon={<FileExcelOutlined />} onClick={() => openTemplate(viewItem._id)}>Mẫu</Button>
              </Tooltip>
              <Tooltip title="Gửi báo giá / Link thanh toán">
                <Button 
                  disabled={
                    !(viewItem.status === 'approved' || viewItem.status === 'info_uploaded') ||
                    (viewItem.quoteAmount != null && viewItem.quoteAmount > 0) ||
                    ['quoted', 'awaiting_payment', 'deposit_paid', 'paid', 'confirmed'].includes(viewItem.status)
                  } 
                  onClick={() => openQuote(viewItem)}
                >
                  Báo giá
                </Button>
              </Tooltip>
              <Tooltip title="Tải file danh sách đã upload">
                <Button
                  disabled={
                    !(
                      viewItem.status === 'info_uploaded' ||
                      viewItem.status === 'quoted' ||
                      viewItem.status === 'awaiting_payment' ||
                      viewItem.status === 'deposit_paid' ||
                      viewItem.status === 'paid' ||
                      viewItem.status === 'confirmed'
                    )
                  }
                  icon={<DownloadOutlined />}
                  onClick={() => window.open(`${API_URL}/group-bookings/${viewItem._id}/members.xlsx`, '_blank')}
                >
                  Danh sách
                </Button>
              </Tooltip>
              <Tooltip title="Đánh dấu đã thanh toán">
                <Button disabled={!(viewItem.status === 'quoted' || viewItem.status === 'awaiting_payment')} icon={<DollarOutlined />} onClick={() => markPaid(viewItem._id)}>Đã TT</Button>
              </Tooltip>
              <Tooltip title="Hoàn tất thanh toán toàn bộ">
                <Button
                  disabled={(() => {
                    const { total, paid, remain } = computeFinancials(viewItem);
                    return !(
                      total > 0 &&
                      remain > 0 &&
                      (viewItem.status === 'deposit_paid' || viewItem.status === 'confirmed')
                    );
                  })()}
                  icon={<CheckCircleOutlined />}
                  onClick={() => markFullPayment(viewItem._id)}
                >
                  Thu đủ tiền
                </Button>
              </Tooltip>
              <Tooltip title="Xác nhận hoàn tất">
                <Button
                  disabled={!(viewItem.status === 'paid' || viewItem.status === 'deposit_paid')}
                  type="dashed"
                  icon={<CheckCircleOutlined />}
                  onClick={() => confirm(viewItem._id)}
                >
                  Xác nhận
                </Button>
              </Tooltip>
              <Tooltip title="Hoàn tiền cho khách">
                <Button danger disabled={viewItem.status !== 'refund_requested'} onClick={() => markRefunded(viewItem._id)}>
                  Hoàn tiền
                </Button>
              </Tooltip>
            </Space>
          </>
        )}
      </Drawer>

      <Modal open={quoteOpen} onCancel={() => setQuoteOpen(false)} onOk={submitQuote} title={quoteTarget ? `Báo giá cho ${quoteTarget._id}` : 'Báo giá'} okText="Lưu">
        <Form layout="vertical">
          <Form.Item label="Số tiền (VND)">
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              value={quoteAmount as number | null}
              onChange={(v) => setQuoteAmount(typeof v === 'number' ? v : null)}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number((value || '').replace(/,/g, ''))}
            />
          </Form.Item>
          <Form.Item label="Link thanh toán (tùy chọn)">
            <Input placeholder="https://..." value={paymentLink} onChange={(e) => setPaymentLink(e.target.value)} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={autoQuote}>Tính tự động</Button>
            </Space>
          </Form.Item>
          {Array.isArray(autoBreakdown) && autoBreakdown.length > 0 && (
            <div style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
              <b>Chi tiết tạm tính:</b>
              <div style={{ marginTop: 12 }}>
                {autoBreakdown.map((b, idx) => (
                  <Card key={idx} size="small" style={{ marginBottom: 12, border: '1px solid #d9d9d9' }}>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Phòng {b.roomNumber}</strong> - {b.typeName || 'N/A'}
                    </div>
                    <Descriptions size="small" column={2} bordered>
                      <Descriptions.Item label="Số người tối đa">{b.capacity || '-'} người</Descriptions.Item>
                      <Descriptions.Item label="Giá/đêm">{b.pricePerNight.toLocaleString()} VND</Descriptions.Item>
                      <Descriptions.Item label="Số đêm">{b.nights} đêm</Descriptions.Item>
                      <Descriptions.Item label="Tổng phụ"><strong>{b.subtotal.toLocaleString()} VND</strong></Descriptions.Item>
                      {b.extraHourPrice && b.extraHourPrice > 0 && (
                        <>
                          <Descriptions.Item label="Giá giờ thêm">{b.extraHourPrice.toLocaleString()} VND/giờ</Descriptions.Item>
                          <Descriptions.Item label="Số giờ tối đa">{b.maxExtendHours || '-'} giờ</Descriptions.Item>
                        </>
                      )}
                    </Descriptions>
                    {Array.isArray(b.amenities) && b.amenities.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <strong>Tiện ích:</strong>
                        <div style={{ marginTop: 4 }}>
                          {b.amenities.map((a, aidx) => (
                            <Tag key={aidx} style={{ marginBottom: 4 }}>{a}</Tag>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </Form>
      </Modal>

      <Modal 
        open={membersDetailOpen} 
        onCancel={() => setMembersDetailOpen(false)} 
        footer={null} 
        title={`Chi tiết đoàn - ${viewItem?._id || ''}`}
        width={1400}
      >
        {viewItem && Array.isArray(viewItem.members) && viewItem.members.length > 0 ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Tag color="blue">Tổng số thành viên: {viewItem.members.length}</Tag>
              <Tag color="orange" style={{ marginLeft: 8 }}>
                Trưởng đoàn: {viewItem.members.filter(m => m.isLeader).length}
              </Tag>
            </div>
            <Table
              size="middle"
              dataSource={viewItem.members.map((m, idx) => ({ ...m, key: idx }))}
              columns={[
                { 
                  title: 'STT', 
                  dataIndex: 'key', 
                  width: 60, 
                  align: 'center',
                  fixed: 'left',
                  render: (v) => v + 1 
                },
                { 
                  title: 'Họ tên', 
                  dataIndex: 'fullName',
                  width: 200,
                  fixed: 'left',
                  render: (text, record) => (
                    <span>
                      <strong>{text}</strong>
                      {record.isLeader && (
                        <Tag color="orange" style={{ marginLeft: 8 }}>Trưởng đoàn</Tag>
                      )}
                    </span>
                  )
                },
                { 
                  title: 'CMND/CCCD', 
                  dataIndex: 'idNumber', 
                  width: 150,
                  render: (v) => v || '-'
                },
                { 
                  title: 'Ngày sinh', 
                  dataIndex: 'dateOfBirth', 
                  width: 130, 
                  render: (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '-' 
                },
                { 
                  title: 'Điện thoại', 
                  dataIndex: 'phoneNumber', 
                  width: 150,
                  render: (v) => v || '-'
                },
                { 
                  title: 'Email', 
                  dataIndex: 'email', 
                  width: 250,
                  render: (v) => v || '-'
                },
                { 
                  title: 'Phòng', 
                  dataIndex: 'roomNumber', 
                  width: 120,
                  align: 'center',
                  render: (v) => v ? (
                    <Tag color="blue" style={{ fontSize: '13px', padding: '4px 12px' }}>
                      Phòng {v}
                    </Tag>
                  ) : (
                    <Tag>-</Tag>
                  )
                },
              ]}
              pagination={false}
              scroll={{ x: 'max-content', y: 600 }}
              bordered
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Tag>Chưa có thông tin thành viên</Tag>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GroupBookingsPage;


