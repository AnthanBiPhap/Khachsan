import React from 'react';
import { Descriptions, Tag, Card, Timeline, Button, Space, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface Payment {
  _id: string;
  bookingId?: string | any;
  groupBookingId?: {
    _id: string;
    checkIn?: string;
    checkOut?: string;
    requesterName?: string;
    requesterPhone?: string;
    requesterEmail?: string;
    peopleCount?: number;
    roomCount?: number;
    quoteAmount?: number;
    status?: string;
    allocatedRoomIds?: Array<{
      _id: string;
      roomNumber?: string;
      typeId?: {
        name?: string;
        pricePerNight?: number;
      };
    }>;
    members?: Array<{
      fullName?: string;
      idNumber?: string;
      phoneNumber?: string;
      email?: string;
      isLeader?: boolean;
    }>;
  };
  customerId?: string;
  paymentMethod: 'stripe' | 'cash' | 'bank_transfer' | 'other';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  transactionId?: string;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    transactionCode: string;
  };
  cashInfo?: {
    receivedBy: string;
    receivedAt: string;
    notes: string;
  };
  refundInfo?: {
    refundAmount: number;
    refundReason: string;
    refundedAt: string;
    refundedBy: string;
  };
  metadata?: Record<string, any>;
  notes?: string;
  paidAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  booking?: {
    _id: string;
    roomId: {
      roomNumber: string;
      typeId: {
        name: string;
      };
    };
    checkIn: string;
    checkOut: string;
    guests: number;
    totalPrice: number;
  };
  customer?: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
}

