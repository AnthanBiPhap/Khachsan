import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-10-28.acacia',
});

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
            unit_amount: Math.round(quoteAmount),
            product_data: {
              name: `Thanh toán đặt đoàn ${groupBookingId}`,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { groupBookingId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating group checkout session:', error);
    return NextResponse.json({ error: 'Không thể tạo phiên thanh toán' }, { status: 500 });
  }
}


