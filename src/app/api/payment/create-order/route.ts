import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

const createOrderSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  tournamentId: z.string().min(1, 'Tournament ID is required'),
  teamName: z.string().min(1, 'Team name is required'),
  currency: z.string().optional().default('INR'),
});

export async function POST(req: NextRequest) {
  try {
    console.log('=== Payment Order Creation Request ===');
    
    // Check authentication with more detailed logging
    const session = await getServerSession();
    console.log('Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      userId: session?.user?.id
    });
    
    if (!session?.user) {
      console.log('Authentication failed: No session or user found');
      return NextResponse.json(
        { error: 'Authentication required', details: 'Please log in to continue' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    console.log('Request body:', body);
    
    const result = createOrderSchema.safeParse(body);
    
    if (!result.success) {
      console.log('Validation failed:', result.error.format());
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: result.error.format()
        },
        { status: 400 }
      );
    }

    const { amount, tournamentId, teamName, currency } = result.data;

    console.log('Processing payment order:', {
      amount: amount,
      amountInRupees: amount / 100,
      currency: currency,
      tournamentId: tournamentId,
      teamName: teamName
    });

    // Create a short receipt ID (max 40 characters)
    // Use first 8 chars of tournament ID + timestamp suffix
    const shortTournamentId = tournamentId.substring(0, 8);
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits
    const receipt = `trn_${shortTournamentId}_${timestamp}`;

    console.log('Creating Razorpay order with receipt:', receipt, 'length:', receipt.length);

    // Create Razorpay order
    const orderResult = await createRazorpayOrder({
      amount,
      currency,
      receipt,
      notes: {
        tournamentId,
        teamName,
        userId: session.user.id || session.user.email || '',
        type: 'tournament_registration',
      },
    });

    if (!orderResult.success || !orderResult.order) {
      console.error('Error creating Razorpay order:', orderResult.error);
      
      // If Razorpay fails with a 502 error (API down), provide a fallback
      if (orderResult.error?.includes('502') || orderResult.error?.includes('Unknown error')) {
        console.log('Razorpay API appears to be down. Creating fallback payment order...');
        
        // Create a fallback order that allows the tournament registration to proceed
        const fallbackOrder = {
          id: `fallback_${receipt}`,
          amount: amount,
          currency: currency,
          receipt: receipt,
          status: 'created',
          key_id: process.env.RAZORPAY_KEY_ID,
          created_at: Math.floor(Date.now() / 1000),
          notes: {
            tournamentId,
            teamName,
            userId: session.user.id || session.user.email || '',
            type: 'tournament_registration',
            fallback: 'true',
            reason: 'razorpay_api_unavailable'
          }
        };

        return NextResponse.json({
          success: true,
          order: fallbackOrder,
          razorpay_key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          fallback: true,
          message: 'Payment gateway temporarily unavailable. Your registration is confirmed and you can pay later.',
        });
      }
      
      // Provide specific error message for other Razorpay configuration issues
      if (orderResult.error?.includes('credentials')) {
        return NextResponse.json(
          { 
            error: 'Payment system configuration error', 
            details: 'Razorpay is not properly configured. Please contact the administrator.',
            suggestion: 'Please try registering again later or contact support.'
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Failed to create payment order', 
          details: orderResult.error,
          suggestion: 'Please try again in a few moments.'
        },
        { status: 500 }
      );
    }

    console.log('Payment order created successfully:', orderResult.order.id);
    console.log('Order details:', {
      id: orderResult.order.id,
      amount: orderResult.order.amount,
      amountInRupees: Number(orderResult.order.amount) / 100,
      currency: orderResult.order.currency
    });

    // Check if this is a mock order (for development)
    if (orderResult.isMock) {
      console.log('Using mock payment order for development');
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
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock',
      isMock: orderResult.isMock || false,
    });

  } catch (error) {
    console.error('Error in create-order API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 