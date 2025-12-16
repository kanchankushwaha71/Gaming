import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    console.log('Simple test API called');
    
    return NextResponse.json({
      success: true,
      message: 'Simple test API is working',
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasResendKey: !!process.env.RESEND_API_KEY,
        hasFromEmail: !!process.env.FROM_EMAIL,
      }
    });

  } catch (error) {
    console.error('Simple test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Simple POST test called with body:', body);
    
    return NextResponse.json({
      success: true,
      message: 'Simple POST test is working',
      receivedData: body,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Simple POST test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
