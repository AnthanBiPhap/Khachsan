'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { message, Button } from 'antd';
import { CheckCircleOutlined, LoadingOutlined, PrinterOutlined } from '@ant-design/icons';

export default function StripeSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [isProcessing, setIsProcessing] = useState(true);
  const [bookingData, setBookingData] = useState<any>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  const hasCreated = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      message.error('Không tìm thấy session thanh toán');
      setIsProcessing(false);
      return;
    }

    if (hasCreated.current) return;
    hasCreated.current = true;

    const storedBookingData = localStorage.getItem('stripe_booking_data');
    if (!storedBookingData) {
      message.error('Không tìm thấy thông tin đặt phòng');
      setIsProcessing(false);
      return;
    }

    try {
      const bookingInfo = JSON.parse(storedBookingData);
      setBookingData(bookingInfo);
      createBooking(bookingInfo, sessionId);
    } catch (error) {
      console.error('Error parsing booking data:', error);
      message.error('Có lỗi xảy ra khi xử lý thông tin đặt phòng');
      setIsProcessing(false);
    }
  }, [sessionId]);

  const createBooking = async (bookingInfo: any, sessionId: string) => {
    try {
      const payload = {
        roomId: bookingInfo.roomId,
        checkIn: bookingInfo.checkIn,
        checkOut: bookingInfo.checkOut,
        extendHours: bookingInfo.extraHours || 0,
        actualCheckOut: bookingInfo.actualCheckOut,
        guests: bookingInfo.guests,
        totalPrice: bookingInfo.totalPrice,
        status: 'pending',
        paymentStatus: 'partial_paid', // Chỉ thanh toán 50%
        services: bookingInfo.services || [],
        customerId: bookingInfo.customerId,
        stripeSessionId: sessionId,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const data = await res.json();
      const { booking, invoice } = data?.data;

      // Tạo payment record trong database
      if (booking?._id) {
        try {
          const paymentPayload = {
            bookingId: booking._id,
            customerId: bookingInfo.customerId,
            paymentMethod: 'stripe',
            amount: bookingInfo.totalPrice,
            currency: 'VND',
            stripeSessionId: sessionId,
            status: 'completed',
            paidAt: new Date().toISOString(),
            metadata: {
              roomName: bookingInfo.roomName,
              checkIn: bookingInfo.checkIn,
              checkOut: bookingInfo.checkOut,
              guests: bookingInfo.guests,
              services: bookingInfo.services || [],
            },
            notes: 'Thanh toán qua Stripe Checkout',
          };

          const paymentRes = await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentPayload),
          });

          if (paymentRes.ok) {
            console.log('✅ Payment record created successfully');
          } else {
            console.warn('⚠️ Failed to create payment record, but booking was created');
          }
        } catch (paymentError) {
          console.warn('⚠️ Error creating payment record:', paymentError);
          // Không throw error vì booking đã được tạo thành công
        }
      }

      setInvoiceId(invoice?._id || null);
      message.success('Thanh toán & đặt phòng thành công!', 5);
      setIsProcessing(false);
      localStorage.removeItem('stripe_booking_data');

      // ✅ Nếu muốn auto về trang chủ thì bật dòng này
      // setTimeout(() => router.push('/'), 8000);

    } catch (err) {
      console.error(err);
      message.error('Không thể tạo booking. Vui lòng thử lại.');
      setIsProcessing(false);
    }
  };

  const handlePrintInvoice = () => {
    if (!invoiceId) return message.warning('Không có hóa đơn để in');
    window.open(`/api/invoices/${invoiceId}/print`, '_blank');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <p className="mt-4 text-lg">Đang xử lý đặt phòng...</p>
          <p className="text-gray-600">Vui lòng không đóng trang này</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
        <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          Thanh toán thành công!
        </h1>
        <p className="text-gray-600 mt-2">
          Thanh toán test Stripe đã hoàn tất, hệ thống đã ghi nhận đặt phòng.
        </p>

        {bookingData && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-700">
              <strong>Phòng:</strong> {bookingData.roomName}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Tổng tiền:</strong>{' '}
              {bookingData.totalPrice?.toLocaleString()} VNĐ
            </p>
          </div>
        )}

        {invoiceId && (
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrintInvoice}
            className="mt-5"
          >
            In hóa đơn
          </Button>
        )}

        <p className="text-sm text-gray-500 mt-4">
          Bạn có thể in hóa đơn hoặc trở về trang chủ.
        </p>
      </div>
    </div>
  );
}
