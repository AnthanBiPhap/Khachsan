"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, Button, message, Result, Typography, Space } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';

export default function GroupBookingSuccessPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gbId, setGbId] = useState<string | null>(null);

  useEffect(() => {
    const gb = sp.get('gb');
    const sessionId = sp.get('session_id');
    if (!gb) return;
    setGbId(gb);
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '') + '/api/v1';
    const markPaid = async () => {
      try {
        const payload: any = {};
        if (sessionId) {
          payload.stripeSessionId = sessionId;
        }
        const res = await fetch(`${API_URL}/group-bookings/${gb}/paid`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t);
        }
        setDone(true);
        message.success('Thanh toán thành công. Đặt đoàn đã được đánh dấu "Đã thanh toán".');
      } catch (e: any) {
        setError(e?.message || 'Không thể cập nhật trạng thái thanh toán');
      }
    };
    markPaid();
  }, [sp]);

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: 16 }}>
      <Card>
        {done ? (
          <Result
            status="success"
            title="Thanh toán thành công"
            subTitle={
              <Typography.Paragraph>
                Cảm ơn bạn. Chúng tôi đã nhận thanh toán cho đặt đoàn{gbId ? ` (${gbId})` : ''}. Vui lòng chờ admin xác nhận hoàn tất.
              </Typography.Paragraph>
            }
            extra={
              <Space>
                <Button type="primary" onClick={() => router.push('/group-booking')}>Quay lại trang đặt đoàn</Button>
                <Button onClick={() => router.push('/')}>Về trang chủ</Button>
              </Space>
            }
            icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
          />
        ) : error ? (
          <Result
            status="error"
            title="Có lỗi xảy ra"
            subTitle={error}
            extra={<Button onClick={() => router.push('/group-booking')}>Quay lại</Button>}
          />
        ) : (
          <Result
            status="info"
            title="Đang cập nhật trạng thái thanh toán..."
            subTitle="Vui lòng đợi trong giây lát."
          />
        )}
      </Card>
    </div>
  );
}


