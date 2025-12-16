import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, EmailTemplates } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    console.log('=== Direct Email Test ===');
    
    const { subject, message, email } = await req.json();

    if (!subject || !message || !email) {
      return NextResponse.json({ 
        error: 'Subject, message, and email are required',
        example: {
          subject: 'Test Email',
          message: 'This is a test message',
          email: 'your-email@example.com'
        }
      }, { status: 400 });
    }

    console.log(`Sending email to: ${email}`);
    console.log(`Subject: ${subject}`);

    // Create email template
    const emailTemplate = EmailTemplates.customNotification(
      'Test User',
      subject,
      message,
      'Test Tournament'
    );

    // Send email
    const emailResult = await sendEmail({
      to: [email],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    });

    if (emailResult.success) {
      console.log('✅ Email sent successfully');
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully!',
        emailId: (emailResult.data as any)?.id || 'unknown',
        recipient: email,
        subject: subject
      });
    } else {
      console.error('❌ Email sending failed:', emailResult.error);
      return NextResponse.json({
        success: false,
        error: 'Failed to send email: ' + emailResult.error?.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Direct email test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + error.message
    }, { status: 500 });
  }
}
