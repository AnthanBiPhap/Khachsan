import React, { useEffect, useMemo, useState } from 'react';
import { Table, Tag, Space, Button, message, Tooltip, Modal, Descriptions, InputNumber, Input, Form, Card, Row, Col, Select, DatePicker, Alert, Divider } from 'antd';
import { CheckCircleOutlined, UploadOutlined, DollarOutlined, FileExcelOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

type GroupBookingStatus =
  | 'pending_approval'
  | 'approved'
  | 'info_uploaded'
  | 'quoted'
  | 'awaiting_payment'
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
  createdAt: string;
}

const statusColor: Record<GroupBookingStatus, string> = {
  pending_approval: 'default',
  approved: 'blue',
  info_uploaded: 'purple',
  quoted: 'orange',
  awaiting_payment: 'gold',
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
  const [quoteOpen, setQuoteOpen] = useState<boolean>(false);
  const [quoteTarget, setQuoteTarget] = useState<GroupBookingItem | null>(null);
  const [quoteAmount, setQuoteAmount] = useState<number | null>(null);
  const [paymentLink, setPaymentLink] = useState<string>("");
  const [autoBreakdown, setAutoBreakdown] = useState<Array<{ roomId: string; roomNumber: string; typeName?: string; pricePerNight: number; nights: number; subtotal: number }>>([]);

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

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/group-bookings`);
      const list: GroupBookingItem[] = Array.isArray(data?.data) ? data.data : data;
      setItems(list || []);
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
      title: 'Mã',
      dataIndex: '_id',
      width: 220,
      render: (v: string, r: GroupBookingItem) => (
        <Button type="link" onClick={() => setViewItem(r)}>{v}</Button>
      )
    },
    { title: 'Người liên hệ', dataIndex: 'requesterName' },
    { title: 'Điện thoại', dataIndex: 'requesterPhone' },
    {
      title: 'Ngày',
      render: (_: any, r: GroupBookingItem) => (
        <span>{new Date(r.checkIn).toLocaleDateString()} → {new Date(r.checkOut).toLocaleDateString()}</span>
      )
    },
    { title: 'Khách', dataIndex: 'peopleCount', width: 80 },
    { title: 'Phòng', dataIndex: 'roomCount', width: 80 },
    {
      title: 'Báo giá',
      width: 140,
      render: (_: any, r: GroupBookingItem) => (
        r.quoteAmount != null ? `${r.quoteAmount.toLocaleString()} VND` : '-'
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (s: GroupBookingStatus) => <Tag color={statusColor[s]}>{statusLabel[s]}</Tag>
    },
    {
      title: 'Thao tác',
      width: 220,
      render: (_: any, r: GroupBookingItem) => (
        <Space>
          <Button icon={<ReloadOutlined />} onClick={load}>Tải lại</Button>
          <Button type="primary" onClick={() => setViewItem(r)}>Chi tiết</Button>
        </Space>
      )
    }
  ];

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={8}>
            <Input placeholder="Tìm theo mã, tên, điện thoại, email" value={search} onChange={(e) => setSearch(e.target.value)} allowClear />
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
        expandable={{
          expandedRowRender: (r: GroupBookingItem) => (
            <div>
              <Divider style={{ margin: '12px 0' }} />
              <Descriptions title="Chi tiết nhanh" size="small" column={2}>
                <Descriptions.Item label="Người liên hệ">{r.requesterName}</Descriptions.Item>
                <Descriptions.Item label="Điện thoại">{r.requesterPhone}</Descriptions.Item>
                <Descriptions.Item label="Ngày">{new Date(r.checkIn).toLocaleDateString()} → {new Date(r.checkOut).toLocaleDateString()}</Descriptions.Item>
                <Descriptions.Item label="Báo giá">{r.quoteAmount != null ? `${r.quoteAmount.toLocaleString()} VND` : '-'}</Descriptions.Item>
              </Descriptions>
              <Divider style={{ margin: '12px 0' }} />
              <b>Danh sách đoàn:</b>
              {Array.isArray(r.members) && r.members.length > 0 ? (
                <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                  {r.members.map((m, idx) => (
                    <li key={idx}>{m.fullName} {m.isLeader ? '(Trưởng đoàn)' : ''} {m.phoneNumber ? ` - ${m.phoneNumber}` : ''}</li>
                  ))}
                </ul>
              ) : (
                <div style={{ marginTop: 8 }}><Tag>Chưa có</Tag></div>
              )}
            </div>
          )
        }}
      />

      <Modal open={!!viewItem} onCancel={() => setViewItem(null)} footer={null} title={`Chi tiết ${viewItem?._id || ''}`} width={760}>
        {viewItem && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Người liên hệ">{viewItem.requesterName} - {viewItem.requesterPhone}</Descriptions.Item>
            <Descriptions.Item label="Email">{viewItem.requesterEmail || '-'}</Descriptions.Item>
            <Descriptions.Item label="Ngày">{new Date(viewItem.checkIn).toLocaleString()} → {new Date(viewItem.checkOut).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Số khách/phòng">{viewItem.peopleCount} / {viewItem.roomCount}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái"><Tag color={statusColor[viewItem.status]}>{statusLabel[viewItem.status]}</Tag></Descriptions.Item>
            <Descriptions.Item label="Báo giá">{viewItem.quoteAmount ? viewItem.quoteAmount.toLocaleString() : '-'}</Descriptions.Item>
            <Descriptions.Item label="Link thanh toán">{viewItem.paymentLink ? <a href={viewItem.paymentLink} target="_blank">{viewItem.paymentLink}</a> : '-'}</Descriptions.Item>
            <Descriptions.Item label="Ghi chú">{viewItem.notes || '-'}</Descriptions.Item>
            <Descriptions.Item label="Hoàn tiền">
              {viewItem.status === 'refund_requested'
                ? 'Khách yêu cầu hoàn tiền'
                : viewItem.status === 'refunded'
                  ? `Đã hoàn ${viewItem.refundAmount?.toLocaleString() || viewItem.quoteAmount?.toLocaleString() || 0} VND`
                  : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Danh sách đoàn">
              {Array.isArray(viewItem.members) && viewItem.members.length > 0 ? (
                <ul style={{ paddingLeft: 18 }}>
                  {viewItem.members.map((m, idx) => (
                    <li key={idx}>{m.fullName} {m.isLeader ? '(Trưởng đoàn)' : ''} {m.phoneNumber ? ` - ${m.phoneNumber}` : ''}</li>
                  ))}
                </ul>
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
                <Button disabled={!(viewItem.status === 'approved' || viewItem.status === 'info_uploaded' || viewItem.status === 'quoted' || viewItem.status === 'awaiting_payment')} onClick={() => openQuote(viewItem)}>
                  Báo giá
                </Button>
              </Tooltip>
              <Tooltip title="Tải file danh sách đã upload">
                <Button disabled={!(viewItem.status === 'info_uploaded' || viewItem.status === 'quoted' || viewItem.status === 'awaiting_payment' || viewItem.status === 'paid' || viewItem.status === 'confirmed')} icon={<DownloadOutlined />} onClick={() => window.open(`${API_URL}/group-bookings/${viewItem._id}/members.xlsx`, '_blank')}>Danh sách</Button>
              </Tooltip>
              <Tooltip title="Đánh dấu đã thanh toán">
                <Button disabled={!(viewItem.status === 'quoted' || viewItem.status === 'awaiting_payment')} icon={<DollarOutlined />} onClick={() => markPaid(viewItem._id)}>Đã TT</Button>
              </Tooltip>
              <Tooltip title="Xác nhận hoàn tất">
                <Button disabled={viewItem.status !== 'paid'} type="dashed" icon={<CheckCircleOutlined />} onClick={() => confirm(viewItem._id)}>Xác nhận</Button>
              </Tooltip>
              <Tooltip title="Hoàn tiền cho khách">
                <Button danger disabled={viewItem.status !== 'refund_requested'} onClick={() => markRefunded(viewItem._id)}>
                  Hoàn tiền
                </Button>
              </Tooltip>
            </Space>
          </>
        )}
      </Modal>

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
              <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                {autoBreakdown.map((b, idx) => (
                  <li key={idx}>
                    Phòng {b.roomNumber} ({b.typeName || ''}): {b.pricePerNight.toLocaleString()} × {b.nights} đêm = <b>{b.subtotal.toLocaleString()} VND</b>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default GroupBookingsPage;


