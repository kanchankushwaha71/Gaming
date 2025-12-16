import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Razorpay simple test endpoint',
    keyPresent: !!process.env.RAZORPAY_KEY_ID,
    secretPresent: !!process.env.RAZORPAY_KEY_SECRET,
  });
}
