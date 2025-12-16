import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    console.log('=== Test Email API Called ===');
    
    // Check environment variables
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    
    console.log('Environment check:', {
      hasResendKey: !!resendKey,
      resendKeyLength: resendKey?.length || 0,
      fromEmail,
      nodeEnv: process.env.NODE_ENV
    });

    if (!resendKey || resendKey === 'dummy-key-for-build') {
      return NextResponse.json({ 
        error: 'Resend API key not configured',
        details: 'Please set RESEND_API_KEY in your environment variables'
      }, { status: 500 });
    }

    if (!fromEmail) {
      return NextResponse.json({ 
        error: 'FROM_EMAIL not configured',
        details: 'Please set FROM_EMAIL in your environment variables'
      }, { status: 500 });
    }

    // Send test email
    const testEmailResult = await sendEmail({
      to: ['test@example.com'], // This will fail but we can see the error
      subject: '🧪 Test Email from EpicEsports',
      html: '<h1>Test Email</h1><p>This is a test email to verify the email system is working.</p>',
      text: 'Test Email\n\nThis is a test email to verify the email system is working.'
    });

    console.log('Test email result:', testEmailResult);

    return NextResponse.json({
      success: true,
      message: 'Email system test completed',
      environment: {
        hasResendKey: !!resendKey,
        fromEmail,
        nodeEnv: process.env.NODE_ENV
      },
      testResult: testEmailResult
    });

  } catch (error) {
    console.error('❌ Test email API error:', error);
    return NextResponse.json({ 
      error: 'Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
