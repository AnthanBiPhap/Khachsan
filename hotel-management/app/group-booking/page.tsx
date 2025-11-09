"use client";

import { useEffect, useMemo, useState } from 'react';
import { DatePicker, Input, InputNumber, Button, message, Card, Space, Upload, Tabs, Tag, Steps, Divider, Alert, Empty, Descriptions } from 'antd';
import dayjs from 'dayjs';
import type { UploadProps } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
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
    if (!requesterName || !requesterPhone || !checkIn || !checkOut || !peopleCount || !roomCount) {
      message.warning('Vui lòng nhập đủ tên, điện thoại, ngày vào/ra, số khách và số phòng.');
      return;
    }
    setLoadingCreate(true);
    try {
      const payload = {
        requesterId: user?._id || undefined,
        requesterName,
        requesterPhone,
        requesterEmail: requesterEmail || undefined,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
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

  const canProceedPayment = currentStatus === 'quoted' || currentStatus === 'awaiting_payment';
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
    try {
      await groupBookingService.uploadMembers(requestId, file);
      message.success('Tải danh sách đoàn thành công!');
    } catch (e: any) {
      message.error(e?.message || 'Không thể tải danh sách đoàn.');
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
                <Space direction="vertical" size={12} style={{ width: 720, maxWidth: '100%' }}>
                  <Alert
                    type="info"
                    showIcon
                    message="Điền thông tin liên hệ và thời gian lưu trú"
                    description="Chúng tôi sẽ kiểm tra phòng trống và liên hệ khi được duyệt."
                  />
                  <Input size="large" placeholder="Tên người liên hệ" value={requesterName} onChange={(e) => setRequesterName(e.target.value)} />
                  <Input size="large" placeholder="Số điện thoại" value={requesterPhone} onChange={(e) => setRequesterPhone(e.target.value)} />
                  <Input size="large" placeholder="Email (không bắt buộc)" value={requesterEmail} onChange={(e) => setRequesterEmail(e.target.value)} />
                  <Space wrap>
                    <DatePicker size="large" placeholder="Ngày check-in" value={checkIn} onChange={setCheckIn} />
                    <DatePicker size="large" placeholder="Ngày check-out" value={checkOut} onChange={setCheckOut} />
                  </Space>
                  <Space wrap>
                    <InputNumber size="large" min={1} placeholder="Số khách" value={peopleCount} onChange={(v) => setPeopleCount(typeof v === 'number' ? v : undefined)} />
                    <InputNumber size="large" min={1} placeholder="Số phòng" value={roomCount} onChange={(v) => setRoomCount(typeof v === 'number' ? v : undefined)} />
                  </Space>
                  <Input.TextArea rows={4} placeholder="Ghi chú (yêu cầu đặc biệt, giờ đến, v.v.)" value={notes} onChange={(e) => setNotes(e.target.value)} />
                  <Button type="primary" size="large" loading={loadingCreate} onClick={handleCreate}>Gửi yêu cầu</Button>
                  {createdId ? (
                    <div>
                      Mã yêu cầu của bạn: <b>{createdId}</b>
                      {currentStatus ? (
                        <span style={{ marginLeft: 12 }}>
                          Trạng thái: <b>{statusLabel[currentStatus]}</b>
                          {lastUpdated ? <em style={{ marginLeft: 8, color: '#888' }}>(cập nhật: {lastUpdated}{isPolling ? ', đang kiểm tra...' : ''})</em> : null}
                        </span>
                      ) : null}
                      <div style={{ marginTop: 8 }}>
                        Lưu ý: Mã yêu cầu đã được lưu. Bạn có thể tải lại trang và vẫn theo dõi trạng thái.
                      </div>
                    </div>
                  ) : null}
                </Space>
              ),
            },
            {
              key: 'upload',
              label: '2) Tải mẫu & upload danh sách',
              children: (
                <Space direction="vertical" size={12} style={{ width: 720, maxWidth: '100%' }}>
                  <Alert
                    type="info"
                    showIcon
                    message="Sau khi admin báo giá, vui lòng tải mẫu Excel, điền thông tin và số phòng cho từng người, sau đó upload lên"
                    description="Bạn chỉ có thể tải mẫu và upload sau khi admin đã báo giá cho đặt đoàn của bạn."
                  />
                  <Input size="large" placeholder="Nhập mã yêu cầu (ID)" value={requestId} onChange={(e) => setRequestId(e.target.value)} />
                  {requestId ? (
                    <div>
                      Trạng thái hiện tại: {currentStatus ? <Tag color={statusColor[currentStatus]}>{statusLabel[currentStatus]}</Tag> : <i>đang kiểm tra...</i>}
                      {lastUpdated ? <em style={{ marginLeft: 8, color: '#888' }}>(cập nhật: {lastUpdated}{isPolling ? ', đang kiểm tra...' : ''})</em> : null}
                      <div style={{ marginTop: 8 }}>
                        <Space>
                          <Button onClick={() => fetchStatus(requestId)} loading={isPolling}>Kiểm tra ngay</Button>
                          <Button onClick={() => { localStorage.removeItem('group_booking_request_id'); localStorage.removeItem('group_booking_user_id'); setCreatedId(''); setCurrentStatus(''); setRequestId(''); }}>Xóa mã lưu</Button>
                        </Space>
                      </div>
                      {canProceedPayment && groupDetail && (
                        <div
                          style={{
                            marginTop: 16,
                            padding: 16,
                            borderRadius: 8,
                            border: '1px solid #bfdbfe',
                            background: '#f8fbff',
                          }}
                        >
                          <h4 style={{ margin: 0, fontWeight: 600, color: '#1d4ed8' }}>
                            Xác nhận thông tin đặt đoàn trước khi thanh toán
                          </h4>
                          <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                            <div>
                              <strong>Thời gian lưu trú:</strong> {stayRangeLabel}
                              {typeof stayNights === 'number' ? ` • ${stayNights} đêm` : ''}
                            </div>
                            <div>
                              <strong>Quy mô đoàn:</strong> {groupDetail.peopleCount} khách · {groupDetail.roomCount}{' '}
                              phòng
                            </div>
                            <div>
                              <strong>Tổng báo giá:</strong> {formatCurrency(effectiveQuote)}
                            </div>
                            <div>
                              <strong>Đã thanh toán:</strong> {formatCurrency(paidAmount)}
                            </div>
                            <div>
                              <strong>Còn lại:</strong> {formatCurrency(outstandingAmount)}
                            </div>
                            {groupDetail.members && groupDetail.members.length > 0 && (
                              <div>
                                <strong>Trưởng đoàn:</strong>{' '}
                                {groupDetail.members.find((m) => m.isLeader)?.fullName ||
                                  groupDetail.members[0]?.fullName ||
                                  '—'}
                              </div>
                            )}
                          </div>
                          {Array.isArray(groupDetail.allocatedRoomIds) && groupDetail.allocatedRoomIds.length > 0 && (
                            <div style={{ marginTop: 12 }}>
                              <strong>Phòng được giữ:</strong>
                              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {groupDetail.allocatedRoomIds.map((room) => (
                                  <Card key={room._id} size="small" style={{ border: '1px solid #d9d9d9' }}>
                                    <div style={{ marginBottom: 8 }}>
                                      <strong>Phòng {room.roomNumber}</strong>
                                      {room.typeId?.name ? ` - ${room.typeId.name}` : ''}
                                    </div>
                                    <Descriptions size="small" column={2} bordered>
                                      {room.typeId?.capacity && (
                                        <Descriptions.Item label="Số người tối đa">{room.typeId.capacity} người</Descriptions.Item>
                                      )}
                                      {room.typeId?.pricePerNight && (
                                        <Descriptions.Item label="Giá/đêm">{formatCurrency(room.typeId.pricePerNight)}</Descriptions.Item>
                                      )}
                                      {room.typeId?.extraHourPrice && room.typeId.extraHourPrice > 0 && (
                                        <>
                                          <Descriptions.Item label="Giá giờ thêm">{formatCurrency(room.typeId.extraHourPrice)}/giờ</Descriptions.Item>
                                          {room.typeId?.maxExtendHours && (
                                            <Descriptions.Item label="Số giờ tối đa">{room.typeId.maxExtendHours} giờ</Descriptions.Item>
                                          )}
                                        </>
                                      )}
                                    </Descriptions>
                                    {Array.isArray(room.typeId?.amenities) && room.typeId.amenities.length > 0 && (
                                      <div style={{ marginTop: 8 }}>
                                        <strong>Tiện ích:</strong>
                                        <div style={{ marginTop: 4 }}>
                                          {room.typeId.amenities.map((a, aidx) => (
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
                          <div style={{ marginTop: 12, fontSize: 13, color: '#1d4ed8' }}>
                            Hãy kiểm tra kỹ thông tin trên. Việc thanh toán đồng nghĩa bạn xác nhận giữ phòng và tuân thủ
                            chính sách hoàn tiền trong vòng 24 giờ kể từ khi tạo yêu cầu.
                          </div>
                        </div>
                      )}
                      {canProceedPayment && (
                        <div style={{ marginTop: 16, padding: 12, border: '1px dashed #d9d9d9', borderRadius: 6 }}>
                          <div>
                            <b>Số tiền cần thanh toán lần này:</b> {formatCurrency(outstandingAmount)}
                          </div>
                          <div style={{ marginTop: 8, fontSize: 13, color: '#2563eb' }}>
                            Nhấn “Thanh toán” để chuyển tới cổng Stripe và thanh toán khoản đặt cọc.
                          </div>
                          <div style={{ marginTop: 12 }}>
                            <Button type="primary" onClick={handlePayNow}>
                              Thanh toán
                            </Button>
                          </div>
                          {(currentStatus === 'quoted' || currentStatus === 'awaiting_payment') && (
                            <div style={{ marginTop: 8, fontSize: 12, color: '#2563eb' }}>
                              {`Khoản cọc = ${GROUP_DEPOSIT_PERCENT_LABEL} tổng báo giá`}
                            </div>
                          )}
                        </div>
                      )}
                      {currentStatus === 'paid' && (
                        <div style={{ marginTop: 16, padding: 12, border: '1px solid #52c41a', borderRadius: 6, color: '#389e0d' }}>
                          Đã thanh toán. Vui lòng chờ admin xác nhận hoàn tất đặt đoàn.
                        </div>
                      )}
                      {currentStatus === 'confirmed' && (
                        <div style={{ marginTop: 16, padding: 12, border: '1px solid #1677ff', borderRadius: 6, color: '#0958d9' }}>
                          Đặt đoàn đã được xác nhận. Hẹn gặp quý khách!
                        </div>
                      )}
                      {currentStatus === 'rejected' && statusNote && (
                        <div style={{ marginTop: 16 }}>
                          <Alert
                            type="error"
                            showIcon
                            message="Yêu cầu đặt đoàn đã bị từ chối"
                            description={
                              <div>
                                <div>{statusNote}</div>
                                <div style={{ marginTop: 6, fontSize: 12 }}>
                                  Vui lòng chỉnh sửa thời gian hoặc liên hệ bộ phận đặt phòng để được hỗ trợ thêm.
                                </div>
                              </div>
                            }
                          />
                        </div>
                      )}
                    </div>
                  ) : null}
                  <Space>
                    <Button 
                      icon={<DownloadOutlined />} 
                      onClick={handleDownloadTemplate}
                      disabled={!canProceedPayment}
                      title={!canProceedPayment ? "Chỉ có thể tải mẫu sau khi admin đã báo giá" : ""}
                    >
                      Tải file Excel mẫu
                    </Button>
                    <Upload 
                      {...uploadProps} 
                      onChange={(info) => handleUpload(info.fileList[0]?.originFileObj)}
                      disabled={!canProceedPayment}
                    >
                      <Button 
                        icon={<UploadOutlined />}
                        disabled={!canProceedPayment}
                        title={!canProceedPayment ? "Chỉ có thể upload sau khi admin đã báo giá" : ""}
                      >
                        Upload danh sách đoàn
                      </Button>
                    </Upload>
                  </Space>
                  {!canProceedPayment && (
                    <Alert
                      type="warning"
                      showIcon
                      message="Vui lòng chờ admin báo giá trước khi tải mẫu và upload danh sách"
                      style={{ marginTop: 8 }}
                    />
                  )}
                  {canProceedPayment && (
                    <div style={{ marginTop: 8, padding: 12, background: '#f0f9ff', borderRadius: 6, border: '1px solid #bae6fd' }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Hướng dẫn:</div>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        <li>Tải file Excel mẫu (đã có danh sách phòng được phân bổ)</li>
                        <li>Điền đầy đủ thông tin cho từng thành viên</li>
                        <li>Nhập số phòng cho từng người (ví dụ: Phòng 201, Phòng 103, ...)</li>
                        <li>Upload file đã điền lên hệ thống</li>
                        <li>Sau đó tiến hành thanh toán</li>
                      </ul>
                    </div>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}