interface PaymentDetailsProps {
  payment: Payment;
  onClose: () => void;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ payment, onClose }) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'orange',
      completed: 'green',
      failed: 'red',
      cancelled: 'gray',
      refunded: 'blue',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Chờ xử lý',
      completed: 'Hoàn thành',
      failed: 'Thất bại',
      cancelled: 'Đã hủy',
      refunded: 'Đã hoàn tiền',
    };
    return texts[status] || status;
  };

  const getPaymentMethodText = (method: string) => {
    const texts: Record<string, string> = {
      stripe: 'Stripe',
      cash: 'Tiền mặt',
      bank_transfer: 'Chuyển khoản',
      other: 'Khác',
    };
    return texts[method] || method;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'pending':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getTimelineItems = () => {
    const items = [
      {
        color: 'blue',
        children: (
          <div>
            <div>Tạo thanh toán</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {new Date(payment.createdAt).toLocaleString('vi-VN')}
            </div>
          </div>
        ),
      },
    ];

    if (payment.paidAt) {
      items.push({
        color: payment.status === 'completed' ? 'green' : 'red',
        children: (
          <div>
            <div>
              {payment.status === 'completed' ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {new Date(payment.paidAt).toLocaleString('vi-VN')}
            </div>
          </div>
        ),
      });
    }

    if (payment.refundInfo) {
      items.push({
        color: 'orange',
        children: (
          <div>
            <div>Hoàn tiền</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {new Date(payment.refundInfo.refundedAt).toLocaleString('vi-VN')}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Lý do: {payment.refundInfo.refundReason}
            </div>
          </div>
        ),
      });
    }

    return items;
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Thông tin cơ bản */}
        <Card title="Thông tin thanh toán">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="ID" span={2}>
              {payment._id}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(payment.status)} icon={getStatusIcon(payment.status)}>
                {getStatusText(payment.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức">
              {getPaymentMethodText(payment.paymentMethod)}
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              <strong>{payment.amount.toLocaleString()} {payment.currency}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(payment.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            {payment.paidAt && (
              <Descriptions.Item label="Ngày thanh toán">
                {new Date(payment.paidAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
            )}
            {payment.expiresAt && (
              <Descriptions.Item label="Hết hạn">
                {new Date(payment.expiresAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
            )}
            {payment.transactionId && (
              <Descriptions.Item label="Mã giao dịch">
                {payment.transactionId}
              </Descriptions.Item>
            )}
            {payment.notes && (
              <Descriptions.Item label="Ghi chú" span={2}>
                {payment.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Thông tin khách hàng */}
        {(payment.customer || payment.groupBookingId) && (
          <Card title="Thông tin khách hàng">
            <Descriptions column={2} bordered>
              {payment.groupBookingId ? (
                <>
                  <Descriptions.Item label="Tên">
                    {payment.groupBookingId.requesterName || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {payment.groupBookingId.requesterEmail || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {payment.groupBookingId.requesterPhone || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại">
                    <Tag color="purple">Đặt theo đoàn</Tag>
                  </Descriptions.Item>
                </>
              ) : payment.customer ? (
                <>
                  <Descriptions.Item label="Tên">
                    {payment.customer.fullName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {payment.customer.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {payment.customer.phoneNumber}
                  </Descriptions.Item>
                </>
              ) : null}
            </Descriptions>
          </Card>
        )}

        {/* Thông tin booking / group booking */}
        {payment.groupBookingId ? (
          <Card title="Thông tin đặt đoàn">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Mã đặt đoàn" span={2}>
                <strong>{payment.groupBookingId._id}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Số phòng">
                {payment.groupBookingId.roomCount || 0} phòng
              </Descriptions.Item>
              <Descriptions.Item label="Số người">
                {payment.groupBookingId.peopleCount || 0} người
              </Descriptions.Item>
              <Descriptions.Item label="Nhận phòng">
                {payment.groupBookingId.checkIn ? new Date(payment.groupBookingId.checkIn).toLocaleString('vi-VN') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Trả phòng">
                {payment.groupBookingId.checkOut ? new Date(payment.groupBookingId.checkOut).toLocaleString('vi-VN') : '-'}
              </Descriptions.Item>
              {payment.groupBookingId.allocatedRoomIds && payment.groupBookingId.allocatedRoomIds.length > 0 && (
                <Descriptions.Item label="Phòng đã phân bổ" span={2}>
                  <div>
                    {payment.groupBookingId.allocatedRoomIds.map((room: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: 4 }}>
                        - Phòng {room.roomNumber || room._id} ({room.typeId?.name || '-'})
                        {room.typeId?.pricePerNight && (
                          <span style={{ color: '#666', fontSize: 12 }}>
                            {' '}- {room.typeId.pricePerNight.toLocaleString()} VND/đêm
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </Descriptions.Item>
              )}
              {payment.groupBookingId.members && payment.groupBookingId.members.length > 0 && (
                <Descriptions.Item label="Thành viên đoàn" span={2}>
                  <div>
                    {payment.groupBookingId.members.slice(0, 10).map((member: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: 4, fontSize: 12 }}>
                        {idx + 1}. {member.fullName || '-'}{member.isLeader ? ' (Trưởng đoàn)' : ''}
                        {member.phoneNumber && <span style={{ color: '#666' }}> - {member.phoneNumber}</span>}
                      </div>
                    ))}
                    {payment.groupBookingId.members.length > 10 && (
                      <div style={{ color: '#999', fontSize: 12 }}>
                        ... và {payment.groupBookingId.members.length - 10} thành viên khác
                      </div>
                    )}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        ) : payment.booking ? (
          <Card title="Thông tin đặt phòng">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Mã booking">
                <strong>{payment.booking._id}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Phòng">
                {payment.booking.roomId.roomNumber} - {payment.booking.roomId.typeId.name}
              </Descriptions.Item>
              <Descriptions.Item label="Số khách">
                {payment.booking.guests} người
              </Descriptions.Item>
              <Descriptions.Item label="Nhận phòng">
                {new Date(payment.booking.checkIn).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Trả phòng">
                {new Date(payment.booking.checkOut).toLocaleString('vi-VN')}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        ) : null}

        {/* Thông tin Stripe */}
        {payment.paymentMethod === 'stripe' && (
          <Card title="Thông tin Stripe">
            <Descriptions column={2} bordered>
              {payment.stripeSessionId && (
                <Descriptions.Item label="Session ID">
                  {payment.stripeSessionId}
                </Descriptions.Item>
              )}
              {payment.stripePaymentIntentId && (
                <Descriptions.Item label="Payment Intent ID">
                  {payment.stripePaymentIntentId}
                </Descriptions.Item>
              )}
              {payment.stripeCustomerId && (
                <Descriptions.Item label="Customer ID">
                  {payment.stripeCustomerId}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        {/* Thông tin ngân hàng */}
        {payment.bankInfo && (
          <Card title="Thông tin chuyển khoản">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Ngân hàng">
                {payment.bankInfo.bankName}
              </Descriptions.Item>
              <Descriptions.Item label="Số tài khoản">
                {payment.bankInfo.accountNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Mã giao dịch">
                {payment.bankInfo.transactionCode}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Thông tin tiền mặt */}
        {payment.cashInfo && (
          <Card title="Thông tin tiền mặt">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Người nhận">
                {payment.cashInfo.receivedBy}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian nhận">
                {new Date(payment.cashInfo.receivedAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>
                {payment.cashInfo.notes}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Thông tin hoàn tiền */}
        {payment.refundInfo && (
          <Card title="Thông tin hoàn tiền">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Số tiền hoàn">
                {payment.refundInfo.refundAmount.toLocaleString()} {payment.currency}
              </Descriptions.Item>
              <Descriptions.Item label="Lý do">
                {payment.refundInfo.refundReason}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày hoàn">
                {new Date(payment.refundInfo.refundedAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Người xử lý">
                {payment.refundInfo.refundedBy}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Metadata */}
        {payment.metadata && Object.keys(payment.metadata).length > 0 && (
          <Card title="Thông tin bổ sung">
            <Descriptions column={1} bordered>
              {Object.entries(payment.metadata).map(([key, value]) => (
                <Descriptions.Item key={key} label={key}>
                  {key === 'services' && Array.isArray(value) ? (
                    <div>
                      {value.length === 0 ? (
                        <span style={{ color: '#999' }}>Không có dịch vụ</span>
                      ) : (
                        value.map((service: any, index: number) => (
                          <div key={index} style={{ marginBottom: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                            <div style={{ fontWeight: 500, marginBottom: 4 }}>
                              {service.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              Số lượng: {service.quantity} | Giá: {service.price.toLocaleString()} VND
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              Tổng: {(service.price * service.quantity).toLocaleString()} VND
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    typeof value === 'object' ? JSON.stringify(value) : String(value)
                  )}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Card>
        )}

        {/* Timeline */}
        <Card title="Lịch sử thanh toán">
          <Timeline items={getTimelineItems()} />
        </Card>

        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </Space>
    </div>
  );
};

export default PaymentDetails;
