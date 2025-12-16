import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature, verifyPayment } from '@/lib/razorpay';
import { registerForEvent, createEventTicket } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

const verifyEventPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Signature is required'),
  eventId: z.string().min(1, 'Event ID is required'),
  registrationData: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(1, 'Phone is required'),
    ticketType: z.string().min(1, 'Ticket type is required'),
  }),
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const result = verifyEventPaymentSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: result.error.format()
        },
        { status: 400 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      registrationData,
    } = result.data;

    // Verify payment signature
    const isSignatureValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Verify payment with Razorpay API
    const paymentResult = await verifyPayment(razorpay_payment_id);
    
    if (!paymentResult.success || !paymentResult.payment) {
      return NextResponse.json(
        { error: 'Payment verification failed', details: paymentResult.error },
        { status: 400 }
      );
    }

    const payment = paymentResult.payment;
    
    // Check if payment is captured/successful
    if (payment.status !== 'captured') {
      return NextResponse.json(
        { error: 'Payment not completed', status: payment.status },
        { status: 400 }
      );
    }

    // Create event registration
    try {
      const eventRegistrationData = {
        ...registrationData,
        eventId,
        userId: session.user.id || session.user.email,
        paymentStatus: 'paid',
        paymentId: razorpay_payment_id,
        registrationDate: new Date().toISOString(),
      };

      const registrationResult = await registerForEvent(eventId, eventRegistrationData);
      
      if (!registrationResult.registration?.id) {
        throw new Error('Failed to create registration');
      }

      // Create event ticket
      const ticketData = {
        registrationId: registrationResult.registration.id,
        eventId,
        ticketType: registrationData.ticketType,
        ticketNumber: `EPIC-${Date.now()}`,
        issuedDate: new Date().toISOString(),
        status: 'confirmed',
        paymentId: razorpay_payment_id,
      };

      const ticketResult = await createEventTicket(ticketData);

      return NextResponse.json({
        success: true,
        message: 'Event registration and payment completed successfully',
        registration: registrationResult.registration,
        ticket: ticketResult.ticket,
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          created_at: payment.created_at,
        },
      });

    } catch (registrationError) {
      console.error('Error creating registration after payment:', registrationError);
      // Payment was successful but registration failed
      // This should be handled carefully - maybe add to a queue for retry
      return NextResponse.json(
        { 
          error: 'Payment successful but registration failed. Please contact support.',
          paymentId: razorpay_payment_id 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in verify-event-payment API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 