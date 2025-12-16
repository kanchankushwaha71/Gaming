import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

const createEventOrderSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  eventId: z.string().min(1, 'Event ID is required'),
  ticketType: z.string().min(1, 'Ticket type is required'),
  attendeeName: z.string().min(1, 'Attendee name is required'),
  currency: z.string().optional().default('INR'),
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
    const result = createEventOrderSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: result.error.format()
        },
        { status: 400 }
      );
    }

    const { amount, eventId, ticketType, attendeeName, currency } = result.data;

    // Create Razorpay order
    const orderResult = await createRazorpayOrder({
      amount,
      currency,
      receipt: `event_${eventId}_${Date.now()}`,
      notes: {
        eventId,
        ticketType,
        attendeeName,
        userId: session.user.id || session.user.email || '',
        type: 'event_registration',
      },
    });

    if (!orderResult.success || !orderResult.order) {
      return NextResponse.json(
        { error: 'Failed to create payment order', details: orderResult.error },
        { status: 500 }
      );
    }

    // Return order details (excluding sensitive information)
    return NextResponse.json({
      success: true,
      order: {
        id: orderResult.order.id,
        amount: orderResult.order.amount,
        currency: orderResult.order.currency,
        receipt: orderResult.order.receipt,
      },
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('Error in create-event-order API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 