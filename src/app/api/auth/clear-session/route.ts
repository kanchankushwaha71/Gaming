import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Session cleared' });
  
  // Clear any session cookies
  response.cookies.delete('next-auth.session-token');
  response.cookies.delete('next-auth.csrf-token');
  response.cookies.delete('__Secure-next-auth.session-token');
  response.cookies.delete('__Secure-next-auth.csrf-token');
  
  return response;
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to clear session' }, { status: 405 });
}
