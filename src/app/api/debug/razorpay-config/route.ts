import { NextResponse } from 'next/server';

export async function GET() {
  const isConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  
  return NextResponse.json({
    configured: isConfigured,
    keyIdPresent: !!process.env.RAZORPAY_KEY_ID,
    keySecretPresent: !!process.env.RAZORPAY_KEY_SECRET,
    mode: process.env.RAZORPAY_KEY_ID?.startsWith('rzp_live') ? 'live' : 'test',
  });
}
