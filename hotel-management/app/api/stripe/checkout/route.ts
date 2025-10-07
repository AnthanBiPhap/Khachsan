import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { formatPriceForStripe, createProductDescription } from '@/lib/stripe';

// Khởi tạo Stripe với secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_secret_key_here', {
  apiVersion: '2024-10-28.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      roomId,
      roomName,
      totalPrice,
      checkIn,
      checkOut,
      guests,
      nights,
      customerEmail,
      customerId,
      services
    } = body;

    // Tạo mô tả sản phẩm
    const description = createProductDescription(roomName, nights, guests);

    // Tạo danh sách line items cho Stripe
    const lineItems = [
      {
        price_data: {
          currency: 'vnd', // Sử dụng VNĐ
          product_data: {
            name: `Đặt phòng ${roomName}`,
            description: description,
          },
          unit_amount: formatPriceForStripe(totalPrice),
        },
        quantity: 1,
      },
    ];

    // Thêm dịch vụ nếu có
    if (services && services.length > 0) {
      services.forEach((service: any) => {
        lineItems.push({
          price_data: {
            currency: 'vnd',
            product_data: {
              name: service.name,
              description: `Dịch vụ bổ sung - Số lượng: ${service.quantity}`,
            },
            unit_amount: formatPriceForStripe(service.price * service.quantity),
          },
          quantity: 1,
        });
      });
    }

    // Tạo Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/stripe/cancel`,
      metadata: {
        roomId,
        customerId,
        checkIn,
        checkOut,
        guests: guests.toString(),
        nights: nights.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    return NextResponse.json(
      { error: 'Không thể tạo phiên thanh toán' },
      { status: 500 }
    );
  }
}
