"use client";

import { useEffect, useMemo, useState } from 'react';
import { DatePicker, Input, InputNumber, Button, message, Card, Space, Upload, Tabs, Tag, Steps, Divider, Alert, Empty, Descriptions, Form, Row, Col, Table, Modal } from 'antd';
import dayjs from 'dayjs';
import type { UploadProps } from 'antd';
import { DownloadOutlined, UploadOutlined, CopyOutlined, ClockCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { groupBookingService, type GroupBooking } from '@/services/groupBookingService';
import { useAuth } from '@/contexts/AuthContext';

const GROUP_DEPOSIT_RATE = Number(process.env.NEXT_PUBLIC_GROUP_DEPOSIT_RATE ?? 0.5);
const GROUP_DEPOSIT_PERCENT_LABEL = `${Math.round(GROUP_DEPOSIT_RATE * 100)}%`;

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

export default function GroupBookingPage() {
  const { user } = useAuth();
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [requestId, setRequestId] = useState<string>("");
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [createdId, setCreatedId] = useState<string>("");
  const [currentStatus, setCurrentStatus] = useState<GroupBookingStatus | ''>('');
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [quoteAmount, setQuoteAmount] = useState<number | null>(null);
  const [paymentLink, setPaymentLink] = useState<string | "">("");
  const [statusNote, setStatusNote] = useState<string>("");
  const [statusRejectedAt, setStatusRejectedAt] = useState<string | null>(null);
  const [groupDetail, setGroupDetail] = useState<GroupBooking | null>(null);

  // Form state
  const [requesterName, setRequesterName] = useState("");
  const [requesterPhone, setRequesterPhone] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [checkIn, setCheckIn] = useState<dayjs.Dayjs | null>(null);
  const [checkOut, setCheckOut] = useState<dayjs.Dayjs | null>(null);
  const [peopleCount, setPeopleCount] = useState<number | undefined>(undefined);
  const [roomCount, setRoomCount] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");

  const handleCreate = async () => {
    // Ngăn chặn click nhiều lần
    if (loadingCreate) {
      return;
    }
    
    // Ngăn chặn gửi lại nếu đã có yêu cầu
    if (createdId) {
      message.warning('Bạn đã gửi yêu cầu rồi. Vui lòng kiểm tra trạng thái ở phía trên.');
      return;
    }

    // Validate form
    if (!requesterName || !requesterPhone || !checkIn || !checkOut || !peopleCount || !roomCount) {
      message.warning('Vui lòng nhập đủ tên, điện thoại, ngày vào/ra, số khách và số phòng.');
      return;
    }

    // Set loading state ngay lập tức để disable nút
    setLoadingCreate(true);
    
    try {
      // Normalize check-in và check-out với giờ cụ thể
      // Check-in: 14:00, Check-out: 12:00 (giống booking thường)
      const normalizeCheckIn = (date: dayjs.Dayjs): string => {
        const d = date.clone();
        d.hour(14).minute(0).second(0).millisecond(0);
        return d.toISOString();
      };

      const normalizeCheckOut = (date: dayjs.Dayjs): string => {
        const d = date.clone();
        d.hour(12).minute(0).second(0).millisecond(0);
        return d.toISOString();
      };

      const payload = {
        requesterId: user?._id || undefined,
        requesterName,
        requesterPhone,
        requesterEmail: requesterEmail || undefined,
        checkIn: normalizeCheckIn(checkIn),
        checkOut: normalizeCheckOut(checkOut),
        peopleCount: Number(peopleCount),
        roomCount: Number(roomCount),
        notes: notes || undefined,
      };
      const data = await groupBookingService.createRequest(payload);
      const id = data?._id || "";
      setCreatedId(id);
      setRequestId(id);
      setGroupDetail(data || null);
      // persist to localStorage to restore after reload (with userId to prevent cross-user access)
      if (id && user?._id) {
        localStorage.setItem('group_booking_request_id', id);
        localStorage.setItem('group_booking_user_id', user._id);
      }
      message.success('Gửi yêu cầu thành công! Chờ admin duyệt.');
      // fetch initial status
      await fetchStatus(id);
    } catch (e: any) {
      message.error(e?.message || 'Không thể gửi yêu cầu.');
    } finally {
      // Reset loading state sau khi hoàn tất
      // Nút sẽ tự động bị disable khi có createdId (đã gửi thành công)
      setLoadingCreate(false);
    }
  };

  const fetchStatus = async (id: string) => {
    if (!id) return;
    try {
      setIsPolling(true);
      const data = await groupBookingService.getById(id);
      const status = (data?.status as GroupBookingStatus) || '';
      setCurrentStatus(status);
      setQuoteAmount(typeof data?.quoteAmount === 'number' ? data.quoteAmount : null);
      setPaymentLink(data?.paymentLink || "");
      setStatusNote(String(data?.notes || ''));
      setStatusRejectedAt(data?.rejectedAt ? new Date(data.rejectedAt).toLocaleString('vi-VN') : null);
      setGroupDetail(data || null);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      // ignore errors in background polling but show a small hint
      console.debug('Poll error', e);
    } finally {
      setIsPolling(false);
    }
  };

  // Restore existing request from localStorage on mount (only if belongs to current user)
  useEffect(() => {
    if (!user?._id) return;
    const savedId = typeof window !== 'undefined' ? localStorage.getItem('group_booking_request_id') : null;
    const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('group_booking_user_id') : null;
    
    // Clear if saved request doesn't belong to current user
    if (savedUserId && savedUserId !== user._id) {
      localStorage.removeItem('group_booking_request_id');
      localStorage.removeItem('group_booking_user_id');
      return;
    }
    
    // Restore if belongs to current user
    if (savedId && savedUserId === user._id) {
      setRequestId(savedId);
      setCreatedId(savedId);
      fetchStatus(savedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // Auto poll status every 15s when we have a requestId
  useEffect(() => {
    if (!requestId) return;
    const interval = setInterval(() => fetchStatus(requestId), 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const statusColor: Record<GroupBookingStatus | '', string> = {
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
    '': 'default',
  };

  const statusLabel: Record<GroupBookingStatus | '', string> = {
    pending_approval: 'Chờ duyệt',
    approved: 'Đã duyệt',
    info_uploaded: 'Đã upload danh sách',
    quoted: 'Đã báo giá',
    awaiting_payment: 'Chờ thanh toán',
    deposit_paid: `Đã nhận đặt cọc ${GROUP_DEPOSIT_PERCENT_LABEL}`,
    paid: 'Đã thanh toán',
    confirmed: 'Đã xác nhận',
    refund_requested: 'Đang xử lý hoàn tiền',
    refunded: 'Đã hoàn tiền',
    cancelled: 'Đã hủy',
  rejected: 'Đã từ chối',
    '': '',
  };

  const formatCurrency = (amount?: number | null) =>
    typeof amount === 'number'
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
      : 'Đang cập nhật';

  const formatDateTime = (value?: string | Date | null) =>
    value ? new Date(value).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

  // Đã upload danh sách chưa (kiểm tra qua status hoặc có members)
  const hasUploadedMembers = currentStatus === 'info_uploaded' || 
                             (groupDetail?.members && 
                              Array.isArray(groupDetail.members) && 
                              groupDetail.members.length > 0);
  
  // Có thể tải mẫu và upload khi đã có báo giá nhưng chưa upload danh sách
  const canDownloadAndUpload = (currentStatus === 'quoted' || currentStatus === 'awaiting_payment') &&
                                !hasUploadedMembers;
  
  // Có thể thanh toán khi đã upload danh sách (status phải là info_uploaded và có members)
  const canProceedPayment = currentStatus === 'info_uploaded' && hasUploadedMembers;
  const stayNights =
    groupDetail?.checkIn && groupDetail?.checkOut
      ? Math.max(
          1,
          Math.ceil(
            (new Date(groupDetail.checkOut).getTime() - new Date(groupDetail.checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null;
  const stayRangeLabel =
    groupDetail?.checkIn && groupDetail?.checkOut
      ? `${formatDateTime(groupDetail.checkIn)} → ${formatDateTime(groupDetail.checkOut)}`
      : '-';
  const effectiveQuote =
    typeof groupDetail?.quoteAmount === 'number'
      ? groupDetail.quoteAmount
      : typeof quoteAmount === 'number'
        ? quoteAmount
        : null;
  const computedDeposit =
    typeof effectiveQuote === 'number'
      ? Math.max(1, Math.round(effectiveQuote * GROUP_DEPOSIT_RATE))
      : null;
  const paidAmount =
    typeof groupDetail?.paidAmount === 'number'
      ? groupDetail.paidAmount
      : currentStatus === 'deposit_paid'
        ? computedDeposit ?? 0
        : currentStatus === 'paid' || currentStatus === 'confirmed'
          ? effectiveQuote ?? 0
          : 0;
  let outstandingAmount: number | null;
  if (currentStatus === 'quoted' || currentStatus === 'awaiting_payment') {
    outstandingAmount = computedDeposit ?? effectiveQuote ?? null;
  } else if (typeof groupDetail?.remainingAmount === 'number') {
    outstandingAmount = groupDetail.remainingAmount;
  } else if (typeof effectiveQuote === 'number') {
    outstandingAmount = Math.max(0, effectiveQuote - paidAmount);
  } else {
    outstandingAmount = null;
  }

  const currentStep = useMemo(() => {
    switch (currentStatus) {
      case 'pending_approval':
        return 0;
      case 'approved':
        return 1;
      case 'info_uploaded':
        return 2;
      case 'quoted':
      case 'awaiting_payment':
        return 3;
      case 'deposit_paid':
      case 'paid':
        return 4;
      case 'confirmed':
        return 5;
      case 'refund_requested':
      case 'refunded':
        return 4;
      case 'cancelled':
      case 'rejected':
        return 0;
      default:
        return 0;
    }
  }, [currentStatus]);

  const handleDownloadTemplate = async () => {
    if (!requestId) {
      message.warning('Nhập mã yêu cầu (ID) để tải mẫu.');
      return;
    }
    try {
      const blob = await groupBookingService.downloadTemplate(requestId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'group_members_template.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      message.error(e?.message || 'Không thể tải file mẫu.');
    }
  };

  const uploadProps: UploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
  };

  const handleUpload = async (file?: File) => {
    if (!requestId) {
      message.warning('Nhập mã yêu cầu (ID) trước khi upload.');
      return;
    }
    if (!file) return;

    // Kiểm tra file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      message.error('File phải có định dạng Excel (.xlsx hoặc .xls)');
      return;
    }

    // Kiểm tra nếu đã upload rồi
    if (currentStatus === 'info_uploaded' && groupDetail?.members && groupDetail.members.length > 0) {
      message.warning('Bạn đã upload danh sách rồi. Nếu muốn upload lại, vui lòng liên hệ admin.');
      return;
    }

    // Kiểm tra status có cho phép upload không
    if (!canDownloadAndUpload) {
      message.warning('Chỉ có thể upload danh sách sau khi admin đã báo giá.');
      return;
    }

    try {
      message.loading({ content: 'Đang kiểm tra và upload danh sách...', key: 'upload' });
      await groupBookingService.uploadMembers(requestId, file);
      message.success({ content: 'Tải danh sách đoàn thành công! Vui lòng kiểm tra thông tin và tiến hành thanh toán.', key: 'upload', duration: 5 });
      // Refresh status sau khi upload
      await fetchStatus(requestId);
    } catch (e: any) {
      message.error({ content: e?.message || 'Không thể tải danh sách đoàn. Vui lòng kiểm tra lại file Excel.', key: 'upload', duration: 5 });
    }
  };

  const handlePayNow = async () => {
    if (!requestId) {
      message.warning('Thiếu mã yêu cầu');
      return;
    }
    try {
      const res = await fetch('/api/group-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupBookingId: requestId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Không thể tạo phiên thanh toán');
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể thanh toán');
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '16px' }}>
      <Card title={<span>Đặt phòng theo tour <Tag color="geekblue">Group Booking</Tag></span>}>
        <div style={{ marginBottom: 16 }}>
          <Steps
            size="small"
            current={currentStep}
            items={[
              { title: 'Gửi yêu cầu' },
              { title: 'Admin duyệt' },
              { title: 'Upload danh sách' },
              { title: 'Báo giá & Thanh toán' },
              { title: 'Đã thanh toán' },
              { title: 'Xác nhận' },
            ]}
          />
        </div>
        {createdId || requestId ? (
          <Alert
            type={
              currentStatus === 'cancelled' || currentStatus === 'rejected'
                ? 'error'
                : currentStatus === 'refund_requested'
                  ? 'warning'
                  : currentStatus === 'paid' || currentStatus === 'confirmed'
                    ? 'success'
                    : 'info'
            }
            showIcon
            style={{ marginBottom: 16 }}
            message={
              <span>
                Mã yêu cầu: <b>{requestId || createdId}</b>{' '}
                {currentStatus && (
                  <Tag color={statusColor[currentStatus]} style={{ marginLeft: 8 }}>{statusLabel[currentStatus]}</Tag>
                )}
              </span>
            }
            description={
              (lastUpdated || (currentStatus === 'rejected' && statusNote)) ? (
                <div>
                  {lastUpdated && (
                    <div>
                      Cập nhật: {lastUpdated}
                      {isPolling ? ' (đang kiểm tra...)' : ''}
                    </div>
                  )}
                  {currentStatus === 'rejected' && statusNote && (
                    <div style={{ marginTop: 8, color: '#b91c1c' }}>
                      Lý do từ chối: {statusNote}
                      {statusRejectedAt ? ` (lúc ${statusRejectedAt})` : ''}
                    </div>
                  )}
                </div>
              ) : undefined
            }
          />
        ) : null}
        <Divider style={{ margin: '16px 0' }} />
        <Tabs
          items={[
            {
              key: 'request',
              label: '1) Gửi yêu cầu',
              children: (
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                  <Alert
                    type="info"
                    showIcon
                    message="Điền thông tin liên hệ và thời gian lưu trú"
                    description="Chúng tôi sẽ kiểm tra phòng trống và liên hệ khi được duyệt."
                    style={{ marginBottom: 24 }}
                  />
                  
                  <Card 
                    title={<span style={{ fontSize: 16, fontWeight: 600 }}>Thông tin liên hệ</span>}
                    style={{ marginBottom: 24 }}
                    bodyStyle={{ padding: '20px' }}
                  >
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                      <div>
                        <div style={{ marginBottom: 8, fontWeight: 500, color: '#262626' }}>
                          Tên người liên hệ <span style={{ color: '#ff4d4f' }}>*</span>
                        </div>
                        <Input 
                          size="large" 
                          placeholder="Nhập tên người liên hệ" 
                          value={requesterName} 
                          onChange={(e) => setRequesterName(e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                      
                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <div>
                            <div style={{ marginBottom: 8, fontWeight: 500, color: '#262626' }}>
                              Số điện thoại <span style={{ color: '#ff4d4f' }}>*</span>
                            </div>
                            <Input 
                              size="large" 
                              placeholder="Nhập số điện thoại" 
                              value={requesterPhone} 
                              onChange={(e) => setRequesterPhone(e.target.value)}
                              style={{ width: '100%' }}
                            />
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <div>
                            <div style={{ marginBottom: 8, fontWeight: 500, color: '#262626' }}>
                              Email
                            </div>
                            <Input 
                              size="large" 
                              placeholder="Email (không bắt buộc)" 
                              value={requesterEmail} 
                              onChange={(e) => setRequesterEmail(e.target.value)}
                              style={{ width: '100%' }}
                            />
                          </div>
                        </Col>
                      </Row>
                    </Space>
                  </Card>

                  <Card 
                    title={<span style={{ fontSize: 16, fontWeight: 600 }}>Thông tin đặt phòng</span>}
                    style={{ marginBottom: 24 }}
                    bodyStyle={{ padding: '20px' }}
                  >
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                      <div>
                        <div style={{ marginBottom: 8, fontWeight: 500, color: '#262626' }}>
                          Thời gian lưu trú <span style={{ color: '#ff4d4f' }}>*</span>
                        </div>
                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <DatePicker 
                              size="large" 
                              placeholder="Ngày nhận phòng" 
                              value={checkIn} 
                              onChange={setCheckIn}
                              style={{ width: '100%' }}
                              format="DD/MM/YYYY"
                            />
                          </Col>
                          <Col xs={24} sm={12}>
                            <DatePicker 
                              size="large" 
                              placeholder="Ngày trả phòng" 
                              value={checkOut} 
                              onChange={setCheckOut}
                              style={{ width: '100%' }}
                              format="DD/MM/YYYY"
                            />
                          </Col>
                        </Row>
                      </div>
                      
                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <div>
                            <div style={{ marginBottom: 8, fontWeight: 500, color: '#262626' }}>
                              Số lượng khách <span style={{ color: '#ff4d4f' }}>*</span>
                            </div>
                            <InputNumber 
                              size="large" 
                              min={1} 
                              placeholder="Nhập số khách" 
                              value={peopleCount} 
                              onChange={(v) => setPeopleCount(typeof v === 'number' ? v : undefined)}
                              style={{ width: '100%' }}
                            />
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <div>
                            <div style={{ marginBottom: 8, fontWeight: 500, color: '#262626' }}>
                              Số phòng yêu cầu <span style={{ color: '#ff4d4f' }}>*</span>
                            </div>
                            <InputNumber 
                              size="large" 
                              min={1} 
                              placeholder="Nhập số phòng" 
                              value={roomCount} 
                              onChange={(v) => setRoomCount(typeof v === 'number' ? v : undefined)}
                              style={{ width: '100%' }}
                            />
                          </div>
                        </Col>
                      </Row>
                      
                      <div>
                        <div style={{ marginBottom: 8, fontWeight: 500, color: '#262626' }}>
                          Ghi chú / Yêu cầu đặc biệt
                        </div>
                        <Input.TextArea 
                          rows={4} 
                          placeholder="Nhập ghi chú, yêu cầu đặc biệt, giờ đến dự kiến, v.v. (không bắt buộc)" 
                          value={notes} 
                          onChange={(e) => setNotes(e.target.value)}
                          style={{ width: '100%' }}
                          showCount
                          maxLength={500}
                        />
                      </div>
                    </Space>
                  </Card>

                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Button 
                      type="primary" 
                      size="large" 
                      loading={loadingCreate} 
                      onClick={handleCreate}
                      disabled={loadingCreate || !!createdId}
                      style={{ 
                        minWidth: 200,
                        height: 48,
                        fontSize: 16,
                        fontWeight: 600
                      }}
                    >
                      {loadingCreate 
                        ? 'Đang gửi...' 
                        : createdId 
                          ? 'Đã gửi yêu cầu' 
                          : 'Gửi yêu cầu đặt phòng'
                      }
                    </Button>
                    {createdId && (
                      <div style={{ marginTop: 12, color: '#8c8c8c', fontSize: 14 }}>
                        Bạn đã gửi yêu cầu thành công. Vui lòng kiểm tra thông tin ở phía trên.
                      </div>
                    )}
                  </div>

                  {createdId ? (
                    <Card 
                      style={{ 
                        marginTop: 24,
                        background: 'linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)',
                        border: '1px solid #52c41a',
                        boxShadow: '0 2px 8px rgba(82, 196, 26, 0.15)'
                      }}
                    >
                      <div style={{ padding: '8px 0' }}>
                        <Alert
                          type="success"
                          showIcon
                          message={<span style={{ fontSize: 16, fontWeight: 600 }}>Yêu cầu đã được gửi thành công!</span>}
                          description={
                            <div style={{ marginTop: 16 }}>
                              <Descriptions 
                                bordered 
                                column={1} 
                                size="middle"
                                labelStyle={{ 
                                  fontWeight: 600, 
                                  background: '#fafafa',
                                  width: '180px'
                                }}
                                contentStyle={{ background: '#fff' }}
                              >
                                <Descriptions.Item label="Mã yêu cầu">
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Tag 
                                      color="success" 
                                      style={{ 
                                        fontSize: 15, 
                                        padding: '6px 16px',
                                        fontWeight: 600,
                                        letterSpacing: '0.5px',
                                        fontFamily: 'monospace'
                                      }}
                                    >
                                      {createdId}
                                    </Tag>
                                    <Button
                                      size="small"
                                      icon={<CopyOutlined />}
                                      onClick={async () => {
                                        try {
                                          await navigator.clipboard.writeText(createdId);
                                          message.success('Đã sao chép mã yêu cầu!');
                                        } catch (e) {
                                          message.error('Không thể sao chép mã');
                                        }
                                      }}
                                    >
                                      Sao chép
                                    </Button>
                                  </div>
                                </Descriptions.Item>
                                {currentStatus && (
                                  <Descriptions.Item label="Trạng thái">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                      <Tag 
                                        color={statusColor[currentStatus]} 
                                        style={{ 
                                          fontSize: 14, 
                                          padding: '4px 12px',
                                          fontWeight: 500
                                        }}
                                      >
                                        {statusLabel[currentStatus]}
                                      </Tag>
                                      {lastUpdated && (
                                        <span style={{ color: '#8c8c8c', fontSize: 13 }}>
                                          <ClockCircleOutlined style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                          Cập nhật: {lastUpdated}
                                          {isPolling && (
                                            <span style={{ marginLeft: 8, color: '#1890ff' }}>
                                              (đang kiểm tra...)
                                            </span>
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </Descriptions.Item>
                                )}
                              </Descriptions>
                              
                              <div 
                                style={{ 
                                  marginTop: 16, 
                                  padding: 16, 
                                  background: 'rgba(255, 255, 255, 0.8)', 
                                  borderRadius: 8,
                                  border: '1px solid #d9f7be',
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: 12
                                }}
                              >
                                <div style={{ 
                                  fontSize: 20, 
                                  lineHeight: 1,
                                  marginTop: 2
                                }}>
                                  💡
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ 
                                    fontSize: 14, 
                                    fontWeight: 600, 
                                    color: '#262626',
                                    marginBottom: 4
                                  }}>
                                    Lưu ý quan trọng
                                  </div>
                                  <div style={{ 
                                    fontSize: 13, 
                                    color: '#595959',
                                    lineHeight: 1.6
                                  }}>
                                    Mã yêu cầu đã được lưu tự động trên trình duyệt của bạn. Bạn có thể tải lại trang hoặc đóng trình duyệt và quay lại sau, hệ thống vẫn sẽ theo dõi trạng thái đặt phòng của bạn.
                                  </div>
                                </div>
                              </div>
                            </div>
                          }
                        />
                      </div>
                    </Card>
                  ) : null}
                </div>
              ),
            },
            {
              key: 'upload',
              label: '2) Tải mẫu & upload danh sách',
              children: (
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                  <Alert
                    type="info"
                    showIcon
                    message="Sau khi admin báo giá, vui lòng tải mẫu Excel, điền thông tin và số phòng cho từng người, sau đó upload lên"
                    description={
                      groupDetail ? (
                        <>Bạn chỉ có thể tải mẫu và upload sau khi admin đã báo giá. <strong>Lưu ý: File Excel phải có đúng {groupDetail.peopleCount} người.</strong></>
                      ) : (
                        "Bạn chỉ có thể tải mẫu và upload sau khi admin đã báo giá cho đặt đoàn của bạn."
                      )
                    }
                    style={{ marginBottom: 24 }}
                  />

                  <Card 
                    title={<span style={{ fontSize: 16, fontWeight: 600 }}>Nhập mã yêu cầu</span>}
                    style={{ marginBottom: 24 }}
                    bodyStyle={{ padding: '20px' }}
                  >
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                      <div>
                        <div style={{ marginBottom: 8, fontWeight: 500, color: '#262626' }}>
                          Mã yêu cầu (ID) <span style={{ color: '#ff4d4f' }}>*</span>
                        </div>
                        <Input 
                          size="large" 
                          placeholder="Nhập mã yêu cầu đã được tạo ở phần 1" 
                          value={requestId} 
                          onChange={(e) => setRequestId(e.target.value)}
                          style={{ width: '100%' }}
                          allowClear
                        />
                        <div style={{ marginTop: 8, fontSize: 13, color: '#8c8c8c' }}>
                          💡 Nếu bạn đã gửi yêu cầu ở phần 1, mã sẽ tự động điền. Bạn có thể nhập mã khác hoặc để trống nếu đã có mã được lưu.
                        </div>
                      </div>

                      {requestId ? (
                        <div style={{ 
                          marginTop: 16, 
                          padding: 16, 
                          background: '#f0f9ff', 
                          borderRadius: 8,
                          border: '1px solid #bae6fd'
                        }}>
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ marginBottom: 8, fontWeight: 500, color: '#262626' }}>
                              Trạng thái yêu cầu
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                              {currentStatus ? (
                                <Tag color={statusColor[currentStatus]} style={{ fontSize: 14, padding: '4px 12px' }}>
                                  {statusLabel[currentStatus]}
                                </Tag>
                              ) : (
                                <span style={{ color: '#8c8c8c', fontStyle: 'italic' }}>Đang kiểm tra...</span>
                              )}
                              {lastUpdated && (
                                <span style={{ color: '#8c8c8c', fontSize: 13 }}>
                                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                                  Cập nhật: {lastUpdated}
                                  {isPolling && (
                                    <span style={{ marginLeft: 8, color: '#1890ff' }}>
                                      (đang kiểm tra...)
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                          <Space>
                            <Button 
                              type="default"
                              icon={<ClockCircleOutlined />}
                              onClick={() => fetchStatus(requestId)} 
                              loading={isPolling}
                            >
                              Kiểm tra ngay
                            </Button>
                            <Button 
                              type="default"
                              danger
                              onClick={() => { 
                                localStorage.removeItem('group_booking_request_id'); 
                                localStorage.removeItem('group_booking_user_id'); 
                                setCreatedId(''); 
                                setCurrentStatus(''); 
                                setRequestId('');
                                setGroupDetail(null);
                                setQuoteAmount(null);
                                setPaymentLink('');
                                setStatusNote('');
                                setLastUpdated('');
                                message.success('Đã xóa mã yêu cầu đã lưu. Trang sẽ được tải lại...', 1);
                                // Tự động reload trang sau 1 giây
                                setTimeout(() => {
                                  window.location.reload();
                                }, 1000);
                              }}
                            >
                              Xóa mã lưu
                            </Button>
                          </Space>
                        </div>
                      ) : null}
                    </Space>
                  </Card>
                  {(canDownloadAndUpload || canProceedPayment || hasUploadedMembers || currentStatus === 'quoted' || currentStatus === 'awaiting_payment') && groupDetail && (
                    <Card 
                      title={<span style={{ fontSize: 16, fontWeight: 600 }}>Thông tin đặt đoàn</span>}
                      style={{ marginBottom: 24 }}
                      bodyStyle={{ padding: '20px' }}
                    >
                      <Descriptions 
                        bordered 
                        column={1} 
                        size="middle"
                        labelStyle={{ 
                          fontWeight: 600, 
                          background: '#fafafa',
                          width: '200px'
                        }}
                        contentStyle={{ background: '#fff' }}
                      >
                        <Descriptions.Item label="Thời gian lưu trú">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span>{stayRangeLabel}</span>
                            {typeof stayNights === 'number' && (
                              <Tag color="blue">{stayNights} đêm</Tag>
                            )}
                          </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Quy mô đoàn">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Tag color="cyan">{groupDetail.peopleCount} khách</Tag>
                            <Tag color="purple">{groupDetail.roomCount} phòng</Tag>
                          </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng báo giá">
                          <span style={{ fontSize: 16, fontWeight: 600, color: '#1890ff' }}>
                            {formatCurrency(effectiveQuote)}
                          </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Đã thanh toán">
                          <span style={{ fontSize: 15, fontWeight: 500, color: '#52c41a' }}>
                            {formatCurrency(paidAmount)}
                          </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Còn lại">
                          <span style={{ fontSize: 15, fontWeight: 500, color: '#fa8c16' }}>
                            {formatCurrency(outstandingAmount)}
                          </span>
                        </Descriptions.Item>
                        {hasUploadedMembers && (
                          <Descriptions.Item label="Đã upload danh sách">
                            <Tag color="success" style={{ fontSize: 13, padding: '4px 12px' }}>
                              ✅ {groupDetail.members?.length || 0} người
                            </Tag>
                          </Descriptions.Item>
                        )}
                        {groupDetail.members && groupDetail.members.length > 0 && (
                          <Descriptions.Item label="Trưởng đoàn">
                            <span style={{ fontWeight: 500 }}>
                              {groupDetail.members.find((m: any) => m.isLeader)?.fullName ||
                                groupDetail.members[0]?.fullName ||
                                '—'}
                            </span>
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                      {hasUploadedMembers && groupDetail.members && groupDetail.members.length > 0 && (
                        <div style={{ marginTop: 20 }}>
                          <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 15, color: '#262626', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Danh sách thành viên đã upload ({groupDetail.members.length} người)</span>
                            <Button 
                              type="link" 
                              icon={<EyeOutlined />}
                              onClick={() => setShowMembersModal(true)}
                              style={{ padding: 0 }}
                            >
                              Xem chi tiết
                            </Button>
                          </div>
                        </div>
                      )}
                      {Array.isArray(groupDetail.allocatedRoomIds) && groupDetail.allocatedRoomIds.length > 0 && (
                        <div style={{ marginTop: 20 }}>
                          <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 15, color: '#262626' }}>
                            Phòng được phân bổ
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                            {groupDetail.allocatedRoomIds.map((room) => (
                              <Card 
                                key={room._id} 
                                size="small" 
                                style={{ 
                                  border: '1px solid #e6f7ff',
                                  background: '#f0f9ff',
                                  borderRadius: 8
                                }}
                              >
                                <div style={{ marginBottom: 12 }}>
                                  <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px', fontWeight: 600 }}>
                                    Phòng {room.roomNumber}
                                  </Tag>
                                  {room.typeId?.name && (
                                    <span style={{ marginLeft: 8, fontWeight: 500, color: '#595959' }}>
                                      {room.typeId.name}
                                    </span>
                                  )}
                                </div>
                                <Descriptions size="small" column={1} bordered>
                                  {room.typeId?.capacity && (
                                    <Descriptions.Item label="Số người tối đa">
                                      <Tag color="cyan">{room.typeId.capacity} người</Tag>
                                    </Descriptions.Item>
                                  )}
                                  {room.typeId?.pricePerNight && (
                                    <Descriptions.Item label="Giá/đêm">
                                      <span style={{ fontWeight: 500, color: '#1890ff' }}>
                                        {formatCurrency(room.typeId.pricePerNight)}
                                      </span>
                                    </Descriptions.Item>
                                  )}
                                  {room.typeId?.extraHourPrice && room.typeId.extraHourPrice > 0 && (
                                    <>
                                      <Descriptions.Item label="Giá giờ thêm">
                                        <span style={{ fontWeight: 500 }}>
                                          {formatCurrency(room.typeId.extraHourPrice)}/giờ
                                        </span>
                                      </Descriptions.Item>
                                      {room.typeId?.maxExtendHours && (
                                        <Descriptions.Item label="Số giờ tối đa">
                                          {room.typeId.maxExtendHours} giờ
                                        </Descriptions.Item>
                                      )}
                                    </>
                                  )}
                                </Descriptions>
                                {Array.isArray(room.typeId?.amenities) && room.typeId.amenities.length > 0 && (
                                  <div style={{ marginTop: 12 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#595959' }}>
                                      Tiện ích:
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                      {room.typeId.amenities.map((a, aidx) => (
                                        <Tag key={aidx} color="default">{a}</Tag>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                      <Alert
                        type="info"
                        showIcon
                        message="Lưu ý quan trọng"
                        description="Hãy kiểm tra kỹ thông tin trên. Việc thanh toán đồng nghĩa bạn xác nhận giữ phòng và tuân thủ chính sách hoàn tiền trong vòng 24 giờ kể từ khi tạo yêu cầu."
                        style={{ marginTop: 20 }}
                      />
                    </Card>
                  )}
                      {/* Hiển thị thông báo nếu đã có báo giá nhưng chưa upload danh sách */}
                      {canDownloadAndUpload && (
                        <Card 
                          style={{ 
                            marginBottom: 24,
                            background: 'linear-gradient(135deg, #fff7e6 0%, #fffbe6 100%)',
                            border: '1px solid #ffd591'
                          }}
                        >
                          <Alert
                            type="warning"
                            showIcon
                            message={<span style={{ fontSize: 16, fontWeight: 600 }}>Chưa thể thanh toán</span>}
                            description={
                              <div>
                                <div style={{ marginBottom: 8, fontSize: 14, color: '#595959' }}>
                                  Bạn cần tải mẫu Excel, điền thông tin danh sách đoàn và upload lên hệ thống trước khi có thể thanh toán.
                                </div>
                                <div style={{ fontSize: 13, color: '#8c8c8c' }}>
                                  Vui lòng hoàn thành các bước: <strong>1) Tải file Excel mẫu</strong> → <strong>2) Điền thông tin đúng {groupDetail?.peopleCount || 0} người</strong> → <strong>3) Upload danh sách</strong> → <strong>4) Thanh toán</strong>
                                </div>
                                <div style={{ marginTop: 12, padding: 12, background: '#fff7e6', borderRadius: 4, fontSize: 13, color: '#d46b08' }}>
                                  ⚠️ <strong>Lưu ý:</strong> File Excel phải có đúng <strong>{groupDetail?.peopleCount || 0} người</strong>. Hệ thống sẽ kiểm tra và từ chối nếu số lượng không khớp.
                                </div>
                              </div>
                            }
                          />
                        </Card>
                      )}

                      {/* Hiển thị phần thanh toán khi đã upload danh sách */}
                      {canProceedPayment && (
                        <Card 
                          title={<span style={{ fontSize: 16, fontWeight: 600 }}>Thanh toán</span>}
                          style={{ marginBottom: 24 }}
                          bodyStyle={{ padding: '20px' }}
                        >
                          <div style={{ 
                            padding: 20, 
                            background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)',
                            borderRadius: 8,
                            border: '2px dashed #1890ff'
                          }}>
                            <div style={{ marginBottom: 16, textAlign: 'center' }}>
                              <div style={{ fontSize: 14, color: '#595959', marginBottom: 8 }}>
                                Số tiền cần thanh toán lần này
                              </div>
                              <div style={{ fontSize: 28, fontWeight: 700, color: '#1890ff' }}>
                                {formatCurrency(outstandingAmount)}
                              </div>
                              <div style={{ marginTop: 8, fontSize: 13, color: '#8c8c8c' }}>
                                Khoản cọc = {GROUP_DEPOSIT_PERCENT_LABEL} tổng báo giá
                              </div>
                              {hasUploadedMembers && (
                                <div style={{ marginTop: 12, padding: 8, background: '#f6ffed', borderRadius: 4, fontSize: 13, color: '#52c41a' }}>
                                  ✅ Đã upload danh sách ({groupDetail?.members?.length || 0} người)
                                </div>
                              )}
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <Button 
                                type="primary" 
                                size="large"
                                onClick={handlePayNow}
                                style={{
                                  minWidth: 200,
                                  height: 48,
                                  fontSize: 16,
                                  fontWeight: 600
                                }}
                              >
                                💳 Thanh toán ngay
                              </Button>
                            </div>
                            <div style={{ marginTop: 16, fontSize: 13, color: '#595959', textAlign: 'center' }}>
                              Nhấn "Thanh toán ngay" để chuyển tới cổng Stripe và thanh toán khoản đặt cọc
                            </div>
                          </div>
                        </Card>
                      )}

                  {currentStatus === 'paid' && (
                    <Card 
                      style={{ 
                        marginBottom: 24,
                        background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
                        border: '1px solid #52c41a'
                      }}
                    >
                      <Alert
                        type="success"
                        showIcon
                        message={<span style={{ fontSize: 16, fontWeight: 600 }}>Đã thanh toán thành công</span>}
                        description="Vui lòng chờ admin xác nhận hoàn tất đặt đoàn. Chúng tôi sẽ thông báo cho bạn khi có kết quả."
                      />
                    </Card>
                  )}

                  {currentStatus === 'confirmed' && (
                    <Card 
                      style={{ 
                        marginBottom: 24,
                        background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)',
                        border: '1px solid #1890ff'
                      }}
                    >
                      <Alert
                        type="info"
                        showIcon
                        message={<span style={{ fontSize: 16, fontWeight: 600 }}>Đặt đoàn đã được xác nhận</span>}
                        description="Hẹn gặp quý khách! Chúng tôi rất mong được phục vụ quý khách."
                      />
                    </Card>
                  )}

                  {currentStatus === 'rejected' && statusNote && (
                    <Card 
                      style={{ 
                        marginBottom: 24,
                        border: '1px solid #ff4d4f'
                      }}
                    >
                      <Alert
                        type="error"
                        showIcon
                        message={<span style={{ fontSize: 16, fontWeight: 600 }}>Yêu cầu đặt đoàn đã bị từ chối</span>}
                        description={
                          <div>
                            <div style={{ marginBottom: 12, fontSize: 14, color: '#595959' }}>
                              {statusNote}
                            </div>
                            <div style={{ fontSize: 13, color: '#8c8c8c' }}>
                              Vui lòng chỉnh sửa thời gian hoặc liên hệ bộ phận đặt phòng để được hỗ trợ thêm.
                            </div>
                          </div>
                        }
                      />
                    </Card>
                  )}

                  <Card 
                    title={<span style={{ fontSize: 16, fontWeight: 600 }}>Tải mẫu & Upload danh sách</span>}
                    style={{ marginBottom: 24 }}
                    bodyStyle={{ padding: '20px' }}
                  >
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Button 
                            type="primary"
                            icon={<DownloadOutlined />} 
                            onClick={handleDownloadTemplate}
                            disabled={!canDownloadAndUpload}
                            size="large"
                            block
                            style={{ height: 48 }}
                          >
                            📥 Tải file Excel mẫu
                          </Button>
                          {!canDownloadAndUpload && (
                            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c', textAlign: 'center' }}>
                              {hasUploadedMembers 
                                ? 'Đã upload danh sách, không thể tải lại mẫu'
                                : 'Chỉ có thể tải sau khi admin báo giá'
                              }
                            </div>
                          )}
                        </Col>
                        <Col xs={24} sm={12}>
                          <Upload 
                            {...uploadProps} 
                            onChange={(info) => handleUpload(info.fileList[0]?.originFileObj)}
                            disabled={!canDownloadAndUpload}
                          >
                            <Button 
                              type="default"
                              icon={<UploadOutlined />}
                              disabled={!canDownloadAndUpload}
                              size="large"
                              block
                              style={{ height: 48 }}
                            >
                              📤 Upload danh sách đoàn
                            </Button>
                          </Upload>
                          {!canDownloadAndUpload && (
                            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c', textAlign: 'center' }}>
                              {hasUploadedMembers 
                                ? 'Đã upload danh sách rồi'
                                : 'Chỉ có thể upload sau khi admin báo giá'
                              }
                            </div>
                          )}
                        </Col>
                      </Row>

                      {!canDownloadAndUpload && !hasUploadedMembers && (
                        <Alert
                          type="warning"
                          showIcon
                          message="Chưa thể tải mẫu hoặc upload"
                          description="Vui lòng chờ admin báo giá trước khi tải mẫu và upload danh sách. Khi admin đã báo giá, các nút trên sẽ được kích hoạt."
                        />
                      )}

                      {hasUploadedMembers && (
                        <Alert
                          type="success"
                          showIcon
                          message="Đã upload danh sách thành công"
                          description={
                            <div>
                              <div style={{ marginBottom: 8 }}>
                                Đã upload danh sách với <strong>{groupDetail?.members?.length || 0} người</strong>. 
                                Bạn có thể tiến hành thanh toán ở phần trên.
                              </div>
                              {groupDetail?.members && groupDetail.members.length > 0 && (
                                <div style={{ fontSize: 13, color: '#595959' }}>
                                  Danh sách đã được kiểm tra và xác nhận đúng với yêu cầu.
                                </div>
                              )}
                            </div>
                          }
                        />
                      )}

                      {canDownloadAndUpload && groupDetail && (
                        <div style={{ 
                          marginTop: 8, 
                          padding: 20, 
                          background: '#f0f9ff', 
                          borderRadius: 8, 
                          border: '1px solid #bae6fd' 
                        }}>
                          <div style={{ 
                            fontWeight: 600, 
                            fontSize: 15,
                            marginBottom: 16,
                            color: '#262626',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                          }}>
                            📋 Hướng dẫn sử dụng
                          </div>
                          <Steps
                            direction="vertical"
                            size="small"
                            items={[
                              {
                                title: 'Tải file Excel mẫu',
                                description: 'File đã có danh sách phòng được phân bổ sẵn',
                                status: 'finish'
                              },
                              {
                                title: 'Điền thông tin vào file',
                                description: (
                                  <div>
                                    <strong style={{ color: '#dc2626' }}>
                                      Điền đầy đủ thông tin cho đúng {groupDetail.peopleCount} người
                                    </strong>
                                    <div style={{ marginTop: 4, fontSize: 13, color: '#595959' }}>
                                      - Nhập số phòng cho từng người (ví dụ: Phòng 201, Phòng 103, ...)
                                    </div>
                                  </div>
                                ),
                                status: 'process'
                              },
                              {
                                title: 'Upload file đã điền',
                                description: `File phải có đúng ${groupDetail.peopleCount} dòng dữ liệu`,
                                status: 'wait'
                              },
                              {
                                title: 'Tiến hành thanh toán',
                                description: 'Sau khi upload thành công, tiến hành thanh toán đặt cọc',
                                status: 'wait'
                              }
                            ]}
                          />
                          
                          <div style={{ 
                            marginTop: 16, 
                            padding: 16, 
                            background: '#fff7e6', 
                            borderRadius: 8, 
                            border: '1px solid #ffd591' 
                          }}>
                            <div style={{ 
                              fontSize: 14, 
                              fontWeight: 600,
                              color: '#d46b08',
                              marginBottom: 8,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8
                            }}>
                              ⚠️ Lưu ý quan trọng
                            </div>
                            <div style={{ fontSize: 13, color: '#d46b08', lineHeight: 1.6 }}>
                              File Excel phải có đúng <strong>{groupDetail.peopleCount} người</strong>. 
                              Nếu file có nhiều hơn hoặc ít hơn {groupDetail.peopleCount} người, hệ thống sẽ từ chối upload.
                            </div>
                          </div>
                        </div>
                      )}
                    </Space>
                  </Card>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Modal hiển thị danh sách thành viên */}
      <Modal
        title={`Danh sách thành viên (${groupDetail?.members?.length || 0} người)`}
        open={showMembersModal}
        onCancel={() => setShowMembersModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowMembersModal(false)}>
            Đóng
          </Button>
        ]}
        width={1000}
      >
        {groupDetail?.members && groupDetail.members.length > 0 ? (
          <Table
            dataSource={groupDetail.members.map((member: any, index: number) => ({
              ...member,
              key: index,
            }))}
            columns={[
              {
                title: 'STT',
                dataIndex: 'key',
                key: 'stt',
                width: 60,
                render: (_, __, index) => index + 1,
              },
              {
                title: 'Họ và tên',
                dataIndex: 'fullName',
                key: 'fullName',
                render: (text: string, record: any) => (
                  <span>
                    {record.isLeader && <Tag color="gold" style={{ marginRight: 8 }}>Trưởng đoàn</Tag>}
                    {text || '—'}
                  </span>
                ),
              },
              {
                title: 'CMND/CCCD',
                dataIndex: 'idNumber',
                key: 'idNumber',
                render: (text: string) => text || '—',
              },
              {
                title: 'Ngày sinh',
                dataIndex: 'dateOfBirth',
                key: 'dateOfBirth',
                render: (date: string | Date) => {
                  if (!date) return '—';
                  const d = new Date(date);
                  return d.toLocaleDateString('vi-VN');
                },
              },
              {
                title: 'Số điện thoại',
                dataIndex: 'phoneNumber',
                key: 'phoneNumber',
                render: (text: string) => text || '—',
              },
              {
                title: 'Email',
                dataIndex: 'email',
                key: 'email',
                render: (text: string) => text || '—',
              },
              {
                title: 'Phòng',
                dataIndex: 'roomNumber',
                key: 'roomNumber',
                render: (text: string) => text ? <Tag color="blue">Phòng {text}</Tag> : '—',
              },
            ]}
            pagination={false}
            scroll={{ y: 400 }}
            size="middle"
          />
        ) : (
          <Empty description="Chưa có danh sách thành viên" />
        )}
      </Modal>
    </div>
  );
}


