"use client";

import { useEffect, useMemo, useState } from 'react';
import { DatePicker, Input, InputNumber, Button, message, Card, Space, Upload, Tabs } from 'antd';
import dayjs from 'dayjs';
import type { UploadProps } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { groupBookingService } from '@/services/groupBookingService';

type GroupBookingStatus =
  | 'pending_approval'
  | 'approved'
  | 'info_uploaded'
  | 'quoted'
  | 'awaiting_payment'
  | 'paid'
  | 'confirmed'
  | 'cancelled';

export default function GroupBookingPage() {
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [requestId, setRequestId] = useState<string>("");
  const [createdId, setCreatedId] = useState<string>("");
  const [currentStatus, setCurrentStatus] = useState<GroupBookingStatus | ''>('');
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [quoteAmount, setQuoteAmount] = useState<number | null>(null);
  const [paymentLink, setPaymentLink] = useState<string | "">("");

  // Form state
  const [requesterName, setRequesterName] = useState("");
  const [requesterPhone, setRequesterPhone] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [checkIn, setCheckIn] = useState<dayjs.Dayjs | null>(null);
  const [checkOut, setCheckOut] = useState<dayjs.Dayjs | null>(null);
  const [peopleCount, setPeopleCount] = useState<number>(10);
  const [roomCount, setRoomCount] = useState<number>(3);
  const [notes, setNotes] = useState("");

  const handleCreate = async () => {
    if (!requesterName || !requesterPhone || !checkIn || !checkOut) {
      message.warning('Vui lòng nhập đủ tên, điện thoại, ngày vào/ra.');
      return;
    }
    setLoadingCreate(true);
    try {
      const payload = {
        requesterName,
        requesterPhone,
        requesterEmail: requesterEmail || undefined,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        peopleCount,
        roomCount,
        notes: notes || undefined,
      };
      const data = await groupBookingService.createRequest(payload);
      const id = data?._id || "";
      setCreatedId(id);
      setRequestId(id);
      // persist to localStorage to restore after reload
      if (id) {
        localStorage.setItem('group_booking_request_id', id);
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
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      // ignore errors in background polling but show a small hint
      console.debug('Poll error', e);
    } finally {
      setIsPolling(false);
    }
  };

  // Restore existing request from localStorage on mount
  useEffect(() => {
    const savedId = typeof window !== 'undefined' ? localStorage.getItem('group_booking_request_id') : null;
    if (savedId) {
      setRequestId(savedId);
      setCreatedId(savedId);
      fetchStatus(savedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto poll status every 15s when we have a requestId
  useEffect(() => {
    if (!requestId) return;
    const interval = setInterval(() => fetchStatus(requestId), 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

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
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Card title="Đặt phòng theo tour (Group Booking)">
        <p style={{ marginBottom: 12 }}>
          Quy trình: Gửi yêu cầu → Admin duyệt → Tải mẫu và upload danh sách → Nhận báo giá/Thanh toán → Xác nhận.
        </p>
        <Tabs
          items={[
            {
              key: 'request',
              label: '1) Gửi yêu cầu',
              children: (
                <Space direction="vertical" size={12} style={{ width: 600, maxWidth: '100%' }}>
                  <Input placeholder="Tên người liên hệ" value={requesterName} onChange={(e) => setRequesterName(e.target.value)} />
                  <Input placeholder="Số điện thoại" value={requesterPhone} onChange={(e) => setRequesterPhone(e.target.value)} />
                  <Input placeholder="Email (không bắt buộc)" value={requesterEmail} onChange={(e) => setRequesterEmail(e.target.value)} />
                  <Space>
                    <DatePicker placeholder="Ngày check-in" value={checkIn} onChange={setCheckIn} />
                    <DatePicker placeholder="Ngày check-out" value={checkOut} onChange={setCheckOut} />
                  </Space>
                  <Space>
                    <InputNumber min={1} placeholder="Số khách" value={peopleCount} onChange={(v) => setPeopleCount(v || 1)} />
                    <InputNumber min={1} placeholder="Số phòng" value={roomCount} onChange={(v) => setRoomCount(v || 1)} />
                  </Space>
                  <Input.TextArea rows={3} placeholder="Ghi chú" value={notes} onChange={(e) => setNotes(e.target.value)} />
                  <Button type="primary" loading={loadingCreate} onClick={handleCreate}>Gửi yêu cầu</Button>
                  {createdId ? (
                    <div>
                      Mã yêu cầu của bạn: <b>{createdId}</b>
                      {currentStatus ? (
                        <span style={{ marginLeft: 12 }}>
                          Trạng thái: <b>{currentStatus}</b>
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
                <Space direction="vertical" size={12} style={{ width: 600, maxWidth: '100%' }}>
                  <Input placeholder="Nhập mã yêu cầu (ID)" value={requestId} onChange={(e) => setRequestId(e.target.value)} />
                  {requestId ? (
                    <div>
                      Trạng thái hiện tại: <b>{currentStatus || 'đang kiểm tra...'}</b>
                      {lastUpdated ? <em style={{ marginLeft: 8, color: '#888' }}>(cập nhật: {lastUpdated}{isPolling ? ', đang kiểm tra...' : ''})</em> : null}
                      <div style={{ marginTop: 8 }}>
                        <Button size="small" onClick={() => fetchStatus(requestId)} loading={isPolling}>Kiểm tra ngay</Button>
                        <Button size="small" style={{ marginLeft: 8 }} onClick={() => { localStorage.removeItem('group_booking_request_id'); setCreatedId(''); setCurrentStatus(''); setRequestId(''); }}>Xóa mã lưu</Button>
                      </div>
                      {(currentStatus === 'quoted' || currentStatus === 'awaiting_payment') && (
                        <div style={{ marginTop: 16, padding: 12, border: '1px dashed #d9d9d9', borderRadius: 6 }}>
                          <div><b>Báo giá:</b> {quoteAmount != null ? `${quoteAmount.toLocaleString()} VND` : 'Đang cập nhật'}</div>
                          <div style={{ marginTop: 8 }}>
                            <Button type="primary" onClick={handlePayNow}>Thanh toán</Button>
                          </div>
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
                    </div>
                  ) : null}
                  <Space>
                    <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>Tải file Excel mẫu</Button>
                    <Upload {...uploadProps} onChange={(info) => handleUpload(info.fileList[0]?.originFileObj)}>
                      <Button icon={<UploadOutlined />}>Upload danh sách đoàn</Button>
                    </Upload>
                  </Space>
                  <div>
                    Sau khi upload, admin sẽ gửi báo giá hoặc link thanh toán. Vui lòng theo dõi email/điện thoại.
                  </div>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </Space>
  );
}


