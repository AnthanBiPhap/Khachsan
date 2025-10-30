import React, { useEffect, useMemo, useState } from 'react';
import { Table, Tag, Space, Button, message, Tooltip, Modal, Descriptions, InputNumber, Input, Form } from 'antd';
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
  | 'cancelled';

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
  cancelled: 'red',
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
      render: (s: GroupBookingStatus) => <Tag color={statusColor[s]}>{s}</Tag>
    },
    {
      title: 'Thao tác',
      width: 520,
      render: (_: any, r: GroupBookingItem) => (
        <Space>
          <Button icon={<ReloadOutlined />} onClick={load}>Tải lại</Button>
          <Tooltip title="Duyệt yêu cầu">
            <Button disabled={r.status !== 'pending_approval'} type="primary" onClick={() => approve(r._id)}>
              Duyệt
            </Button>
          </Tooltip>
          <Tooltip title="Tải Excel mẫu">
            <Button icon={<FileExcelOutlined />} onClick={() => openTemplate(r._id)}>Mẫu</Button>
          </Tooltip>
          <Tooltip title="Gửi báo giá / Link thanh toán">
            <Button disabled={!(r.status === 'approved' || r.status === 'info_uploaded' || r.status === 'quoted' || r.status === 'awaiting_payment')} onClick={() => openQuote(r)}>
              Báo giá
            </Button>
          </Tooltip>
          <Tooltip title="Tải file danh sách đã upload">
            <Button disabled={!(r.status === 'info_uploaded' || r.status === 'quoted' || r.status === 'awaiting_payment' || r.status === 'paid' || r.status === 'confirmed')} icon={<DownloadOutlined />} onClick={() => window.open(`${API_URL}/group-bookings/${r._id}/members.xlsx`, '_blank')}>Danh sách</Button>
          </Tooltip>
          <Tooltip title="Đánh dấu đã thanh toán">
            <Button disabled={!(r.status === 'quoted' || r.status === 'awaiting_payment')} icon={<DollarOutlined />} onClick={() => markPaid(r._id)}>Đã TT</Button>
          </Tooltip>
          <Tooltip title="Xác nhận hoàn tất">
            <Button disabled={r.status !== 'paid'} type="dashed" icon={<CheckCircleOutlined />} onClick={() => confirm(r._id)}>Xác nhận</Button>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <>
      <Table
        rowKey="_id"
        loading={loading}
        dataSource={items}
        columns={columns as any}
        pagination={{ pageSize: 10 }}
      />

      <Modal open={!!viewItem} onCancel={() => setViewItem(null)} footer={null} title={`Chi tiết ${viewItem?._id || ''}`} width={720}>
        {viewItem && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Người liên hệ">{viewItem.requesterName} - {viewItem.requesterPhone}</Descriptions.Item>
            <Descriptions.Item label="Email">{viewItem.requesterEmail || '-'}</Descriptions.Item>
            <Descriptions.Item label="Ngày">{new Date(viewItem.checkIn).toLocaleString()} → {new Date(viewItem.checkOut).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Số khách/phòng">{viewItem.peopleCount} / {viewItem.roomCount}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái"><Tag color={statusColor[viewItem.status]}>{viewItem.status}</Tag></Descriptions.Item>
            <Descriptions.Item label="Báo giá">{viewItem.quoteAmount ? viewItem.quoteAmount.toLocaleString() : '-'}</Descriptions.Item>
            <Descriptions.Item label="Link thanh toán">{viewItem.paymentLink ? <a href={viewItem.paymentLink} target="_blank">{viewItem.paymentLink}</a> : '-'}</Descriptions.Item>
            <Descriptions.Item label="Ghi chú">{viewItem.notes || '-'}</Descriptions.Item>
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


