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

    // Tạo mô tả chi tiết bao gồm dịch vụ
    let detailedDescription = description;
    if (services && services.length > 0) {
      detailedDescription += '\n\nDich vu bo sung:';
      services.forEach((service: any) => {
        const serviceName = service.name || 'Dich vu';
        const totalPrice = service.price * service.quantity;
        detailedDescription += `\n- ${serviceName} (x${service.quantity}): ${totalPrice.toLocaleString()} VND`;
      });
    }

    // Tạo 1 line item duy nhất với tổng tiền
    const lineItems = [
      {
        price_data: {
          currency: 'vnd', // Sử dụng VNĐ
          product_data: {
            name: `Dat phong ${roomName}`,
            description: detailedDescription,
          },
          unit_amount: formatPriceForStripe(totalPrice),
        },
        quantity: 1,
      },
    ];

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
