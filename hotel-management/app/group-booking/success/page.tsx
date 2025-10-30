"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, Button, message } from 'antd';

export default function GroupBookingSuccessPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const gb = sp.get('gb');
    if (!gb) return;
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '') + '/api/v1';
    const markPaid = async () => {
      try {
        const res = await fetch(`${API_URL}/group-bookings/${gb}/paid`, { method: 'POST' });
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
      <Card title="Thanh toán thành công">
        {done ? (
          <>
            <p>Cảm ơn bạn. Chúng tôi đã nhận thanh toán cho đặt đoàn.</p>
            <Button type="primary" onClick={() => router.push('/group-booking')}>Quay lại trang đặt đoàn</Button>
          </>
        ) : error ? (
          <>
            <p style={{ color: 'red' }}>{error}</p>
            <Button onClick={() => router.push('/group-booking')}>Quay lại</Button>
          </>
        ) : (
          <p>Đang cập nhật trạng thái thanh toán...</p>
        )}
      </Card>
    </div>
  );
}


