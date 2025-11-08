import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-10-28.acacia',
});

const GROUP_DEPOSIT_RATE = Number(process.env.NEXT_PUBLIC_GROUP_DEPOSIT_RATE ?? 0.5);
const GROUP_DEPOSIT_PERCENT_LABEL = `${Math.round(GROUP_DEPOSIT_RATE * 100)}%`;

export async function POST(request: NextRequest) {
  try {
    const { groupBookingId, customerEmail } = await request.json();
    if (!groupBookingId) {
      return NextResponse.json({ error: 'Missing groupBookingId' }, { status: 400 });
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const base = API_URL.replace(/\/$/, '') + '/api/v1';

    // Fetch quoteAmount from backend
    const gbRes = await fetch(`${base}/group-bookings/${groupBookingId}`, { cache: 'no-store' });
    if (!gbRes.ok) {
      const t = await gbRes.text();
      return NextResponse.json({ error: `Backend error: ${t}` }, { status: 500 });
    }
    const gbJson = await gbRes.json();
    const gb = gbJson?.data || gbJson;
    const quoteAmount = Number(gb?.quoteAmount || 0);
    if (!quoteAmount || quoteAmount <= 0) {
      return NextResponse.json({ error: 'quoteAmount is missing or invalid' }, { status: 400 });
    }
    const depositAmount = Math.max(1, Math.round(quoteAmount * GROUP_DEPOSIT_RATE));

    const origin = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const successUrl = `${origin}/group-booking/success?gb=${groupBookingId}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/group-booking?cancel=1`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      currency: 'vnd',
      line_items: [
        {
          price_data: {
            currency: 'vnd',
            unit_amount: depositAmount,
            product_data: {
              name: `Đặt cọc ${GROUP_DEPOSIT_PERCENT_LABEL} cho đặt đoàn ${groupBookingId}`,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        groupBookingId,
        quoteAmount: String(quoteAmount),
        depositAmount: String(depositAmount),
        depositRate: String(GROUP_DEPOSIT_RATE),
        depositPercent: GROUP_DEPOSIT_PERCENT_LABEL,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating group checkout session:', error);
    return NextResponse.json({ error: 'Không thể tạo phiên thanh toán' }, { status: 500 });
  }
}


