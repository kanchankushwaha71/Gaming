import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Test payment endpoint',
    razorpayConfigured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
  });
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Test payment endpoint - POST',
  });
}
